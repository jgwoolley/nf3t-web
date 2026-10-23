export const GITHUB_PAGES_IPV4 = [
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
];

export const GITHUB_PAGES_IPV6 = [
    "2606:50c0:8000::153",
    "2606:50c0:8001::153",
    "2606:50c0:8002::153",
    "2606:50c0:8003::153",
];

export type DnsRecordType = "A" | "AAAA" | "CNAME" | "TXT";

export type DnsRecord = {
    type: DnsRecordType,
    /** Relative to the domain, "@" for the apex. */
    name: string,
    fqdn: string,
    value: string,
    note?: string,
}

export type GithubPagesDnsInput = {
    repository: string,
    domain: string,
    subdomain: string,
    includeIpv6: boolean,
    includeWww: boolean,
    includeChallenge: boolean,
}

export type GithubPagesDnsResult = {
    errors: string[],
    notices: string[],
    owner?: string,
    repo?: string,
    /** The hostname GitHub should be given as the custom domain. */
    customDomain?: string,
    records: DnsRecord[],
    settingsUrl?: string,
}

const OWNER_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO_REGEX = /^[A-Za-z0-9._-]{1,100}$/;
const LABEL_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
// Second-level suffixes where the registrable domain has three labels (example.co.uk).
const TWO_PART_SUFFIX_REGEX = /^(?:co|com|org|net|gov|edu|ac)\.[a-z]{2}$/;

export function parseRepository(value: string): { owner: string, repo: string } | undefined {
    const cleaned = value
        .trim()
        .replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "")
        .replace(/^git@github\.com:/i, "")
        .replace(/\.git$/i, "")
        .replace(/\/+$/, "");
    const [owner, repo, ...rest] = cleaned.split("/");
    if (rest.length > 0 || !owner || !repo || !OWNER_REGEX.test(owner) || !REPO_REGEX.test(repo)) {
        return undefined;
    }

    return { owner, repo };
}

function cleanHost(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/^[a-z]+:\/\//, "")
        .replace(/[/?#].*$/, "")
        .replace(/\.+$/, "")
        .replace(/^\.+/, "");
}

function validHost(value: string): boolean {
    return value.length > 0 && value.length <= 253 && value.split(".").every(x => LABEL_REGEX.test(x));
}

/** Splits a hostname into the registrable domain and whatever subdomain sits in front of it. */
function splitHost(host: string): { domain: string, subdomain: string } {
    const labels = host.split(".");
    const suffixLength = TWO_PART_SUFFIX_REGEX.test(labels.slice(-2).join(".")) ? 2 : 1;
    const domainLength = suffixLength + 1;
    return {
        domain: labels.slice(-domainLength).join("."),
        subdomain: labels.slice(0, -domainLength).join("."),
    };
}

export function generateGithubPagesDns(input: GithubPagesDnsInput): GithubPagesDnsResult {
    const errors: string[] = [];
    const notices: string[] = [];
    const records: DnsRecord[] = [];

    const repository = parseRepository(input.repository);
    if (!repository) {
        errors.push("Repository must look like owner/repo (or a github.com URL).");
    }

    let domain = cleanHost(input.domain);
    let subdomain = cleanHost(input.subdomain);
    if (!validHost(domain) || domain.split(".").length < 2) {
        errors.push("Domain must look like example.com.");
    } else {
        const split = splitHost(domain);
        if (split.subdomain) {
            // e.g. "wiki.example.com" typed into the domain box: treat the leading part as a subdomain.
            subdomain = subdomain ? `${subdomain}.${split.subdomain}` : split.subdomain;
            domain = split.domain;
            notices.push(`"${input.domain.trim()}" includes a subdomain, so it was split into subdomain "${subdomain}" and domain "${domain}".`);
        }
    }
    if (subdomain && !validHost(subdomain)) {
        errors.push("Subdomain must contain only letters, numbers, hyphens and dots.");
    }

    if (errors.length > 0 || !repository) {
        return { errors, notices, records };
    }

    const { owner, repo } = repository;
    const customDomain = subdomain ? `${subdomain}.${domain}` : domain;
    const target = `${owner.toLowerCase()}.github.io.`;

    if (subdomain) {
        records.push({
            type: "CNAME",
            name: subdomain,
            fqdn: customDomain,
            value: target,
            note: "Points at your GitHub account, not the repository.",
        });
    } else {
        GITHUB_PAGES_IPV4.forEach(value => records.push({ type: "A", name: "@", fqdn: domain, value }));
        if (input.includeIpv6) {
            GITHUB_PAGES_IPV6.forEach(value => records.push({ type: "AAAA", name: "@", fqdn: domain, value }));
        }
        if (input.includeWww) {
            records.push({
                type: "CNAME",
                name: "www",
                fqdn: `www.${domain}`,
                value: target,
                note: "GitHub redirects www to the apex domain.",
            });
        }
    }

    if (input.includeChallenge) {
        records.push({
            type: "TXT",
            name: `_github-pages-challenge-${owner}${subdomain ? `.${subdomain}` : ""}`,
            fqdn: `_github-pages-challenge-${owner}.${customDomain}`,
            value: "<code shown by GitHub>",
            note: "Optional domain verification. GitHub shows the value when you add the domain at github.com/settings/pages.",
        });
    }

    notices.push("If your DNS provider proxies records (e.g. Cloudflare's orange cloud), set these to DNS only so GitHub can issue the HTTPS certificate.");
    notices.push("Remove any other A, AAAA or CNAME records for the same name, or GitHub's DNS check will fail.");
    notices.push(`The site is served from the root of ${customDomain}, so remove any base path such as "/${repo}/" from your site's config.`);

    return {
        errors,
        notices,
        owner,
        repo,
        customDomain,
        records,
        settingsUrl: `https://github.com/${owner}/${repo}/settings/pages`,
    };
}

export function recordsToZoneFile(records: DnsRecord[], ttl = 3600): string {
    return records
        .map(x => {
            const value = x.type === "TXT" ? `"${x.value}"` : x.value;
            return `${x.fqdn}.\t${ttl}\tIN\t${x.type}\t${value}`;
        })
        .join("\n") + "\n";
}
