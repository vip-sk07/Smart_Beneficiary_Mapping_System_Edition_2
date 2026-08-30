type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
type GrievanceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Status = ApplicationStatus | GrievanceStatus;

const CONFIG: Record<Status, { className: string; label: string }> = {
    PENDING: { className: "badge badge-pending", label: "Pending" },
    APPROVED: { className: "badge badge-approved", label: "Approved" },
    REJECTED: { className: "badge badge-rejected", label: "Rejected" },
    UNDER_REVIEW: { className: "badge badge-review", label: "Under Review" },
    OPEN: { className: "badge badge-open", label: "Open" },
    IN_PROGRESS: { className: "badge badge-in-progress", label: "In Progress" },
    RESOLVED: { className: "badge badge-resolved", label: "Resolved" },
    CLOSED: { className: "badge badge-closed", label: "Closed" },
};

export default function Badge({ status }: { status: Status }) {
    const cfg = CONFIG[status] ?? { className: "badge", label: status };
    return <span className={cfg.className}>{cfg.label}</span>;
}
