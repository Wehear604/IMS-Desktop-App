import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { closeModal, openModal } from "../../store/actions/modalAction"
import { callApiAction } from "../../store/actions/commonAction"
import { Delete, Edit } from "@mui/icons-material"
import { Box, IconButton, Typography } from "@mui/material"
import MessageDilog from "../../components/texts/MessageDilog"
import CategoryTypeMainUi from "./CategoryTypeMainUi"
import { deleteCategoryApi } from "../../apis/category.api"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { fetchCategoryAction } from "../../store/actions/setting.Action"
import CategoryTypeCreateController from "./CategoryTypeCreateController"
import MODULES from "../../utils/module.constant"
import CommonActionComponent from "../../components/CommonActionComponent"

const ActionComponent = memo(({ params, setParams }) => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const { settings } = useSelector((state) => state)


    const onEdit = () => {
        dispatch(openModal(<CategoryTypeCreateController id={params._id}
        />, "sm", false, "updatetypofsales"))
    }

    const deleteFun = async (e) => {
        e.preventDefault()
        setLoading(true)
        dispatch(callApiAction(
            async () => await deleteCategoryApi({ id: params._id }),
            (response) => {
                setParams({})
                setLoading(false)
                dispatch(callSnackBar(params.name + " Deleted Successfully", SNACK_BAR_VARIETNS.suceess))
                dispatch(fetchCategoryAction(settings.category_filters))

                dispatch(closeModal("messagedialog"))
            },
            (err) => {
                setLoading(false)
            }
        ))


    }

    const onDelete = () => {

        dispatch(openModal(<MessageDilog onSubmit={deleteFun} title="Alert!" modalId="messagedialog" message={`Are you sure to delete "${params.name || params.title}" ?`} />, "sm", false, "messagedialog"))
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





const CategoryTypeMainController = () => {
    const dispatch = useDispatch()
    const title = "Type Of sale"
    const deleteApi = deleteCategoryApi
    const { settings, user } = useSelector((state) => state)


    const columns = useMemo(() => [

        { id: 1, fieldName: 'type', label: 'Category', align: "left", sort: true, renderValue: (params, setParams) => <Typography textTransform="capitalize">{params.name}</Typography> },
        {
            id: 5,
            fieldName: '',
            label: 'Action',
            align: "right",
            hide: user?.data?.ims_modules?.find(item => item.module === MODULES.CATEGORY)?.actions?.length === 0 ? true : false,
            renderValue: (params, setParams) => <CommonActionComponent
                DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
                DeleteApi={deleteApi}
                modalkey={"updatetypofsales"}
                EditComponent={CategoryTypeCreateController}
                params={params}
                setParams={setParams}
                ModuleMatch={MODULES.CATEGORY}
                callBack={() => dispatch(fetchCategoryAction(filters))}
            />,
        },

    ], [deleteApi]);

    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 10,
        search: '',
        searchable: ['name'],
        sort: '',
        sortDirection: -1

    })

    const getCategoryList = useCallback(() => {
        if (JSON.stringify(filters) !== JSON.stringify(settings.category_filters)) {
            dispatch(fetchCategoryAction(filters));
        }
    }, [filters, dispatch, settings.category_filters])
    useEffect(() => {
        getCategoryList()

    }, [filters, getCategoryList])


    return (
        <>
            <CategoryTypeMainUi
                title={title}
                filters={filters}
                setFilters={setFilters}
                loading={settings.category_loading}
                list={settings.category_data}
                columns={columns}


            />

        </>
    )
}
export default CategoryTypeMainController