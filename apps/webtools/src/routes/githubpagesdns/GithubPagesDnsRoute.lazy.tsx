import { createLazyRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Alert, Button, Checkbox, FormControlLabel, FormGroup, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import Nf2tHeader from "../../components/Nf2tHeader";
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import CodeSnippet from "../../components/CodeSnippet";
import ExternalLink from "../../components/ExternalLink";
import Spacing from "../../components/Spacing";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { generateGithubPagesDns, recordsToZoneFile } from "../../utils/githubPagesDns";

export const Route = createLazyRoute("/githubpagesdns")({
    component: GithubPagesDnsComponent,
})

function GithubPagesDnsComponent() {
    const snackbarProps = useNf2tSnackbar();
    const [repository, setRepository] = useState("jgwoolley/nf3t-web");
    const [domain, setDomain] = useState("nf3t.com");
    const [subdomain, setSubdomain] = useState("");
    const [includeIpv6, setIncludeIpv6] = useState(true);
    const [includeWww, setIncludeWww] = useState(true);
    const [includeChallenge, setIncludeChallenge] = useState(false);

    const touched = repository !== "" || domain !== "";
    const result = useMemo(() => generateGithubPagesDns({
        repository, domain, subdomain, includeIpv6, includeWww, includeChallenge,
    }), [repository, domain, subdomain, includeIpv6, includeWww, includeChallenge]);

    const isApex = result.customDomain !== undefined && result.records.some(x => x.type === "A");

    return (
        <>
            <Nf2tHeader to="/githubpagesdns" />
            <Spacing />
            <FormGroup style={{ gap: "1em", maxWidth: "30em" }}>
                <TextField
                    label="Repository"
                    placeholder="owner/repo"
                    value={repository}
                    onChange={e => setRepository(e.target.value)}
                />
                <TextField
                    label="Domain"
                    placeholder="example.com"
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                />
                <TextField
                    label="Subdomain (optional)"
                    placeholder="wiki"
                    value={subdomain}
                    onChange={e => setSubdomain(e.target.value)}
                />
                <div>
                    <FormControlLabel control={<Checkbox checked={includeIpv6} onChange={e => setIncludeIpv6(e.target.checked)} />} label="Include IPv6 (AAAA) records" />
                    <FormControlLabel control={<Checkbox checked={includeWww} onChange={e => setIncludeWww(e.target.checked)} />} label="Include www redirect (apex only)" />
                    <FormControlLabel control={<Checkbox checked={includeChallenge} onChange={e => setIncludeChallenge(e.target.checked)} />} label="Include domain verification TXT record" />
                </div>
            </FormGroup>

            {touched && result.errors.map((x, index) => <Alert key={index} severity="error" style={{ marginTop: "1em" }}>{x}</Alert>)}

            {result.records.length > 0 && (
                <>
                    <h3>DNS Records</h3>
                    <p>Add these at your DNS provider{isApex ? " (apex domain)" : ""}. Click a value to copy it.</p>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Value</TableCell>
                                    <TableCell>Notes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {result.records.map((x, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{x.type}</TableCell>
                                        <TableCell><CodeSnippet code={x.name} submitSnackbarMessage={snackbarProps.submitSnackbarMessage} /></TableCell>
                                        <TableCell><CodeSnippet code={x.value} submitSnackbarMessage={snackbarProps.submitSnackbarMessage} /></TableCell>
                                        <TableCell>{x.note}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Spacing />
                    <Button variant="outlined" onClick={() => {
                        navigator.clipboard.writeText(recordsToZoneFile(result.records));
                        snackbarProps.submitSnackbarMessage("Copied zone file to clipboard.", "info");
                    }}>Copy as zone file</Button>

                    <h3>GitHub Settings</h3>
                    <ol>
                        <li>
                            Open <ExternalLink href={result.settingsUrl!}>{result.owner}/{result.repo} Pages settings</ExternalLink>.
                        </li>
                        <li>
                            Set <b>Custom domain</b> to <CodeSnippet code={result.customDomain!} submitSnackbarMessage={snackbarProps.submitSnackbarMessage} /> and save.
                        </li>
                        <li>Once the DNS check passes, tick <b>Enforce HTTPS</b>. The certificate can take up to an hour.</li>
                    </ol>
                </>
            )}

            {result.notices.length > 0 && (
                <>
                    <h3>Notes</h3>
                    <ul>
                        {result.notices.map((x, index) => <li key={index}>{x}</li>)}
                    </ul>
                </>
            )}
            <Nf2tSnackbar {...snackbarProps} />
        </>
    );
}
