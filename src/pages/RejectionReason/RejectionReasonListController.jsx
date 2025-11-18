import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import { fetchRejectionReasonAction } from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";

import { deleteRejectionReasonApi } from "../../apis/rejectionReason.api";
import RejectionReasonListUi from "./RejectionReasonListUi";
import RejectionReasonCreateController from "./RejectionReasonCreateController";
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
                <RejectionReasonCreateController
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
                async () => await deleteRejectionReasonApi({ id: params._id }),
                (response) => {
                    setParams({});
                    setLoading(false);
                    dispatch(closeModal("messagedialogdelete"));
                    dispatch(fetchRejectionReasonAction(settings.RejectionReason_filters))
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

const RejectionReasonListController = () => {
    const dispatch = useDispatch();
    const { settings, user } = useSelector((state) => state)
    const title = "Rejection Reason";
    const deleteApi = deleteRejectionReasonApi;

    const columns = useMemo(
        () => [
            {
                id: 1,
                fieldName: "name",
                label: "Rejection Reason",
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
                hide: user?.data?.ims_modules?.find(item => item.module === MODULES.REJECTION_REASON)?.actions?.length === 0 ? true : false,
                renderValue: (params, setParams) => (
                    <CommonActionComponent
                        DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
                        DeleteApi={deleteApi}
                        modalkey={"delete"}
                        EditComponent={RejectionReasonCreateController}
                        params={params}
                        setParams={setParams}
                        ModuleMatch={MODULES.REJECTION_REASON}
                        callBack={() => dispatch(fetchRejectionReasonAction(filters))}
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



    const getRejectionReasonList = useCallback(() => {
        if (JSON.stringify(filters) !== JSON.stringify(settings.RejectionReason_filters)) {
            dispatch(fetchRejectionReasonAction(filters));
        }
    }, [filters, settings.RejectionReason_filters, dispatch]);
    useEffect(() => {
        getRejectionReasonList()

    }, [filters, getRejectionReasonList])

    return (
        <>
            <RejectionReasonListUi
                title={title}
                filters={filters}
                setFilters={setFilters}
                loading={settings.RejectionReason_loading}
                list={settings.RejectionReason_data}
                columns={columns}
            />
        </>
    );
};
export default RejectionReasonListController;
