import CodeSnippet from "../../components/CodeSnippet";
import ExternalLink from "../../components/ExternalLink";
import Nf2tHeader from "../../components/Nf2tHeader";
import PrevNext from "../../components/PrevNext";
import Spacing from "../../components/Spacing";
import { useMemo } from "react";
import Slides, { Slide } from "../../components/Nf2tSlides";
import { createLazyRoute } from "@tanstack/react-router";
import { sourceReferences } from "../routeDescriptions";
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { useNf2tSnackbar } from '../../hooks/useNf2tSnackbar';

export const Route = createLazyRoute("/buildInfo")({
    component: BuildProcess,
})

export default function BuildProcess() {
    const snackbarProps = useNf2tSnackbar();

    const slides: Slide[] = useMemo(() => [
        {
            alt: "Prerequisites",
            child: (
                <>
                    <p>Prerequisites</p>
                    <ul>
                        <li>Have access to a linux/macOS/windows terminal.</li>
                        <li>Git is installed.</li>
                        <li>NPM is installed.</li>
                    </ul>
                </>
            ),
        },
        {
            alt: "Open your terminal to an optimal location for the code to be installed."
        },
        {
            alt: "Clone the following repository from GitHub",
            child: (
                <>
                    <ExternalLink href="https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository">Clone the following repository from GitHub</ExternalLink>.
                    <ol>
                        <li>GitHub Repository Link: <ExternalLink href={sourceReferences.GithubRepository.url}>{sourceReferences.GithubRepository.url}</ExternalLink>.</li>
                    </ol>
                </>
            )
        },
        {
            alt: "Change directories into the newly created repository folder.",
            child: (
                <>
                    <p>Change directories into the newly created repository folder.</p>
                    <ol>
                        <li><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code="cd Nifi-Flow-File-Helper" /></li>
                    </ol>
                </>
            )
        },
        {
            alt: "Install the NPM dependencies.",
            child: (
                <>
                    <p>Install the NPM dependencies.</p>
                    <ol>
                        <li><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code="npm install" /></li>
                    </ol>
                </>
            )
        },
        {
            alt: "Run the NextJS development server.",
            child: (
                <>
                    <p>Run the NextJS development server.</p>
                    <ol>
                        <li><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code="npm run dev" /></li>
                        <li>This command does the following:</li>
                        <ol>
                            <li>Looks in "scripts" for "dev" <ExternalLink href="https://github.com/jgwoolley/nf3t-web/blob/main/apps/webtools/package.json">package.json</ExternalLink> and runs the <code>next dev</code> command as a child process.</li>
                            <li>NextJS looks for <ExternalLink href="https://github.com/jgwoolley/nf3t-web/blob/main/apps/webtools/next.config.mjs">next.config.mjs</ExternalLink> and applies the static export configuration.</li>
                            <ol>
                                <li>Runs <CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code="npm run build" /> to generate <code>buildinfo.json</code> and <code>nars.json</code> before the static export.</li>
                                <li>Loads the NextJS app entrypoint from <ExternalLink href="https://github.com/jgwoolley/nf3t-web/blob/main/apps/webtools/app/page.tsx">app/page.tsx</ExternalLink> and mounts the existing client-side router.</li>
                                <ol>
                                    <li>Uses a client-only component to keep all route processing in the browser.</li>
                                </ol>
                            </ol>
                            <li>Runs as a website on your local computer. It will run in hot module replace mode, so any changes you make will immediately be deployed.</li>
                        </ol>
                    </ol>
                </>
            )
        },
        {
            alt: "Build the NextJS static export.",
            child: (
                <>
                    <p>Build the NextJS static export.</p>
                    <ol>
                        <li><CodeSnippet submitSnackbarMessage={snackbarProps.submitSnackbarMessage} code="npm run build" /></li>
                        <li>Does everything in the "development server step", except it creates a static export in the <code>out</code> directory for deployment.</li>
                    </ol>
                </>
            )
        }
    ], [snackbarProps.submitSnackbarMessage]);

    return (
        <>
            <Nf2tHeader to="/buildInfo" />
            <Slides slides={slides} />
            <Spacing />

            <PrevNext prev="/technologiesInfo" next="/" />
            <Nf2tSnackbar {...snackbarProps} />
        </>
    );
}