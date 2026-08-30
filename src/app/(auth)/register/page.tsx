"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Shield, ChevronRight, ChevronLeft, Check, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PasswordStrength from "@/components/ui/PasswordStrength";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Step 2
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [phone, setPhone] = useState("");
    const [aadhaarNo, setAadhaarNo] = useState("");
    const [income, setIncome] = useState("");
    const [occupation, setOccupation] = useState("");
    const [state, setState] = useState("");
    const [address, setAddress] = useState("");

    function validateStep1() {
        if (!name.trim()) { toast.error("Name is required"); return false; }
        if (!email.trim()) { toast.error("Email is required"); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Invalid email address"); return false; }
        if (password.length < 8) { toast.error("Password must be at least 8 characters"); return false; }
        if (password !== confirmPassword) { toast.error("Passwords do not match"); return false; }
        return true;
    }

    function handleNext() {
        if (validateStep1()) setStep(2);
    }

    async function handleSubmit() {
        if (!dob) { toast.error("Date of birth is required"); return; }
        if (!gender) { toast.error("Please select your gender"); return; }
        if (!state) { toast.error("Please select your state"); return; }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name, email, password,
                    dob, gender, phone, aadhaarNo,
                    income: income ? parseFloat(income) : undefined,
                    occupation, state, address,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Registration failed");
            } else {
                toast.success("Account created! Please sign in.");
                router.push("/login");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sora">
            {/* Left Panel (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col flex-1 bg-indigo-950 text-white relative overflow-hidden py-12 px-16 justify-center">
                {/* Indian flag stripe block */}
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: "linear-gradient(to right, #ff9933 33.3%, #ffffff 33.3% 66.6%, #138808 66.6%)" }} />

                {/* Background Gradient Blob */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-800 via-indigo-950 to-black opacity-80" />

                {/* Content */}
                <div className="relative z-10 max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(79,110,247,0.3)] mb-10 border border-white/10">
                            <Shield size={32} className="text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
                            Create Your Free Account
                        </h1>
                        <p className="text-lg text-indigo-200/80 mb-10 leading-relaxed max-w-lg">
                            Get personalized recommendations for over 500+ government welfare schemes in seconds.
                        </p>
                    </motion.div>

                    <div className="space-y-4 text-indigo-100">
                        {[
                            "Takes only 2 minutes",
                            "No Aadhaar immediately required",
                            "Free forever for all Indian citizens",
                            "Data is fully encrypted and secure"
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm"
                            >
                                <CheckCircle size={20} className="text-green-400 shrink-0" />
                                <span className="font-semibold">{feature}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel (Form) */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white lg:bg-gray-50 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg mx-auto"
                >
                    {/* Mobile Logo Logo */}
                    <div className="text-center mb-8 lg:hidden">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-5">
                            <Shield size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Create Account
                        </h1>
                    </div>

                    {/* Desktop Header Title */}
                    <div className="hidden lg:block mb-6">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                            Getting Started
                        </h1>
                        <p className="text-gray-500 font-medium">
                            Step {step} of 2
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-gray-200 text-gray-500'}`}>
                                    {step > s ? <Check size={16} /> : s}
                                </div>
                                <span className={`text-sm ${step === s ? 'font-bold' : 'font-medium'} ${step >= s ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {s === 1 ? "Account" : "Profile"}
                                </span>
                                {s < 2 && (
                                    <div className={`w-12 h-1 ml-2 rounded-full ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white lg:bg-transparent lg:border-none lg:shadow-none rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xl shadow-gray-200/50 min-h-[460px] relative overflow-hidden">
                        <AnimatePresence mode="wait" custom={step}>
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    custom={1}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="flex flex-col gap-5"
                                >
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-name">Full Name *</label>
                                        <input id="reg-name" type="text" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900"
                                            value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-email">Email Address *</label>
                                        <input id="reg-email" type="email" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900"
                                            value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-password">Password *</label>
                                        <input id="reg-password" type="password" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900"
                                            value={password} onChange={(e) => setPassword(e.target.value)} />
                                        <PasswordStrength password={password} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-confirm">Confirm Password *</label>
                                        <input id="reg-confirm" type="password" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900"
                                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                    </div>
                                    <button id="next-step-btn" onClick={handleNext} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40">
                                        Continue <ChevronRight size={18} />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    custom={-1}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="flex flex-col gap-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-dob">Date of Birth *</label>
                                            <input id="reg-dob" type="date" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900"
                                                value={dob} onChange={(e) => setDob(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-gender">Gender *</label>
                                            <select id="reg-gender" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900" value={gender}
                                                onChange={(e) => setGender(e.target.value)}>
                                                <option value="">Select</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-phone">Phone Number</label>
                                            <input id="reg-phone" type="tel" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900"
                                                value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-aadhaar">Aadhaar Number</label>
                                            <input id="reg-aadhaar" type="text" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900"
                                                maxLength={12} value={aadhaarNo} onChange={(e) => setAadhaarNo(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-income">Annual Income (₹)</label>
                                            <input id="reg-income" type="number" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900"
                                                value={income} onChange={(e) => setIncome(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-occupation">Occupation</label>
                                            <input id="reg-occupation" type="text" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900"
                                                value={occupation} onChange={(e) => setOccupation(e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-state">State *</label>
                                        <select id="reg-state" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900" value={state}
                                            onChange={(e) => setState(e.target.value)}>
                                            <option value="">Select state</option>
                                            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="reg-address">Address</label>
                                        <textarea id="reg-address" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-medium text-gray-900"
                                            rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
                                            style={{ resize: "vertical" }} />
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <button onClick={() => setStep(1)} className="flex-1 py-3.5 px-4 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 font-bold text-gray-700 flex items-center justify-center gap-2 transition-all">
                                            <ChevronLeft size={18} /> Back
                                        </button>
                                        <button id="register-submit-btn" onClick={handleSubmit} disabled={loading}
                                            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40">
                                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Account"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <p className="text-center mt-6 text-sm font-medium text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="text-indigo-600 font-bold hover:underline hover:text-indigo-700 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
