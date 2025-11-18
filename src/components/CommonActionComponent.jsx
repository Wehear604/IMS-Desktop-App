import { Delete, Download, Edit, Visibility } from '@mui/icons-material'
import { Box, CircularProgress, IconButton } from '@mui/material'
import React, { useState } from 'react'
import MessageDilog from './MessageDilog';
import { useDispatch, useSelector } from 'react-redux';
import { callApiAction } from '../store/actions/commonAction';
import { closeModal, openModal } from '../store/actions/modalAction';
import { MODULES_ACTION } from '../utils/module.constant';
import { SNACK_BAR_VARIETNS } from '../utils/constants';
import { callSnackBar } from '../store/actions/snackbarAction';
import { GenerateInventoryQrCodeApi } from '../apis/inventoryLogs.api';
import { saveAs } from "file-saver";

const CommonActionComponent = ({ ViewSize, isSize, callBack, DeleteMessage, DeleteApi, modalkey, modalkeyView, ViewComponent, EditComponent, params, setParams, ModuleMatch, isDownload }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state)

    const OnView = () => {
        dispatch(
            openModal(
                <ViewComponent id={params._id} params={params} isview={true} />,
                ViewSize ? ViewSize : "md",
                false,
                modalkeyView
            )
        );
    };

    const onEdit = () => {
        dispatch(
            openModal(
                <EditComponent
                    id={params._id}
                    params={params}
                    callBack={(updatedData) => {
                        setParams({ ...params, ...updatedData });
                        callBack();
                    }}
                />,
                isSize ? isSize : "sm",
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
                async () => await DeleteApi({ id: params._id }),
                (response) => {
                    setParams({});
                    setLoading(false);
                    dispatch(closeModal("messagedialogdelete"));
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
                    message={DeleteMessage}
                    loading={loading}
                />,
                "sm",
                false,
                "messagedialogdelete"
            )
        );
    };

    const handleQrImageDownload = async () => {
        setLoading(true);
        try {
            const response = await GenerateInventoryQrCodeApi({ _id: params?._id });
            const qrImageBlob = response.data;
            const sanitizeFilename = (name) =>
                name?.replace(/[^a-z0-9_\-]/gi, '_') || 'qr_code';

            const filename = `${sanitizeFilename(params?.materialDetails?.name)}.png`;

            saveAs(qrImageBlob, filename);
        } catch (downloadError) {
            dispatch(callSnackBar("Cannot Download QR", SNACK_BAR_VARIETNS.error));
        } finally {
            setLoading(false);
        }
    };

    const ims_modules = user?.data?.ims_modules ?? [];

    const hasUpdatePermission = ims_modules.some(
        item => item.module === ModuleMatch && item.actions.includes(MODULES_ACTION.UPDATE)
    );

    const hasDeletePermission = ims_modules.some(
        item => item.module === ModuleMatch && item.actions.includes(MODULES_ACTION.DELETE)
    );

    return (
        <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
            {modalkeyView && <IconButton size="inherit" onClick={OnView}>
                <Visibility color="info" fontSize="inherit" />
            </IconButton>}
            {hasUpdatePermission && EditComponent && <IconButton size="inherit" onClick={onEdit}>
                <Edit color="info" fontSize="inherit" />
            </IconButton>}
            {hasDeletePermission && DeleteMessage && <IconButton disabled={loading} size="inherit" onClick={onDelete}>
                <Delete color="error" fontSize="inherit" />
            </IconButton>}
            {isDownload && <IconButton onClick={handleQrImageDownload} disabled={loading}>
                {loading ? (
                    <CircularProgress size={24} />
                ) : (
                    <Download sx={{ color: "#255766" }} />
                )}
            </IconButton>}
        </Box>)
}

export default CommonActionComponent