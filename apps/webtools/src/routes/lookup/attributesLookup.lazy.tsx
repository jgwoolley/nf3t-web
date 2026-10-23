import { useMemo } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Link, createLazyRoute, getRouteApi } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import ExternalLink from "../../components/ExternalLink";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { getNf2tAttribute, getCoreAttribute } from "@nf2t/flowfiletools-js";
import { Link as MuiLink } from "@mui/material";
import NarReaderBackLink from "../../components/NarReaderBackLink";

const route = getRouteApi("/attributesLookup");

export const Route = createLazyRoute("/attributesLookup")({
    component: LookupAttribute,
})

export default function LookupAttribute() {

    const { name } = route.useSearch();
    const { queryResults } = useNf2tContext();
    const attributes = useMemo(() => {
        if (!queryResults.data) {
            return [];
        }

        return queryResults.data.attributes.filter(x => x.name === name);
    }, [queryResults.data, name]);

    const nf2tAttributeDescription = name == undefined ? null : getNf2tAttribute(name)?.description;
    const coreAttributeDescription = name == undefined ? null : getCoreAttribute(name)?.description;
        
    return (
        <>
            <Nf2tHeader to="/attributesLookup" />
            <p><NarReaderBackLink /></p>

            {(nf2tAttributeDescription) && (
                <>
                    <h5>Attributes from Nf3t Tool</h5>
                    <TableContainer component={Paper}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>{name}</TableCell>
                                <TableCell>{nf2tAttributeDescription}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    </TableContainer>
                </>
            )}
            {(coreAttributeDescription) && (
                <>
                    <h5>Core Nifi Attributes</h5>
                    <p>See <ExternalLink href="https://github.com/apache/nifi/blob/main/nifi-api/src/main/java/org/apache/nifi/flowfile/attributes/CoreAttributes.java">CoreAttributes.java</ExternalLink>.</p>
                    <TableContainer component={Paper}>

                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>{name}</TableCell>
                                <TableCell>{coreAttributeDescription}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    </TableContainer>
                </>
            )}

            <h5>Attributes from Nars</h5>

            {(attributes.length) > 0 ? (
                <>
                    <p>The {name} attribute was found on the following Nifi Processors.</p>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Nar</TableCell>
                                    <TableCell>Extension</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attributes.map((attribute, attributeIndex) => (
                                    <TableRow key={attributeIndex}>
                                        <TableCell>
                                            
                                            <Link to="/attributeLookup" search={{ id: attribute.id }}><MuiLink component="span">{attribute.name}</MuiLink></Link>
                                            
                                        </TableCell>
                                        <TableCell>
                                            
                                                <Link to="/narLookup" search={{ name: attribute.narId }}><MuiLink component="span">{attribute.narId}</MuiLink></Link>
                                            
                                        </TableCell>
                                        <TableCell>
                                            <Link to="/extensionLookup" search={{ name: attribute.extensionId }}>
                                                <MuiLink component="span">{attribute.extensionId}</MuiLink>      
                                            </Link>
                                        </TableCell>
                                        <TableCell>{attribute.type}</TableCell>
                                        <TableCell>{attribute.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            ) : (
                <p style={{color: "red"}}>Did not find attribute "{name}" amoung the already parsed Nifi processors.</p>
            )}
        </>
    )
}