import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

/**
 * In-memory rate limiter for API endpoints
 * Uses rate-limiter-flexible with memory store (no Redis needed)
 * 
 * Note: In production (Vercel), each serverless function has its own memory,
 * so this works per-request. For true distributed rate limiting, use Redis.
 */

// In-memory store for rate limiters
const limiters = new Map<string, RateLimiterMemory>();

/**
 * Creates or gets a rate limiter for a specific key
 */
function getLimiter(key: string, points: number, durationSec: number): RateLimiterMemory {
    if (!limiters.has(key)) {
        limiters.set(key, new RateLimiterMemory({
            points,
            duration: durationSec,
            blockDuration: 0, // Don't block, just reject
        }));
    }
    return limiters.get(key)!;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: Date;
    retryAfter?: number;
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param points - Number of requests allowed
 * @param durationSec - Time window in seconds
 * @returns RateLimitResult with success status and remaining count
 */
export async function rateLimit(
    identifier: string,
    points: number,
    durationSec: number
): Promise<RateLimitResult> {
    const limiter = getLimiter(identifier, points, durationSec);

    try {
        const result = await limiter.consume(identifier);
        return {
            success: true,
            remaining: result.remainingPoints,
            reset: new Date(result.msBeforeNext + Date.now()),
        };
    } catch (rejected) {
        const res = rejected as RateLimiterRes;
        return {
            success: false,
            remaining: 0,
            reset: new Date(res.msBeforeNext + Date.now()),
            retryAfter: Math.ceil(res.msBeforeNext / 1000),
        };
    }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Pre-configured rate limiters for common use cases
 */

// Register: 5 requests per IP per 15 minutes
export async function rateLimitRegister(req: Request): Promise<RateLimitResult> {
    const ip = getClientIP(req);
    return rateLimit(ip, 5, 15 * 60); // 5 requests per 15 minutes
}

// Login: 10 attempts per IP per 10 minutes
export async function rateLimitLogin(req: Request): Promise<RateLimitResult> {
    const ip = getClientIP(req);
    return rateLimit(ip, 10, 10 * 60); // 10 requests per 10 minutes
}

// Chat: 30 messages per user per hour
export async function rateLimitChat(userId: string): Promise<RateLimitResult> {
    return rateLimit(`chat:${userId}`, 30, 60 * 60); // 30 requests per hour
}

// AI Finder: 20 searches per user per hour
export async function rateLimitAIFinder(userId: string): Promise<RateLimitResult> {
    return rateLimit(`ai-finder:${userId}`, 20, 60 * 60); // 20 requests per hour
}

// General API: 100 requests per IP per minute
export async function rateLimitGeneral(req: Request): Promise<RateLimitResult> {
    const ip = getClientIP(req);
    return rateLimit(`general:${ip}`, 100, 60); // 100 requests per minute
}
