import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import { fetchInventoryMasterAction } from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";

import InventoryMasterCreateController from "./InventoryMasterCreateController";
import { deleteInventoryMaster } from "../../apis/inventoryMaster.api";
import InventoryMasterListUi from "./InventoryMasterListUi";
import { useCallback } from "react";
import CommonActionComponent from "../../components/CommonActionComponent";
import MODULES from "../../utils/module.constant";

const ActionComponent = memo(({ params, setParams, deleteApi }) => {
    const dispatch = useDispatch();
    const modalkey = "delete";
    const [loading, setLoading] = useState(false);
    const { settings } = useSelector((state) => state)

    const onEdit = () => {
        dispatch(
            openModal(
                <InventoryMasterCreateController
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
                async () => await deleteInventoryMaster({ id: params._id }),
                (response) => {
                    setParams({});
                    setLoading(false);
                    dispatch(closeModal("messagedialogdelete"));
                    dispatch(fetchInventoryMasterAction(settings.inventoryMaster_filters))
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

const InventoryMasterListController = () => {
    const dispatch = useDispatch();
    const { settings, user } = useSelector((state) => state)
    const title = "Inventory Master";
    const deleteApi = deleteInventoryMaster;

    const columns = useMemo(
        () => [
            {
                id: 1,
                fieldName: "name",
                label: "Inventory Master",
                align: "left",
                sort: true,
                renderValue: (params, setParams) => (
                    <Typography textTransform="capitalize">{params.name}</Typography>
                ),
            },
            {
                id: 2,
                fieldName: "",
                label: "Action",
                align: "right",
                hide: user?.data?.ims_modules?.find(item => item.module === MODULES.INVENTORY_MASTER)?.actions?.length === 0 ? true : false,
                renderValue: (params, setParams) => (
                    <CommonActionComponent
                        DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
                        DeleteApi={deleteApi}
                        modalkey={"delete"}
                        EditComponent={InventoryMasterCreateController}
                        params={params}
                        setParams={setParams}
                        ModuleMatch={MODULES.INVENTORY_MASTER}
                        callBack={() => dispatch(fetchInventoryMasterAction(filters))}
                    />
                ),
            },
        ],
        [deleteApi]
    );

    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 10,
        search: "",
        searchable: ["name"],
        sort: "",
        sortDirection: -1,
    });



    const getinventoryMasterList = useCallback(() => {
        if (JSON.stringify(filters) !== JSON.stringify(settings.inventoryMaster_filters)) {
            dispatch(fetchInventoryMasterAction(filters));
        }
    }, [dispatch, filters, settings.inventoryMaster_filters])
    useEffect(() => {
        getinventoryMasterList()

    }, [filters, getinventoryMasterList])
    console.log("first0", settings.inventoryMaster_data)
    return (
        <>
            <InventoryMasterListUi
                title={title}
                filters={filters}
                setFilters={setFilters}
                loading={settings.inventoryMaster_loading}
                list={settings.inventoryMaster_data}
                columns={columns}
            />
        </>
    );
};
export default InventoryMasterListController;
