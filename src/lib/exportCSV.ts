/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Export data array to CSV file
 * @param data - Array of objects to export
 * @param filename - Base name for the file (without extension)
 */
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string
): void {
    if (!data.length) {
        console.warn("No data to export");
        return;
    }

    // Get headers from first object's keys
    const headers = Object.keys(data[0]);

    // Escape and quote values
    const escapeValue = (value: any): string => {
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    // Build CSV string
    const csvRows = [
        headers.join(","), // Header row
        ...data.map((row) =>
            headers
                .map((header) => escapeValue(row[header]))
                .join(",")
        ),
    ];

    const csvString = csvRows.join("\n");

    // Create blob and download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
        "download",
        `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
}

/**
 * Transform user data for export
 */
export interface ExportUser {
    id: string;
    name: string | null;
    email: string;
    role: string;
    state: string | null;
    income: number | null;
    createdAt: Date | string;
}

export function transformUsersForExport(users: ExportUser[]): Record<string, any>[] {
    return users.map((user) => ({
        ID: user.id,
        Name: user.name || "",
        Email: user.email,
        Role: user.role,
        State: user.state || "",
        Income: user.income || "",
        "Joined Date": new Date(user.createdAt).toLocaleDateString(),
    }));
}

/**
 * Transform grievance data for export
 */
export interface ExportGrievance {
    id: string;
    subject: string;
    description: string;
    status: string;
    userName: string | null;
    userEmail: string | null;
    createdAt: Date | string;
    resolvedAt: Date | string | null;
}

export function transformGrievancesForExport(
    grievances: ExportGrievance[]
): Record<string, any>[] {
    return grievances.map((g) => ({
        ID: g.id,
        Subject: g.subject,
        Description: g.description,
        Status: g.status,
        "User Name": g.userName || "",
        "User Email": g.userEmail || "",
        "Created Date": new Date(g.createdAt).toLocaleDateString(),
        "Resolved Date": g.resolvedAt
            ? new Date(g.resolvedAt).toLocaleDateString()
            : "Not resolved",
    }));
}

/**
 * Transform application stats for export
 */
export interface ExportApplicationStats {
    scheme: string;
    totalApplications: number;
    approved: number;
    pending: number;
    rejected: number;
}

export function transformApplicationStatsForExport(
    stats: ExportApplicationStats[]
): Record<string, any>[] {
    return stats.map((stat) => ({
        Scheme: stat.scheme,
        "Total Applications": stat.totalApplications,
        Approved: stat.approved,
        Pending: stat.pending,
        Rejected: stat.rejected,
        "Approval Rate": stat.totalApplications
            ? `${((stat.approved / stat.totalApplications) * 100).toFixed(1)}%`
            : "0%",
    }));
}

/**
 * Transform application data for export
 */
export interface ExportApplication {
    id: string;
    userName: string | null;
    userEmail: string | null;
    schemeTitle: string;
    status: string;
    submittedAt: Date | string;
    notes: string | null;
}

export function transformApplicationsForExport(
    applications: ExportApplication[]
): Record<string, any>[] {
    return applications.map((app) => ({
        ID: app.id,
        "Citizen Name": app.userName || "",
        "Citizen Email": app.userEmail || "",
        Scheme: app.schemeTitle,
        Status: app.status,
        "Applied Date": new Date(app.submittedAt).toLocaleDateString(),
        Notes: app.notes || "",
    }));
}
