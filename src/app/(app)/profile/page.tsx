"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { User, Lock, Save, Users, Plus, Edit, Trash2, Bell } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { ProfileAnimate } from "@/components/ui/PageAnimations";
import PasswordStrength from "@/components/ui/PasswordStrength";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

interface Profile {
    name: string;
    email: string;
    dob: string;
    gender: string;
    phone: string;
    aadhaarNo: string;
    income: string;
    occupation: string;
    state: string;
    address: string;
}

interface FamilyMember {
    id: string;
    name: string;
    dob: string | null;
    gender: string | null;
    relation: string;
    aadhaarNo: string | null;
    income: string | null;
    occupation: string | null;
}

const Field = ({ id, label, type = "text", value, onChange, placeholder, disabled }: {
    id: string; label: string; type?: string; value: string;
    onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
}) => (
    <div className="input-group">
        <label className="label" htmlFor={id}>{label}</label>
        <input id={id} type={type} className="input" value={value}
            onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} />
    </div>
);

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<"personal" | "family" | "settings">("personal");

    const [profile, setProfile] = useState<Profile>({
        name: "", email: "", dob: "", gender: "", phone: "",
        aadhaarNo: "", income: "", occupation: "", state: "", address: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Password change
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwLoading, setPwLoading] = useState(false);

    // Family
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [familyLoading, setFamilyLoading] = useState(true);
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [familyForm, setFamilyForm] = useState({
        name: "", relation: "", dob: "", gender: "", aadhaarNo: "", income: "", occupation: ""
    });

    // Push Notifications
    const [pushEnabled, setPushEnabled] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        fetch("/api/profile")
            .then((r) => r.json())
            .then((data) => {
                if (data.user) {
                    const u = data.user;
                    setProfile({
                        name: u.name ?? "",
                        email: u.email ?? "",
                        dob: u.dob ? u.dob.slice(0, 10) : "",
                        gender: u.gender ?? "",
                        phone: u.phone ?? "",
                        aadhaarNo: u.aadhaarNo ?? "",
                        income: u.income?.toString() ?? "",
                        occupation: u.occupation ?? "",
                        state: u.state ?? "",
                        address: u.address ?? "",
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));

        fetch("/api/family")
            .then(r => r.json())
            .then(data => {
                if (data.familyMembers) setFamilyMembers(data.familyMembers);
                setFamilyLoading(false);
            })
            .catch(() => setFamilyLoading(false));

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg) {
                    reg.pushManager.getSubscription().then(sub => {
                        if (sub) setPushEnabled(true);
                    });
                }
            });
        }
    }, []);

    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    async function subscribeToPush() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast.error("Push notifications are not supported by your browser");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            toast.error("Permission denied for notifications");
            return;
        }

        setSubscribing(true);
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidPublicKey) {
                toast.error("VAPID Key not configured");
                setSubscribing(false);
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });

            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription })
            });

            if (res.ok) {
                toast.success("Successfully subscribed to notifications");
                setPushEnabled(true);
            } else {
                toast.error("Failed to save subscription");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during subscription");
        } finally {
            setSubscribing(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...profile,
                    income: profile.income ? parseFloat(profile.income) : undefined,
                    dob: profile.dob || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) toast.error(data.error ?? "Failed to save profile");
            else toast.success("Profile updated successfully!");
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    async function handlePasswordChange() {
        if (!oldPassword || !newPassword) { toast.error("Please fill in all password fields"); return; }
        if (newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
        if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }

        setPwLoading(true);
        try {
            const res = await fetch("/api/profile/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) toast.error(data.error ?? "Failed to change password");
            else {
                toast.success("Password changed successfully!");
                setOldPassword(""); setNewPassword(""); setConfirmPassword("");
            }
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setPwLoading(false);
        }
    }

    async function handleSaveFamily() {
        if (!familyForm.name || !familyForm.relation) { toast.error("Name and relation are required"); return; }

        const method = editingMemberId ? "PATCH" : "POST";
        const url = editingMemberId ? `/api/family/${editingMemberId}` : "/api/family";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(familyForm)
            });
            const data = await res.json();
            if (!res.ok) toast.error(data.error ?? "Failed to save family member");
            else {
                toast.success("Family member saved successfully");
                setShowFamilyModal(false);
                setEditingMemberId(null);
                setFamilyForm({ name: "", relation: "", dob: "", gender: "", aadhaarNo: "", income: "", occupation: "" });

                // Refresh family list
                fetch("/api/family").then(r => r.json()).then(d => {
                    if (d.familyMembers) setFamilyMembers(d.familyMembers);
                });
            }
        } catch {
            toast.error("Something went wrong");
        }
    }

    async function handleDeleteFamily(id: string) {
        if (!confirm("Are you sure you want to remove this family member?")) return;
        try {
            const res = await fetch(`/api/family/${id}`, { method: "DELETE" });
            if (!res.ok) toast.error("Failed to delete");
            else {
                toast.success("Family member removed");
                setFamilyMembers(prev => prev.filter(m => m.id !== id));
            }
        } catch {
            toast.error("Something went wrong");
        }
    }

    function openEditFamily(m: FamilyMember) {
        setEditingMemberId(m.id);
        setFamilyForm({
            name: m.name,
            relation: m.relation,
            dob: m.dob ? m.dob.slice(0, 10) : "",
            gender: m.gender ?? "",
            aadhaarNo: m.aadhaarNo ?? "",
            income: m.income?.toString() ?? "",
            occupation: m.occupation ?? ""
        });
        setShowFamilyModal(true);
    }

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
                <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#1a38f5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
        );
    }

    return (
        <ProfileAnimate>
            <div style={{ maxWidth: 680 }}>
                <div style={{ marginBottom: 28 }}>
                    <h1 className="page-title">Edit Profile</h1>
                    <p className="page-subtitle">Keep your information up to date for accurate scheme matching.</p>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 24, borderBottom: "1px solid #e5e7eb", marginBottom: 24 }}>
                    <button
                        onClick={() => setActiveTab("personal")}
                        style={{
                            padding: "10px 4px", fontSize: 14, fontWeight: 600,
                            color: activeTab === "personal" ? "#1a38f5" : "#6b7280",
                            borderBottom: activeTab === "personal" ? "2px solid #1a38f5" : "2px solid transparent",
                            background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer"
                        }}
                    >
                        Personal Information
                    </button>
                    <button
                        onClick={() => setActiveTab("family")}
                        style={{
                            padding: "10px 4px", fontSize: 14, fontWeight: 600,
                            color: activeTab === "family" ? "#1a38f5" : "#6b7280",
                            borderBottom: activeTab === "family" ? "2px solid #1a38f5" : "2px solid transparent",
                            background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer"
                        }}
                    >
                        Family Members
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        style={{
                            padding: "10px 4px", fontSize: 14, fontWeight: 600,
                            color: activeTab === "settings" ? "#1a38f5" : "#6b7280",
                            borderBottom: activeTab === "settings" ? "2px solid #1a38f5" : "2px solid transparent",
                            background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer"
                        }}
                    >
                        Account Settings
                    </button>
                </div>

                {activeTab === "settings" && (
                    <div className="space-y-6">
                        <div className="card">
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e8ecff", color: "#1a38f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Bell size={18} />
                                </div>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Push Notifications</h2>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                Receive native device notifications when a new scheme alert is published, or when your application is approved.
                            </p>
                            {pushEnabled ? (
                                <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 p-3 rounded-lg border border-green-100">
                                    <Bell size={18} /> Notifications Active on this Device
                                </div>
                            ) : (
                                <button
                                    onClick={subscribeToPush}
                                    disabled={subscribing}
                                    className="btn-primary"
                                >
                                    {subscribing ? "Subscribing..." : "Enable Push Notifications"}
                                </button>
                            )}
                        </div>
                        {/* Re-using the Password Card logic inside settings */}
                        <div className="card mt-6">
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Lock size={18} />
                                </div>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Security</h2>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <Field id="oldPassword" label="Current Password" type="password" value={oldPassword} onChange={setOldPassword} />
                                <div>
                                    <Field id="newPassword" label="New Password" type="password" value={newPassword} onChange={setNewPassword} placeholder="Min 8 characters" />
                                    <PasswordStrength password={newPassword} />
                                </div>
                                <Field id="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
                                <button className="btn-primary" style={{ background: "#e11d48" }} onClick={handlePasswordChange} disabled={pwLoading}>
                                    {pwLoading ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "personal" && (
                    <>
                        {/* Profile Card */}
                        <div className="card" style={{ marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e8ecff", color: "#1a38f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <User size={18} />
                                </div>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Personal Information</h2>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <Field id="p-name" label="Full Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} placeholder="Rahul Sharma" />
                                <Field id="p-email" label="Email Address" value={profile.email} onChange={() => { }} disabled placeholder="Email (read-only)" />
                                <Field id="p-dob" label="Date of Birth" type="date" value={profile.dob} onChange={(v) => setProfile({ ...profile, dob: v })} />
                                <div className="input-group">
                                    <label className="label" htmlFor="p-gender">Gender</label>
                                    <select id="p-gender" className="input" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                                        <option value="">Select</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                                    </select>
                                </div>
                                <Field id="p-phone" label="Phone Number" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} placeholder="10-digit number" />
                                <Field id="p-aadhaar" label="Aadhaar Number" value={profile.aadhaarNo} onChange={(v) => setProfile({ ...profile, aadhaarNo: v })} placeholder="12-digit number" />
                                <Field id="p-income" label="Annual Income (₹)" type="number" value={profile.income} onChange={(v) => setProfile({ ...profile, income: v })} placeholder="e.g. 150000" />
                                <Field id="p-occupation" label="Occupation" value={profile.occupation} onChange={(v) => setProfile({ ...profile, occupation: v })} placeholder="e.g. Farmer" />
                                <div className="input-group">
                                    <label className="label" htmlFor="p-state">State</label>
                                    <select id="p-state" className="input" value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })}>
                                        <option value="">Select state</option>
                                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginTop: 16 }}>
                                <label className="label" htmlFor="p-address">Address</label>
                                <textarea id="p-address" className="input" placeholder="Village/Town, District" rows={2}
                                    value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} style={{ resize: "vertical" }} />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                                <button id="save-profile-btn" onClick={handleSave} disabled={saving} className="btn-primary" style={{ gap: 6 }}>
                                    <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
                                </button>
                            </div>
                        </div>

                    </>
                )}

                {activeTab === "family" && (
                    <div className="card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e8efff", color: "#1a38f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Users size={18} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Family Profile</h2>
                                    <p style={{ fontSize: 13, color: "#6b7280" }}>{familyMembers.length}/10 members added</p>
                                </div>
                            </div>
                            <button
                                className="btn-primary"
                                style={{ padding: "6px 12px", fontSize: 13 }}
                                onClick={() => {
                                    setEditingMemberId(null);
                                    setFamilyForm({ name: "", relation: "", dob: "", gender: "", aadhaarNo: "", income: "", occupation: "" });
                                    setShowFamilyModal(true);
                                }}
                                disabled={familyMembers.length >= 10}
                            >
                                <Plus size={14} /> Add Member
                            </button>
                        </div>

                        {familyLoading ? (
                            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading...</div>
                        ) : familyMembers.length === 0 ? (
                            <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed #d1d5db", borderRadius: 8 }}>
                                <Users size={32} style={{ margin: "0 auto 12px", color: "#9ca3af" }} />
                                <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No family members added</p>
                                <p style={{ fontSize: 13, color: "#6b7280" }}>Add family members to check scheme eligibility for them.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {familyMembers.map(m => (
                                    <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                <strong style={{ color: "#111827" }}>{m.name}</strong>
                                                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", background: "#f3f4f6", color: "#4b5563", borderRadius: 99 }}>
                                                    {m.relation}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#6b7280" }}>
                                                {m.dob && <span>{new Date().getFullYear() - new Date(m.dob).getFullYear()} yrs</span>}
                                                {m.occupation && <span>• {m.occupation}</span>}
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <button
                                                onClick={() => openEditFamily(m)}
                                                style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4 }}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFamily(m.id)}
                                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <Modal
                    isOpen={showFamilyModal}
                    onClose={() => setShowFamilyModal(false)}
                    title={editingMemberId ? "Edit Family Member" : "Add Family Member"}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="input-group">
                                <label className="label">Full Name *</label>
                                <input className="input" value={familyForm.name} onChange={e => setFamilyForm({ ...familyForm, name: e.target.value })} placeholder="e.g. Amit Kumar" />
                            </div>
                            <div className="input-group">
                                <label className="label">Relation *</label>
                                <select className="input" value={familyForm.relation} onChange={e => setFamilyForm({ ...familyForm, relation: e.target.value })}>
                                    <option value="">Select relation</option>
                                    <option value="spouse">Spouse</option>
                                    <option value="child">Child</option>
                                    <option value="parent">Parent</option>
                                    <option value="sibling">Sibling</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="label">Date of Birth</label>
                                <input type="date" className="input" value={familyForm.dob} onChange={e => setFamilyForm({ ...familyForm, dob: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="label">Gender</label>
                                <select className="input" value={familyForm.gender} onChange={e => setFamilyForm({ ...familyForm, gender: e.target.value })}>
                                    <option value="">Select gender</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="label">Aadhaar No</label>
                                <input className="input" value={familyForm.aadhaarNo} onChange={e => setFamilyForm({ ...familyForm, aadhaarNo: e.target.value })} placeholder="12-digit number" />
                            </div>
                            <div className="input-group">
                                <label className="label">Annual Income (₹)</label>
                                <input type="number" className="input" value={familyForm.income} onChange={e => setFamilyForm({ ...familyForm, income: e.target.value })} placeholder="e.g. 100000" />
                            </div>
                            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                                <label className="label">Occupation</label>
                                <input className="input" value={familyForm.occupation} onChange={e => setFamilyForm({ ...familyForm, occupation: e.target.value })} placeholder="e.g. Student, Farmer" />
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                            <button className="btn-secondary" onClick={() => setShowFamilyModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveFamily}>Save Member</button>
                        </div>
                    </div>
                </Modal>
            </div>
        </ProfileAnimate>
    );
}
