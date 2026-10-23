import { FC, useCallback, useEffect, useMemo, useState, } from "react";
import { Nf2tSnackbarResult } from "../hooks/useNf2tSnackbar";

export interface BodyRowComponentProps<R,C> {
    filteredRowIndex: number,
    rowIndex: number,
    row: R,
    filteredColumnIndex: number,
    columnIndex: number,
    column: Nf2tTableColumnSpec<R,C>,
    childProps: C,
    hideFilter?: boolean,
}

export type Nf2tTableColumnSortDirectionType = "asc" | "desc" | "ignored";
export type Nf2tTableColumnEmptyFilterType = "non-empty" | "empty" | "ignored";

export interface Nf2tTableColumnSpec<R,C> {
    columnName: string,
    bodyRow: FC<BodyRowComponentProps<R,C>>,
    hideFilter?: boolean,
    rowToString: (row: R, index: number) => string,
    compareFn?: (a: R, b: R) => number,
    defaultSortDirection?: Nf2tTableColumnSortDirectionType,
    defaultEmptyFilterType?: Nf2tTableColumnEmptyFilterType,
};

export const Nf2tTableColumnSortDirectionDefault: Nf2tTableColumnSortDirectionType = "ignored";
export const Nf2tTableColumnEmptyFilterTypeDefault: Nf2tTableColumnEmptyFilterType = "ignored";

export interface Nf2tTableColumn {
    columnIndex: number,
    sortDirection: Nf2tTableColumnSortDirectionType,
    emptyFilter: Nf2tTableColumnEmptyFilterType,
    regexFilter: string, //RegExp
}

export interface Nf2tTableParams<R, C> {
    childProps: C,
    snackbarProps: Nf2tSnackbarResult,
    columns: Nf2tTableColumnSpec<R, C>[],
    rows: R[],
    canEditColumn: boolean,
    ignoreNoColumnsError?: boolean,
    maxColumns?: number,
    minColumns?: number,
}

export type VisibleRow<R> = {
    row: R,
    rowIndex: number,
};

export interface Nf2tTableProps<R, C> {
    childProps: C,
    rowsPerPage: number, 
    rowPage: number,
    columns: Nf2tTableColumnSpec<R, C>[],
    filteredColumns: Nf2tTableColumn[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn[]>>,
    rows: R[],
    filteredRows: R[],
    visibleRows: VisibleRow<R>[],
    canEditColumn: boolean,
    open: boolean,
    columnPage: number,
    handleClickOpen: () => void,
    handleClose: () => void,
    handleChangePage: (event: unknown, newPage: number) => void,
    handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onClickColumn: (value: number) => void,
    restoreDefaultFilteredColumns: () => void, 
    snackbarProps: Nf2tSnackbarResult,
}

export type Nf2tOnClickColumn = (columnPage: number) => void;
export interface Nf2tTableColumnHeadCellProps<R, C> {
    columns: Nf2tTableColumnSpec<R, C>[],
    filteredColumns: Nf2tTableColumn[],
    setFilteredColumns: React.Dispatch<React.SetStateAction<Nf2tTableColumn[]>>,
    columnIndex: number,
    filteredColumnIndex: number,
    handleClickOpen: () => void,
    canEditColumn: boolean,
    onClickColumn: Nf2tOnClickColumn,
}

const emptyFilterLut = new Map<"empty" | "non-empty" | "ignored", undefined | ((value: string) => boolean)>();
emptyFilterLut.set("empty", (value) => value.length === 0);
emptyFilterLut.set("non-empty", (value) => value.length !== 0);
emptyFilterLut.set("ignored", undefined);

export function useNf2tTable<R, C>({ childProps, snackbarProps, rows, columns, canEditColumn, ignoreNoColumnsError, maxColumns: incomingMaxColumns, minColumns: incomingMinColumns}: Nf2tTableParams<R, C>): Nf2tTableProps<R, C> {    
    const [filteredColumns, setFilteredColumns] = useState<Nf2tTableColumn[]>([]);
    const [rowPage, setRowPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [open, setOpen] = useState(false);
    const [columnPage, setColumnPage] = useState(1);

    const onClickColumn = useCallback((value: number) => {
        setColumnPage(value);
    }, [setColumnPage]);

    const restoreDefaultFilteredColumns = useCallback(() => {
        const maxColumns = incomingMaxColumns || 6;
        const minColumns = incomingMinColumns || 1;

        if(columns.length == 0 || filteredColumns.length >= minColumns) {
            return;
        }

        if (!ignoreNoColumnsError && columns.length <= 0) {
            snackbarProps.submitSnackbarMessage("No columns for table configured", "error");
            return;
        }
        const entries = columns.entries();
        const newFilteredColumns: Nf2tTableColumn[] = Array.from(entries).map(([columnIndex, spec]) => {
            const newColumn: Nf2tTableColumn = {
                columnIndex: columnIndex,
                sortDirection: spec.defaultSortDirection || Nf2tTableColumnSortDirectionDefault,
                emptyFilter: spec.defaultEmptyFilterType || Nf2tTableColumnEmptyFilterTypeDefault,
                regexFilter: "",
            }

            return newColumn;
        });

        newFilteredColumns.splice(maxColumns);
        setFilteredColumns(newFilteredColumns);

    }, [columns, filteredColumns.length, ignoreNoColumnsError, incomingMaxColumns, incomingMinColumns, snackbarProps])
    
    useEffect(() => {
        restoreDefaultFilteredColumns();
    }, []);

    const handleClickOpen = () => {  
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChangePage = useCallback((_event: unknown, newPage: number) => {
        setRowPage(newPage);
    }, [setRowPage]);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        onClickColumn(1);
    }, [onClickColumn]);

    const filteredRows = useMemo(
        () => {
            let newRows = rows;

            for (let filteredColumnIndex = 0; filteredColumnIndex < filteredColumns.length; filteredColumnIndex++) {
                const {
                    columnIndex,
                    emptyFilter,
                } = filteredColumns[filteredColumnIndex];
                
                const filter = emptyFilterLut.get(emptyFilter);
                if (filter == undefined) {
                    continue;
                }
                const column = columns[columnIndex];

                newRows = newRows.filter((row, index) => {
                    const value = column.rowToString(row, index);
                    return filter(value);
                });
            }

            for (let filteredColumnIndex = 0; filteredColumnIndex < filteredColumns.length; filteredColumnIndex++) {
                const {
                    columnIndex,
                    regexFilter: filter,
                } = filteredColumns[filteredColumnIndex];
                if (filter == undefined) {
                    continue;
                }
                const column = columns[columnIndex];
                
                newRows = newRows.filter((row, index) => {
                    const value = column.rowToString(row, index);
                    return value.match(filter);
                });
            }

            for (let filteredColumnIndex = 0; filteredColumnIndex < filteredColumns.length; filteredColumnIndex++) {
                const filteredColumn = filteredColumns[filteredColumnIndex];
                if(filteredColumn == undefined) {
                    continue;
                }                

                const column = columns[filteredColumn.columnIndex];

                if(column == undefined) {
                    continue;
                }

                const {compareFn} = column;

                if (compareFn == undefined || filteredColumn.sortDirection === "ignored") {
                    continue;
                }
                newRows = newRows.sort(filteredColumn.sortDirection === "asc" ? compareFn : (a, b) => compareFn(b, a));
            }
            return [...newRows];
        },
        [columns, rows, filteredColumns],
    )

    const visibleRows: VisibleRow<R>[] = useMemo(
        () => {
            const result: VisibleRow<R>[] = [];
            const startIndex = rowPage * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;

            for(const [rowIndex, row] of filteredRows.entries()) {
                if(rowIndex < startIndex || rowIndex >= endIndex) {
                    continue;
                }

                result.push({
                    rowIndex: rowIndex,
                    row: row,
                })
            }

            return result;
        },
        [filteredRows, rowPage, rowsPerPage],
    );


    return {
        childProps,
        rowsPerPage, 
        rowPage,
        columns,
        filteredColumns,
        setFilteredColumns,
        rows,
        filteredRows,
        visibleRows,
        canEditColumn,
        open,
        columnPage,
        handleClickOpen,
        handleClose,
        handleChangePage,
        handleChangeRowsPerPage,
        onClickColumn,
        restoreDefaultFilteredColumns,
        snackbarProps,
    }
}