type IpRange = {
    min: number,
    max: number,
}

export type MergeCidrsResult = {
    cidrs: string[],
    invalid: string[],
}

const IPV4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

function ipToNumber(ip: string): number | undefined {
    const match = IPV4_REGEX.exec(ip);
    if (match == null) {
        return undefined;
    }

    const octets = match.slice(1).map(Number);
    if (octets.some(octet => octet > 255)) {
        return undefined;
    }

    // Multiply instead of shifting, because bitwise operators work on signed 32 bit integers.
    return octets.reduce((acc, octet) => acc * 256 + octet, 0);
}

function numberToIp(value: number): string {
    return [24, 16, 8, 0].map(shift => Math.floor(value / 2 ** shift) % 256).join(".");
}

function cidrToRange(cidr: string): IpRange | undefined {
    const [ip, prefixRaw, ...rest] = cidr.trim().split("/");
    if (prefixRaw === undefined || rest.length > 0 || !/^\d{1,2}$/.test(prefixRaw)) {
        return undefined;
    }

    const prefix = Number(prefixRaw);
    const base = ipToNumber(ip);
    if (base === undefined || prefix > 32) {
        return undefined;
    }

    // Host bits are ignored, so 10.0.0.5/24 covers the same addresses as 10.0.0.0/24.
    const size = 2 ** (32 - prefix);
    const min = Math.floor(base / size) * size;
    return { min, max: min + size - 1 };
}

/** The fewest CIDRs that cover exactly the addresses from start to end (inclusive). */
function rangeToCidrs({ min, max }: IpRange): string[] {
    const cidrs: string[] = [];
    let start = min;

    while (start <= max) {
        // The largest block that starts on a boundary at `start`, and still fits before `max`.
        let size = start === 0 ? 2 ** 32 : start & -start;
        if (size < 0) {
            size = 2 ** 31;
        }
        while (start + size - 1 > max) {
            size /= 2;
        }

        cidrs.push(`${numberToIp(start)}/${32 - Math.log2(size)}`);
        start += size;
    }

    return cidrs;
}

/** Merges overlapping and adjacent CIDRs. Lines that are not CIDRs (and blank lines) are returned in `invalid`. */
export function mergeCIDRs(lines: string[]): MergeCidrsResult {
    const ranges: IpRange[] = [];
    const invalid: string[] = [];

    for (const line of lines) {
        if (line.trim() === "") {
            continue;
        }

        const range = cidrToRange(line);
        if (range === undefined) {
            invalid.push(line.trim());
        } else {
            ranges.push(range);
        }
    }

    ranges.sort((a, b) => a.min - b.min);

    const merged: IpRange[] = [];
    for (const range of ranges) {
        const previous = merged[merged.length - 1];
        if (previous !== undefined && range.min <= previous.max + 1) {
            previous.max = Math.max(previous.max, range.max);
        } else {
            merged.push({ ...range });
        }
    }

    return {
        cidrs: merged.flatMap(rangeToCidrs),
        invalid,
    };
}

export function deduplicateCIDRs(cidrs: string[]): string[] {
    return mergeCIDRs(cidrs).cidrs;
}
