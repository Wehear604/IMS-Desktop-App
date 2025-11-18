import { memo, useEffect, useMemo, useReducer, useState } from "react"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Skeleton, TablePagination, Typography } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";


const columnReducer = (state, action) => {

    if (action.type == "SORT_FILED") {
        const id = action.id
        const columns = [...state]
        let i = 0
        for (let column of columns) {
            if (columns[i].sort) {
                let previous = 0
                if (columns[i]['sortDirection']) {
                    previous = columns[i]['sortDirection']
                    columns[i]['sortDirection'] = 0
                } else {
                    columns[i] = { ...columns[i], sortDirection: 0 }
                }

                if (column.id == id) {
                    columns[i]['sortDirection'] = (previous == 1 ? -1 : 1)
                }
            }

            i++
        }
        return columns
    } else
        return state
}






const TableHeadCell = memo(({ label, align, allowedSort, maxWidth, minWidth, dispatchColumns, id, sortDirection, isFirst, isLast }) => {

    const onSortClick = () => {
        if (allowedSort)
            dispatchColumns({ type: "SORT_FILED", id: id })
    }

    return <TableCell onClick={onSortClick} sx={(theme) => ({ minWidth: minWidth ?? 100, cursor: allowedSort ? "pointer" : "default", alignItems: "center", color: theme.palette.light.main, backgroundColor: theme.palette.primary.main, borderTopLeftRadius: isFirst ? (theme.shape.borderRadius * 0.5) : 0, borderTopRightRadius: isLast ? (theme.shape.borderRadius * 0.5) : 0 })}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
            {label}
            {(sortDirection !== 0 && sortDirection) &&
                <Box sx={{ display: "inline-flex", flexDirection: "column" }}>
                    {sortDirection == 1 ? <ArrowUpward color="light" /> : <ArrowDownward color="light" />}




                </Box>
            }
        </Box>

    </TableCell>
})

const DataTableRow = memo(({ data, columns, even }) => {

    const [rowData, setRowData] = useState(data)
    if (rowData && Object.keys(rowData).length > 0)
        return <TableRow sx={{ background: even ? "#f2f2f2" : "" }}>
            {
                columns.map((column, index) => {
                    if (!column.hide)
                        return <TableCell key={column.id} sx={{ maxWidth: column.maxWidth ?? "200px", wordWrap: "break-word" }} align={column.align ?? "left"} >
                            {
                                column.renderValue ? column.renderValue(rowData, setRowData) : rowData[column.fieldName]
                            }
                        </TableCell>
                })
            }

        </TableRow>

    return <></>
})


const DataTable = ({ columns, rows, count, filters, setFilters, loading, noPagination }) => {


    const [tableColumns, dispatchColumns] = useReducer(columnReducer, columns)
    const [columnChangeCount, setColumnChangeCount] = useState(0)
    const initialColumnValues = useMemo(() => columns, [])

    const handleChangePage = (e, newVal) => {

        setFilters({ ...filters, pageNo: newVal + 1 })
    }
    const handleChangeRowsPerPage = (e) => {
        setFilters({ ...filters, pageNo: 1, pageSize: e.target.value })
    }

    useEffect(() => {

        setColumnChangeCount(columnChangeCount + 1)
    }, [
        tableColumns
    ])

    useEffect(() => {
        if (columnChangeCount > 1) {
            let changedColumn = {}
            for (let column of tableColumns) {
                if (column.sort && column.sortDirection && column.sortDirection != 0) {
                    changedColumn = column
                    break;
                }
            }
            setFilters({ ...filters, sort: changedColumn.fieldName, sortDirection: changedColumn.sortDirection })
        }

    }, [columnChangeCount])



    return <><TableContainer sx={(theme) => ({ border: "1px solid" + theme.palette.grey.main, borderRadius: theme.shape.borderRadius * 0.2, overflow: "auto", height: "85%", scrollbarWidth: "none" })}>
        <Table size="small" stickyHeader >
            <TableHead >
                <TableRow>
                    {
                        tableColumns.map((tableColumn, index) => {
                            if (!tableColumn.hide)
                                return <TableHeadCell
                                    maxWidth={tableColumn.maxWidth}
                                    minWidth={tableColumn.minWidth}
                                    isFirst={index == 0 || index == tableColumns.length}
                                    isLast={index == tableColumns.length - 1}
                                    key={tableColumn.id}
                                    id={tableColumn.id}
                                    dispatchColumns={dispatchColumns}
                                    label={tableColumn.label}
                                    allowedSort={tableColumn.sort}
                                    sortDirection={tableColumn.sortDirection}
                                    align={tableColumn.align}
                                />
                        })
                    }
                </TableRow>
            </TableHead>
            <TableBody >
                {!loading && Array.isArray(rows) && rows.map((row, index) => (
                    <DataTableRow
                        even={index % 2}
                        key={row._id}
                        data={row}
                        columns={initialColumnValues}
                    />
                )
                )}

                {loading && [0, 1, 2, 3].map((row) => (
                    <TableRow key={row}>
                        <TableCell colSpan={initialColumnValues.length} >
                            <Skeleton animation="pulse" width={"100%"} height={"50px"} />
                        </TableCell>
                    </TableRow>
                )


                )}

                {
                    !loading && (count == 0) && <TableRow sx={{ height: "27.5vh" }}>
                        <TableCell rowSpan={4} colSpan={initialColumnValues.length}>
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                <Typography variant="h5">
                                    No Data Found
                                </Typography>
                            </Box>
                        </TableCell>
                    </TableRow>
                }
            </TableBody>

        </Table>
    </TableContainer>
        {!loading && !noPagination &&
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                count={count}
                rowsPerPage={filters.pageSize}
                page={filters.pageNo - 1}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        }
    </>

}
export default memo(DataTable)