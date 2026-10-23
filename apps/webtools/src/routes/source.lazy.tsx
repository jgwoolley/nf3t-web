import { useEffect, useMemo, useState } from "react";
import Nf2tHeader from "../components/Nf2tHeader";
import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { z } from "zod";
import Spacing from "../components/Spacing";
import CodeSnippet from "../components/CodeSnippet";
import Nf2tSnackbar from "../components/Nf2tSnackbar";
import { createLazyRoute } from "@tanstack/react-router";
import ExternalLink from "../components/ExternalLink";
import { useNf2tSnackbar } from "../hooks/useNf2tSnackbar";
import { useNf2tTable } from "../hooks/useNf2tTable";
import Nf2tTable from "../components/Nf2tTable";

export const Route = createLazyRoute("/source")({
    component: SourceComponent,
})

export const GitInfoSchema = z.object({
    H: z.string(),
    an: z.string(),
    at: z.string(),
    ae: z.string(),
    B: z.string(),
})

export type GitInfo = z.infer<typeof GitInfoSchema>;

export const BuildInfoSchema = z.object({
    git: GitInfoSchema.optional(),
    node: z.record(z.string(), z.string()),
})

export type BuildInfo = z.infer<typeof BuildInfoSchema>;

function SourceComponent() {
    const [buildinfo, setBuildinfo] = useState<BuildInfo>();
    const [authorDate, setAuthorDate] = useState<Date>();

    const snackbarProps = useNf2tSnackbar();

    useEffect(() =>{
        fetch("./buildinfo.json")
            .then( x => {
                if(x.ok) {
                    return x;
                }

                throw new Error("Did not recieve OK response")
            })
            .then( x => x.json())
            .then( x => {
                const result = BuildInfoSchema.safeParse(x);
                if(result.success) {
                    setBuildinfo(result.data);
                } else {
                    console.error(result.error);
                }
            });
    }, []);

    useEffect(() =>{
        if(buildinfo?.git == undefined) {
            return;
        }

        setAuthorDate(new Date(parseInt(buildinfo.git.at) * 1000));
    }, [buildinfo]);

    const nodeVersions = useMemo(() => {
        if(buildinfo?.node == undefined) {
            return [];
        }
        return Object.entries(buildinfo.node);
    }, [buildinfo]);

    const nodeVersionTableProps = useNf2tTable({
        childProps: undefined,
        canEditColumn: false,
        snackbarProps, 
        columns: [
            {
                columnName: "Software",
                bodyRow: (x) => x.row[0],
                rowToString: (x) => x[0],
            },
            {
                columnName: "Version",
                bodyRow: (x) => x.row[1],
                rowToString: (x) => x[1],
            },
        ], 
        rows: nodeVersions,
    });

    return (
        <>
            <Nf2tHeader to="/source" />
            <Spacing />
            <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    {buildinfo?.git ? (
                        <>
                        <TableRow>
                            <TableCell>Commit</TableCell>
                            <TableCell><ExternalLink href={`https://github.com/jgwoolley/nf3t-web/commit/${buildinfo.git.H}`}>{buildinfo.git.H}</ExternalLink></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Commit Message</TableCell>
                            <TableCell><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code={buildinfo.git.B}/></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Commit Author Name</TableCell>
                            <TableCell><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code={buildinfo.git.an}/></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Commit Author Email</TableCell>
                            <TableCell><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code={buildinfo.git.ae}/></TableCell>
                        </TableRow>
                        </>
                    ) : null }                    
                    <TableRow>
                        <TableCell>Commit Date</TableCell>
                        <TableCell>{authorDate?.toLocaleString()}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </TableContainer>

            <h3>Node versions</h3>
            <p>Represent the versions of node sofware used to compile the project.</p>
            <TableContainer component={Paper}>
                <Nf2tTable {...nodeVersionTableProps} />
            </TableContainer>

            <Nf2tSnackbar {...snackbarProps} />
        </>
    )
}