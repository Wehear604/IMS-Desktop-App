import { memo, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { closeModal, openModal } from "../../store/actions/modalAction"
import { callApiAction } from "../../store/actions/commonAction"
import { Delete, Edit } from "@mui/icons-material"
import { Box, IconButton, Typography } from "@mui/material"
import MessageDilog from "../../components/texts/MessageDilog"
import TypeOfSalesCreateController from "./TypeOfSalesCreateController"
import TypeOfSalesMainUi from "./TypeOfSalesMainUi"
import { deleteTypeofSales } from "../../apis/typeofsale.api"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { fetchTypeOfSalesAction } from "../../store/actions/setting.Action"
import { useCallback } from "react"
import CommonActionComponent from "../../components/CommonActionComponent"
import MODULES from "../../utils/module.constant"

const ActionComponent = memo(({ params, setParams, deleteApi }) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const { settings } = useSelector((state) => state)

    const onEdit = () => {
        dispatch(openModal(<TypeOfSalesCreateController id={params._id}
        />, "sm", false, "updatetypofsales"))
    }

    const deleteFun = async (e) => {
        e.preventDefault()
        setLoading(true)
        dispatch(callApiAction(
            async () => await deleteTypeofSales({ id: params._id }),
            (response) => {
                setParams({})
                setLoading(false)
                dispatch(callSnackBar(params.type + " Deleted Successfully", SNACK_BAR_VARIETNS.suceess))
                dispatch(fetchTypeOfSalesAction(settings.type_of_sales_filters))
                dispatch(closeModal("messagedialogdeletee"))

            },
            (err) => {
                setLoading(false)
            }
        ))
    }

    const onDelete = () => {

        dispatch(openModal(<MessageDilog onSubmit={deleteFun} title="Alert!" modalId="messagedialogdeletee" message={`Are you sure to delete "${params.type || params.title}" ?`} />, "sm", false, "messagedialogdeletee"))
    }


    return <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
        <IconButton size="inherit" onClick={onEdit}>
            <Edit color="info" fontSize="inherit" />
        </IconButton>
        <IconButton
            disabled={loading}
            size="inherit"
            onClick={onDelete}
        >
            <Delete color="error" fontSize="inherit" />
        </IconButton>

    </Box>
})

const TypeOfSalesMainController = () => {
    const dispatch = useDispatch()
    const title = "Type Of sale"
    const deleteApi = deleteTypeofSales
    const { settings, user } = useSelector((state) => state)

    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 10,
        search: '',
        searchable: ['type'],
        sort: '',
        sortDirection: -1

    })

    const getTypeOfSales = useCallback(() => {
        if (JSON.stringify(filters) !== JSON.stringify(settings.type_of_sales_filters)) {
            dispatch(fetchTypeOfSalesAction(filters));
        }
    }, [dispatch, filters, settings.type_of_sales_filters]);

    const columns = useMemo(() => [

        { id: 1, fieldName: 'type', label: 'Type Of Sale', align: "left", sort: true, renderValue: (params, setParams) => <Typography textTransform="capitalize">{params.type}</Typography> },
        {
            id: 5,
            fieldName: '',
            label: 'Action',
            align: "right",
            hide: user?.data?.ims_modules?.find(item => item.module === MODULES.TYPEOFSALES)?.actions?.length === 0 ? true : false,
            renderValue: (params, setParams) =>
                <CommonActionComponent
                    DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
                    DeleteApi={deleteApi}
                    modalkey={"updatetypofsales"}
                    EditComponent={TypeOfSalesCreateController}
                    params={params}
                    setParams={setParams}
                    ModuleMatch={MODULES.TYPEOFSALES}
                    callBack={() => dispatch(fetchTypeOfSalesAction(filters))}
                />
        },

    ], [deleteApi, getTypeOfSales]);

    useEffect(() => {
        getTypeOfSales()
    }, [filters, getTypeOfSales])


    return (
        <>
            <TypeOfSalesMainUi
                title={title}

                filters={filters}
                setFilters={setFilters}
                loading={settings.type_of_sales_loading}
                list={settings.type_of_sales_data}
                columns={columns}


            />

        </>
    )
}
export default TypeOfSalesMainController