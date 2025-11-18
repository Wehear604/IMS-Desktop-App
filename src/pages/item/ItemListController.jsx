import React from 'react'
import ItemListUi from './ItemListUi'
import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit } from "@mui/icons-material";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { ITEM_STATUS, SNACK_BAR_VARIETNS } from "../../utils/constants";
import { deleteColorApi } from "../../apis/productColor.api";
import CreateItemController from './CreateItemController';
import { FetchItemApi } from '../../apis/item.api';
import CommonActionComponent from '../../components/CommonActionComponent';
import MODULES from '../../utils/module.constant';
import { findObjectKeyByValue } from '../../utils/main';
import ItemViewUI from './ItemViewUI';

const ActionComponent = memo(({ params, setParams, deleteApi }) => {
    const dispatch = useDispatch();
    const modalkey = "edit";
    const [loading, setLoading] = useState(false);

    const onEdit = () => {
        dispatch(
            openModal(
                <CreateItemController
                    id={params._id}
                    callBack={(response, updatedData) => {
                        setParams({ ...params, ...updatedData });
                    }}
                />,
                "sm",
                false,
                modalkey
            )
        );
    };

    const deleteFun = async (e) => {
        e.preventDefault()
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await deleteColorApi({ id: params._id }),
                (response) => {
                    setParams({});
                    setLoading(false);
                    dispatch(closeModal("messagedialogdelete"));
                    dispatch(callSnackBar(params.name + " Deleted Successfully", SNACK_BAR_VARIETNS.suceess))

                },
                (err) => {
                    setLoading(false);
                }
            )

        );


    };

    const onDelete = () => {
        dispatch(
            openModal(
                <MessageDilog
                    onSubmit={(e) => deleteFun(e)}
                    title="Alert!"
                    modalId="messagedialogdelete"
                    message={`Are you sure to delete "${params.name || params.title}" ?`}
                />,
                "sm",
                false,
                "messagedialogdelete"
            )
        );
    };

    return (
        <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
            <IconButton size="inherit" onClick={onEdit}>
                <Edit color="info" fontSize="inherit" />
            </IconButton>
            <IconButton disabled={loading} size="inherit" onClick={onDelete}>
                <Delete color="error" fontSize="inherit" />
            </IconButton>
        </Box>
    );
});


const ItemListController = () => {
    const dispatch = useDispatch();
    const title = "Item ";
    const { settings, user } = useSelector((state) => state)
    const deleteApi = deleteColorApi;
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState();

    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 10,
        search: "",
        searchable: ["name"],
        sort: "createdAt",
        sortDirection: -1,
    });

    const fetchList = () => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await FetchItemApi({ ...filters }),
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
                fieldName: "name",
                label: "Item Name",
                align: "left",
                sort: true,
                renderValue: (params, setParams) => (
                    <Typography textTransform="capitalize">{params?.name}</Typography>
                ),
            },
            { id: 2, fieldName: 'item_type', label: 'Item Type', align: "left", sort: false, renderValue: (params, setParams) => (<Typography textTransform="capitalize">{params?.itemType?.name}</Typography>) },
           
            {
                id: 6,
                fieldName: "userName",
                label: "User Name",
                align: "left",
                sort: false,
            },
            {
                id: 4,
                fieldName: "status",
                label: "Status",
                align: "left",
                sort: false,
                renderValue: ({ status }) => {
                    const label = Object.keys(ITEM_STATUS).find(k => ITEM_STATUS[k] === status);
                    const color = label === "AVAILABLE" ? "success" : label === "ASSIGNED" ? "primary" : "default";
                    return status && <Chip label={label} color={color} size="small" />;
                },
            },                   
            {
                id: 5,
                fieldName: "",
                label: "Action",
                align: "right",
                hide: user?.data?.ims_modules?.find(item => item.module === MODULES.ASSET)?.actions?.length === 0 ? true : false,
                renderValue: (params, setParams) => (
                    <CommonActionComponent
                        modalkeyView={"item-view"}
                        ViewComponent={ItemViewUI}
                        ViewSize={"lg"}
                        DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
                        DeleteApi={deleteApi}
                        modalkey={"edit"}
                        EditComponent={CreateItemController}
                        params={params}
                        setParams={setParams}
                        ModuleMatch={MODULES.ASSET}
                        callBack={() => fetchList()}
                    />
                ),
            },
        ],
        [dispatch, fetchList]
    );

    useEffect(() => {
        fetchList();
    }, [filters]);


    return (
        <ItemListUi
            title={title}
            filters={filters}
            setFilters={setFilters}
            loading={loading}
            list={list}
            columns={columns}
            callBack={() => fetchList()}
        />
    )
}

export default ItemListController