import Nf2tHeader from "../../components/Nf2tHeader";
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import CodeSnippet from "../../components/CodeSnippet";
import { createLazyRoute } from "@tanstack/react-router";
import { TextField } from '@mui/material';
import { useMemo, useState } from "react";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { mergeCIDRs } from "./mergeCidrs";

export const Route = createLazyRoute("/mergecidrs")({
    component: MergeCidrsComponent,
})

function MergeCidrsComponent() {
    const snackbarProps = useNf2tSnackbar();
    const [inputArea, setInputArea] = useState<string>("1.1.0.0/24\n1.1.0.0/16\n10.0.0.0/24\n10.0.1.0/24\n");
    const { cidrs, invalid } = useMemo(() => mergeCIDRs(inputArea.split("\n")), [inputArea]);

    return (
        <>
            <Nf2tHeader to="/mergecidrs" />

            <h3>CIDRs (one per line)</h3>
            <TextField
                fullWidth
                multiline
                minRows={5}
                value={inputArea}
                onChange={(e) => setInputArea(e.target.value)}
            />

            <h3>Merged CIDRs ({cidrs.length})</h3>
            <p>Click a CIDR to copy it, or the list to copy all of them.</p>
            <p><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code={cidrs.join("\n")} /></p>
            <ul>
                {cidrs.map((x) => <li key={x}><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code={x} /></li>)}
            </ul>

            {invalid.length > 0 && (
                <>
                    <h3>Ignored lines ({invalid.length})</h3>
                    <p>These are not valid IPv4 CIDRs, so they were left out.</p>
                    <ul>
                        {invalid.map((x, index) => <li key={index}><code>{x}</code></li>)}
                    </ul>
                </>
            )}
            <Nf2tSnackbar {...snackbarProps} />
        </>
    );
}
