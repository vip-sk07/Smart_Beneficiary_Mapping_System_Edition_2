import { CheckCircle2, XCircle, AlertTriangle, FileClock, UserX } from "lucide-react";

interface EligibilityBadgeProps {
    status?: "eligible" | "not_eligible" | "docs_pending" | "unknown";
}

export default function EligibilityBadge({ status }: EligibilityBadgeProps) {
    if (!status) return null;

    if (status === "eligible") {
        return (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border bg-emerald-50 border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                <CheckCircle2 size={13} />
                <span>Eligible & Verified</span>
            </div>
        );
    }
    
    if (status === "docs_pending") {
        return (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border bg-amber-50 border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                <FileClock size={13} />
                <span>Documents Pending</span>
            </div>
        );
    }

    if (status === "not_eligible") {
        return (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border bg-red-50 border-red-200 text-red-700 text-[11px] font-bold uppercase tracking-wider">
                <XCircle size={13} />
                <span>Not Eligible</span>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border bg-slate-100 border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
            <AlertTriangle size={13} />
            <span>Profile Incomplete</span>
        </div>
    );
}
