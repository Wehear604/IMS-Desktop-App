import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit, Preview } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import CreateControllerSpecialMarking from "./CreateControllerSpecialMarking";
import SpecialMarkingListUi from "./SpecialMarkingListUi";
import { DeleteSpecialMarkingApi, FetchSpecialMarkingApi } from "../../apis/SpecialMarking.api";
import FilePreviewComponent from "../../components/FilePreviewComponenet";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CommonActionComponent from "../../components/CommonActionComponent";
import MODULES from "../../utils/module.constant";

const ActionComponent = memo(({ params, setParams }) => {
    const dispatch = useDispatch();
    const modalkey = "Update";
    const [loading, setLoading] = useState(false);

    const onEdit = () => {
        dispatch(
            openModal(
                <CreateControllerSpecialMarking
                    id={params._id}
                    callBack={(response) => {
                        setParams({ ...params, ...response });
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
                async () => await DeleteSpecialMarkingApi({ id: params._id }),
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

const SpecialMarkingListController = () => {
    const dispatch = useDispatch();
    const title = "Special Marking";
    const [list, SetList] = useState();
    const [loading, setLoading] = useState(false);
    const { settings, user } = useSelector((state) => state)

    const PreviewImage = (item) => {
        dispatch(
            openModal(
                <FilePreviewComponent device_photo={item} />,
                "sm",
            )
        );
    }


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
                async () => await FetchSpecialMarkingApi({ ...filters }),
                (response) => {
                    SetList(response)
                    setLoading(false);
                },
                (err) => {
                    setLoading(false);
                }
            )
        );
    }

    const columns = useMemo(
        () => [
            {
                id: 1,
                fieldName: "name",
                label: "Name",
                align: "left",
                sort: true,
                renderValue: (params, setParams) => (
                    <Typography textTransform="capitalize">{params.name}</Typography>
                ),
            },
            // {
            //     id: 1,
            //     fieldName: "Image",
            //     label: "Image",
            //     align: "left",
            //     sort: true,
            //     renderValue: (params, setParams) => (<RemoveRedEyeIcon color="primary" sx={{ cursor: "pointer" }} onClick={() => PreviewImage(params?.image)}> </RemoveRedEyeIcon>),
            // },
            {
                id: 2,
                fieldName: "",
                label: "Action",
                align: "right",
                hide: user?.data?.ims_modules?.find(item => item.module === MODULES.SPECIAL_MARKING)?.actions?.length === 0 ? true : false,
                renderValue: (params, setParams) => (
                    <CommonActionComponent
                        DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
                        DeleteApi={DeleteSpecialMarkingApi}
                        modalkey={"Update"}
                        EditComponent={CreateControllerSpecialMarking}
                        params={params}
                        setParams={setParams}
                        ModuleMatch={MODULES.SPECIAL_MARKING}
                        callBack={() => fetchList()}
                    />
                ),
            },
        ],
        [fetchList]
    );

    useEffect(() => {
        fetchList()
    }, [filters])

    return (
        <>
            <SpecialMarkingListUi
                title={title}
                filters={filters}
                setFilters={setFilters}
                loading={loading}
                list={list}
                columns={columns}
                callBack={() => fetchList()}
            />
        </>
    );
};
export default SpecialMarkingListController;
