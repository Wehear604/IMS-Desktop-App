import React, { useEffect, useMemo, useState } from 'react'
import DataTable from '../../components/tables/DataTable'
import { useDispatch } from 'react-redux';
import { callApiAction } from '../../store/actions/commonAction';
import { findObjectKeyByValue } from '../../utils/main';
import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import { ITEM_STATUS } from '../../utils/constants';
import { FetchItemApi, getItemHistoryByIdApi } from '../../apis/item.api';
import CustomDialog from '../../components/layouts/common/CustomDialog';
import { CenteredBox } from '../../components/layouts/OneViewBox';
import moment from 'moment';

const ItemViewUI = ({ params }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState();

    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 10,
        search: "",
        searchable: ["name"],
        sort: "",
        sortDirection: -1,
    });

    const fetchList = () => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await getItemHistoryByIdApi({ ...filters, id: params?._id }),
                (response) => {
                    setList(response)
                    setLoading(false);
                },
                (err) => {
                    setLoading(false);
                }
            )
        );
    };

    const columns = useMemo(
        () => [
            {
                id: 1,
                label: "From Date",
                align: "left",
                sort: true,
                renderValue: (params, setParams) => (
                    <Typography textTransform="capitalize">{moment(params?.item?.createdAt).format("DD/MM/YYYY hh:mm A")}</Typography>
                ),
            },
            {
                id: 2,
                label: "To Date",
                align: "left",
                sort: true,
                renderValue: (params, setParams) => (
                    params?.status === ITEM_STATUS.AVAILABLE && <Typography textTransform="capitalize">{moment(params?.updatedAt).format("DD/MM/YYYY hh:mm A")}</Typography>
                ),
            },
            {
                id: 3,
                fieldName: "name",
                label: "Item Name",
                align: "left",
                sort: true,
                renderValue: (params, setParams) => (
                    <Typography textTransform="capitalize">{params?.item?.name}</Typography>
                ),
            },

            {
                id: 4,
                fieldName: "userName",
                label: "Allocated User Name",
                align: "left",
                sort: false,
                renderValue: (params, setParams) => (
                    <Typography textTransform="capitalize">{params?.assignedBy?.name}</Typography>
                ),
            },
            {
                id: 5,
                fieldName: "userName",
                label: "Collecter User Name",
                align: "left",
                sort: false,
                renderValue: (params, setParams) => (
                    <Typography textTransform="capitalize">{params?.unassignedBy?.name}</Typography>
                ),
            },
            {
                id: 6,
                fieldName: "userName",
                label: "Employee Name",
                align: "left",
                sort: false,
            },
            {
                id: 7,
                fieldName: "status",
                label: "Status",
                align: "left",
                sort: false,
                renderValue: (params, setParams) => {
                    const label = Object.keys(ITEM_STATUS).find(k => ITEM_STATUS[k] === params?.status);
                    const color = label === "AVAILABLE" ? "success" : label === "ASSIGNED" ? "primary" : "default";
                    return <Chip label={label} color={color} size="small" />;
                },
            },
        ],
        [dispatch, fetchList]
    );

    useEffect(() => {
        fetchList();
    }, [filters]);

    return (<CustomDialog
        id={"item-view"}
        loading={loading}
        title={`${params?.name} History Log`}
    >
        {loading ? <CenteredBox><CircularProgress /></CenteredBox> :
            <Box mt={5}>
                <DataTable noPagination columns={columns} rows={list ? list : []} count={list?.length ?? 0} filters={filters} setFilters={setFilters} loading={loading} />
            </Box>}
    </CustomDialog>)
}

export default ItemViewUI