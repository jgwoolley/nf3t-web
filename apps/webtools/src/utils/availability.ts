export const HOURS_PER_YEAR = 8760;

export type DowntimeUnit = "days" | "hours" | "minutes" | "seconds";

export const downtimeUnits: DowntimeUnit[] = ["days", "hours", "minutes", "seconds"];

const HOURS_PER_UNIT: Record<DowntimeUnit, number> = {
    days: 24,
    hours: 1,
    minutes: 1 / 60,
    seconds: 1 / 3600,
};

export function downtimeToHours(value: number, unit: DowntimeUnit): number {
    return value * HOURS_PER_UNIT[unit];
}

export function hoursToDowntime(hours: number, unit: DowntimeUnit): number {
    return hours / HOURS_PER_UNIT[unit];
}

/** Whether the downtime is something that can happen in one year. */
export function isValidDowntimeHours(hours: number): boolean {
    return Number.isFinite(hours) && hours >= 0 && hours <= HOURS_PER_YEAR;
}

export function availabilityPercent(downtimeHours: number): number {
    return ((HOURS_PER_YEAR - downtimeHours) / HOURS_PER_YEAR) * 100;
}

export function downtimeHoursForAvailability(percent: number): number {
    return HOURS_PER_YEAR * (1 - percent / 100);
}

/** Formats a percentage without trailing zeros, but with enough digits that 99.99999% does not read as 100%. */
export function formatAvailability(percent: number): string {
    return `${Number(percent.toFixed(7))}%`;
}

function plural(count: number, noun: string) {
    return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function formatDowntime(hours: number): string {
    const totalSeconds = Math.round(hours * 3600);
    if (totalSeconds <= 0) {
        return "0 downtime";
    }

    const days = Math.floor(totalSeconds / 86400);
    const remainingHours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(plural(days, "day"));
    if (remainingHours > 0) parts.push(plural(remainingHours, "hour"));
    if (minutes > 0) parts.push(plural(minutes, "minute"));
    if (seconds > 0) parts.push(plural(seconds, "second"));

    return `${parts.join(", ")} per year`;
}
