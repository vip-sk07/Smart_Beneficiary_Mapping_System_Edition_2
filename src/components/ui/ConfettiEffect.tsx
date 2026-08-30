"use client";

import confetti from "canvas-confetti";

/**
 * Fire a confetti burst animation
 * @param type - 'default' for multi-color, 'indian' for tri-color patriotic
 */
export function fireConfetti(type: "default" | "indian" = "default") {
    if (type === "indian") {
        // Indian tri-color confetti ( Saffron, White, Green, Navy)
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#ff9933", "#ffffff", "#138808", "#000080"],
        });
    } else {
        // Default colorful confetti (Indigo, Orange, Green, Pink)
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#4338ca", "#f97316", "#22c55e", "#f472b6"],
        });
    }
}

/**
 * Fire a subtle confetti burst (for smaller celebrations)
 */
export function fireSmallConfetti() {
    confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#4338ca", "#f97316", "#22c55e", "#f472b6"],
    });
}

/**
 * Fire a cannon-style burst from the sides
 */
export function fireCannonConfetti() {
    const duration = 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire from left side
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ["#ff9933", "#ffffff", "#138808"],
        });

        // Fire from right side
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ["#ff9933", "#ffffff", "#138808"],
        });
    }, 250);
}

export default fireConfetti;
