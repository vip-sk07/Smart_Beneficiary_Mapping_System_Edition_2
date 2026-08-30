// ─────────────────────────────────────────────
// Shared TypeScript types for Smart Beneficiary Mapping System
// ─────────────────────────────────────────────

export type Role = "USER" | "ADMIN";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
export type GrievanceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

// ─── Category ────────────────────────────────

export interface CategoryType {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
}

import type { Prisma } from "@prisma/client";

// ─── Scheme ──────────────────────────────────

export type SchemeType = Prisma.SchemeGetPayload<{}>;

export type SchemeWithCategory = Prisma.SchemeGetPayload<{
    include: { category: true }
}>;

// ─── Application ─────────────────────────────

export type ApplicationType = Prisma.ApplicationGetPayload<{}>;

export type ApplicationWithScheme = Prisma.ApplicationGetPayload<{
    include: { scheme: { include: { category: true } } }
}>;

// ─── Grievance ───────────────────────────────

export interface GrievanceType {
    id: string;
    subject: string;
    description: string;
    status: GrievanceStatus;
    response: string | null;
    userId: string;
    createdAt: Date;
    resolvedAt: Date | null;
    updatedAt: Date;
}

// ─── Announcement ────────────────────────────

export interface AnnouncementType {
    id: string;
    title: string;
    content: string;
    isActive: boolean;
    pinned: boolean;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Chat ────────────────────────────────────

export interface ChatMessageType {
    id: string;
    userId: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
}

// ─── API Responses ───────────────────────────

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}
