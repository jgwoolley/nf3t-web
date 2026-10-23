import { createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { ChangeEvent, useCallback, useState } from "react";
import { Button, ButtonGroup, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import { PageSizes, PDFDocument, PDFImage } from "pdf-lib";
import { downloadFile } from "../../utils/downloadFile";
import { convertBytes } from '../../utils/convertBytes';
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FileUploadOutlined } from "@mui/icons-material";

export const Route = createLazyRoute("/pdfcombiner")({
    component: PdfCombinerComponent,
})

type PdfCombinerRow = {
    // TODO: Rethink this to take raw file? So it can be rendered in iframe?
    file: File,
    pageCount: number,
    errors: any[],
    parserType: 'pdf' | 'image' | 'invalid',
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

async function indentifyRowPdf(file: File): Promise<PdfCombinerRow> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        return {
            file: file,
            pageCount: pdfDoc.getPageCount(),
            errors: [],
            parserType: 'pdf',
        }
    } catch (e) {
        return {
            file: file,
            pageCount: 0,
            errors: [e],
            parserType: 'pdf',
        }
    }
}

async function indentifyRowImage(file: File): Promise<PdfCombinerRow> {
    return {
        file: file,
        pageCount: 1,
        errors: [],
        parserType: 'image',
    }
}


const indentifyRowLut: ReadonlyMap<string, (file: File) => Promise<PdfCombinerRow> > = new Map([
    ['application/pdf', indentifyRowPdf],
    ['image/jpeg', indentifyRowImage],
    ['image/png', indentifyRowImage],
]);

async function indentifyRow(file: File): Promise<PdfCombinerRow> {
    const parseFunction = indentifyRowLut.get(file.type);
    if(parseFunction) {
        return await parseFunction(file);
    }

    return {
        file: file,
        pageCount: 0,
        errors: [ "Invalid file type." ],
        parserType: 'invalid',
    }
}

function mergeAddImage(mergedPdf: PDFDocument, image: PDFImage) {
    if (image) {
        const page = mergedPdf.addPage(PageSizes.A4);
        const { width, height } = page.getSize();
        const imageDims = image.scaleToFit(width - 50, height - 50);

        page.drawImage(image, {
            x: (width - imageDims.width) / 2,
            y: (height - imageDims.height) / 2,
            width: imageDims.width,
            height: imageDims.height,
        });
        console.log(page);
    } else {
        console.error(`Image failed to save: ${image}`);
    }
}

async function mergeRowPdf(mergedPdf: PDFDocument, file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    console.log(copiedPages);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
}

async function mergeRowJPEG(mergedPdf: PDFDocument, file: File): Promise<void> {
    const imageBytes = await readFileAsArrayBuffer(file);
    const image = await mergedPdf.embedJpg(imageBytes);
    mergeAddImage(mergedPdf, image);
}

async function mergeRowPNG(mergedPdf: PDFDocument, file: File): Promise<void> {
    const imageBytes = await readFileAsArrayBuffer(file);
    const image = await mergedPdf.embedPng(imageBytes);
    mergeAddImage(mergedPdf, image);
}

const mergeRowLut: ReadonlyMap<string, (mergedPdf: PDFDocument, file: File) => Promise<void>> = new Map([
    ['application/pdf', mergeRowPdf],
    ['image/jpeg', mergeRowJPEG],
    ['image/png', mergeRowPNG],
]);

async function mergeRow(mergedPdf: PDFDocument, file: File) {
    const luv = mergeRowLut.get(file.type);
    if(luv) {
        await luv(mergedPdf, file);
        console.log(`Parsed ${file.name} (${file.type}).`);
    } else {
        console.error(`Failed to parse ${file.name} (${file.type}).`);
    }
}

function PdfCombinerComponent() {
    const [files, setFiles] = useState<PdfCombinerRow[]>([]);
    const snackbarProps = useNf2tSnackbar();
    const [ loading, setLoading ] = useState(false);

    const onInputChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files == undefined) {
            return;
        }
        setLoading(true);
        const files: PdfCombinerRow[] = [];
        let errors: unknown[] = [];
        for (const file of e.target.files) {
            const row = await indentifyRow(file);
            files.push(row);
            errors.push(...row.errors);
        }

        setFiles(files);
        setLoading(false);
        if (errors.length === 0) {
            snackbarProps.submitSnackbarMessage(`Processed ${files.length} PDF(s) successfully.`, "success");
        } else {
            snackbarProps.submitSnackbarMessage(`Processed ${files.length} PDF(s) successfully, with ${errors.length} failure(s).`, "warning", errors);
        }
    }, [snackbarProps, setFiles, setLoading ]);

    const onClick = useCallback(async () => {
        if (files.length <= 0) {
            return;
        }
        setLoading(true);
        const mergedPdf = await PDFDocument.create();
        let filename = "merged.pdf";

        const errors: unknown[] = [];

        for (const file of files) {
            try {
                await mergeRow(mergedPdf, file.file);
            } catch (e) {
                snackbarProps.submitSnackbarMessage("Could not read given PDF.", "error", e);
            }
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
        downloadFile(new File([blob], filename));
        setLoading(false);
        if (errors.length === 0) {
            snackbarProps.submitSnackbarMessage(`Generated PDF successfully, with ${mergedPdf.getPageCount()} page(s).`, "success");
        } else {
            snackbarProps.submitSnackbarMessage(`Generated PDF successfully, with ${errors.length} failure(s).`, "warning", errors);
        }
    }, [files, snackbarProps, setLoading ]);

    return (
        <>
            <Nf2tHeader to="/pdfcombiner" />

            <h3>Choose PDF File(s)</h3>

            <IconButton component="label">
                <FileUploadOutlined />
                <input
                    multiple={true}
                    style={{ display: "none" }}
                    type="file"
                    hidden
                    onChange={onInputChange}
                />
            </IconButton>
            {files?.length !== 0 && (
                <>
                    <h3>Review / Reorder PDF File(s)</h3>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>File Name (Click to Open)</TableCell>
                                    <TableCell>Page Count</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Utilities</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {files.map((x, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{ cursor: "pointer" }} onChange={async () => {
                                            downloadFile(x.file);
                                        }}><Tooltip title="Open PDF"><span>{x.file.name}</span></Tooltip></TableCell>
                                        <TableCell>{x.pageCount}</TableCell>
                                        <TableCell>{convertBytes(x.file.size)}</TableCell>
                                        <TableCell>
                                            <ButtonGroup>
                                                {index !== 0 && (
                                                    <Tooltip title="Move File Up" style={{ cursor: "pointer" }} onClick={() => {
                                                        if (index > 0 && index < files.length) {
                                                            [files[index - 1], files[index]] = [files[index], files[index - 1]];
                                                            setFiles([...files]);
                                                        }
                                                    }}><IconButton>
                                                            <ArrowUpwardIcon />
                                                        </IconButton></Tooltip>
                                                )}
                                                {index !== files.length - 1 && (
                                                    <Tooltip title="Move File Down" style={{ cursor: "pointer" }} onClick={() => {
                                                        if (index >= 0 && index < files.length - 1) {
                                                            [files[index + 1], files[index]] = [files[index], files[index + 1]];
                                                            setFiles([...files]);
                                                        }
                                                    }}><IconButton>
                                                            <ArrowDownwardIcon />
                                                        </IconButton></Tooltip>
                                                )}
                                                <Tooltip title="Delete File" style={{ cursor: "pointer" }}>
                                                    <IconButton aria-label="delete" onClick={() => {
                                                        files.splice(index, 1);
                                                        setFiles([...files]);
                                                    }}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <h3>Merge PDF File(s)</h3>
                    <ButtonGroup disabled={loading}>
                        <Button 
                            variant="outlined" 
                            onClick={onClick}
                        >Combine</Button>
                        <Button
                            variant="outlined" 
                            onClick={() => {setFiles([])}}
                        >Delete All</Button>
                        <Tooltip title="Sort Descending" style={{ cursor: "pointer" }} onClick={() => {
                            setFiles([...files].sort((a, b) => {
                                const nameA = a.file.name;
                                const nameB = b.file.name;

                                if (nameA < nameB) {
                                    return 1; 
                                }
                                if (nameA > nameB) {
                                    return -1;
                                }
                                return 0; 
                            }));
                        }}>
                            <Button variant="outlined" >
                                <span>Sort </span>
                                <ArrowUpwardIcon />
                            </Button>
                        </Tooltip>
                        <Tooltip title="Sort Ascending" style={{ cursor: "pointer" }} onClick={() => {
                            setFiles([...files].sort((a, b) => {
                                const nameA = a.file.name;
                                const nameB = b.file.name;

                                if (nameA < nameB) {
                                    return -1; 
                                }
                                if (nameA > nameB) {
                                    return 1;
                                }
                                return 0; 
                            }));
                        }}>
                            <Button variant="outlined" >
                                <span>Sort </span>
                                <ArrowDownwardIcon />
                            </Button>
                        </Tooltip>
                    </ButtonGroup>
                    
                </>
            )}
            <Nf2tSnackbar {...snackbarProps} />
        </>

    );
}