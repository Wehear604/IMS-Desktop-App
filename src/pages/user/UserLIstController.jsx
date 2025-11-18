import { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { callApiAction } from "../../store/actions/commonAction"
import { closeModal, openModal } from "../../store/actions/modalAction"
import { findNameByRole } from "../../utils/main"
import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material"
import { useMemo } from "react"
import { ChangeCircle, Delete, Edit, LockOpen, Undo } from "@mui/icons-material"
import MessageDilog from "../../components/MessageDilog"
import { SNACK_BAR_VARIETNS, USER_ROLES } from "../../utils/constants"
import CreateUserController from "./CreateUserController"
import ListUi from "./UserLIstUI"
import { deleteUserApi, getUserApi, userUndoDeleteApi } from "../../apis/user.api"
import { callSnackBar } from "../../store/actions/snackbarAction"
import ResetPasswordController from "./ResetPasswordController"
import ModulePermissionController from "./ModulePermissionController"
import { useCallback } from "react"

const ActionComponent = ({ params, setParams, deleteApi, deleted, filters, setFilters }) => {
    const dispatch = useDispatch()

    const [loading, setLoading] = useState(false)
    const { user } = useSelector(state => state)

    const onEdit = () => {
        dispatch(openModal(<CreateUserController id={params._id} callBack={(response, updatedData) => {
            setParams({ ...params, ...updatedData })
        }} />, "sm"))
    }

    const onResetPassword = () => {
        dispatch(openModal(<ResetPasswordController id={params._id} callBack={(response, updatedData) => {
            setParams({ ...params, ...updatedData })
        }} />, "sm"))
    }

    const deleteFun = async (e) => {
        e.preventDefault()
        setLoading(true)
        dispatch(callApiAction(
            async () => await deleteUserApi({ id: params._id }),
            (response) => {
                setParams({})
                setLoading(false)
                dispatch(callSnackBar(params.name + "Deleted Successfully", SNACK_BAR_VARIETNS.suceess))
                setFilters({ ...filters, deleted: null, pageSize: filters.pageSize - 1, search: filters.search === "" })

            },
            (err) => {
                setLoading(false)
            }
        ))
        dispatch(closeModal())


    }

    const undoDeleteFun = async (e) => {
        e.preventDefault();
        setLoading(true)
        dispatch(callApiAction(
            async () => await userUndoDeleteApi({ id: params._id }),
            (response) => {
                setParams({})
                setFilters({ ...filters, deleted: true, pageSize: filters.pageSize - 1, })
                setLoading(false)
            },
            (err) => {
                setLoading(false)
            }
        ))
        dispatch(closeModal())


    }
    const onDelete = (e) => {

        dispatch(openModal(<MessageDilog onSubmit={deleteFun} title="Alert!" message={`Are you sure to delete "${params.name || params.title}" ?`} />, "sm"))
    }
    const onEdits = () => {
        dispatch(
            openModal(
                <ModulePermissionController
                    id={params._id}
                    {...params}
                    callBack={(updatedData) => {
                        console.log(updatedData);
                        setParams({ ...params, ...updatedData });
                    }}
                />,
                "sm",
                false,
                "ims_modules"
            )
        );
    };
    const onUndo = () => {
        dispatch(openModal(<MessageDilog onSubmit={undoDeleteFun} title="Alert!" message={`Are you sure to undo delete for "${params.name || params.title}" ?`} />, "sm"))
    }
    if (params.deleted)
        return <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
            <IconButton onClick={onUndo}>
                <Undo color="error" />
            </IconButton>
        </Box>
    return <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
        {user.data.role === USER_ROLES.ADMIN && <Tooltip title="Module Access">
            <IconButton disabled={loading} size="inherit" onClick={onEdits}>
                <ChangeCircle color="info" fontSize="inherit" />
            </IconButton>
        </Tooltip>}
        {<IconButton disabled={loading} size="inherit" onClick={onEdit}>
            <Edit color="info" fontSize="inherit" />
        </IconButton>}
        <IconButton disabled={loading} size="inherit" onClick={onResetPassword}>
            <LockOpen color="info" fontSize="inherit" />
        </IconButton>
        {user.data.role === USER_ROLES.ADMIN && <>

            {loading && <CircularProgress color="primary" fontSize="inherit" />}
            {!loading && <IconButton disabled={loading} size="inherit" onClick={onDelete}>
                <Delete color="error" fontSize="inherit" />
            </IconButton>}
        </>}
    </Box>
}

const ListController = () => {
    const dispatch = useDispatch()



    const title = "Team Members"
    const fetchApi = getUserApi
    const deleteApi = deleteUserApi
    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 10,
        searchable: ['name', "email"],
        search: '',
        role: '',
        sort: '',
        sortDirection: -1,
        deleted: null

    })

    const columns = useMemo(() => {

        const arr = [

            { id: 1, fieldName: 'name', label: 'Name', align: "left", sort: true },
            { id: 2, fieldName: 'email', label: 'Email', align: "left", sort: true },
            { id: 6, fieldName: 'phone', label: 'Phone', align: "left", sort: true },

            {
                id: 4,
                fieldName: 'role',
                label: 'Role',

                sort: true,
                align: "left",
                renderValue: (params) => findNameByRole(params.role) || '',
            },
            {
                id: 7, fieldName: '', label: 'Inventory', align: "left", sort: true,
                renderValue: (params) => params?.inventory?.name || 'NA'
            },



        ]

        if (filters.deleted) {
            arr.push(

                {
                    id: 6,
                    fieldName: 'deletedaction',
                    label: 'Action',

                    align: "right",
                    renderValue: (params, setParams) => <ActionComponent key={Math.random()} deleted={true}
                        deleteApi={deleteApi}
                        params={{ ...params, deleted: true }} setParams={setParams} filters={filters} setFilters={setFilters} />,
                }
            )
        } else {

            arr.push({
                id: 5,
                fieldName: 'action',
                label: 'Action',

                align: "right",
                renderValue: (params, setParams) => <ActionComponent key={Math.random()}
                    deleteApi={deleteApi}
                    params={params} setParams={setParams} filters={filters} setFilters={setFilters} />,
            })
        }

        return arr

    }, [deleteApi, filters]);


    const [loading, setLoading] = useState(false)
    const [list, setList] = useState({})

    const fetchList = useCallback(() => {
        setLoading(true)
        dispatch(callApiAction(
            async () => await fetchApi({ ...filters }),
            (response) => {
                setList(response)
                setLoading(false)
            },
            (err) => {
                setLoading(false)
            }
        ))
    }, [dispatch, filters, fetchApi])
    const onCreateBtnClick = () => {
        dispatch(openModal(<CreateUserController callBack={async () => { fetchList() }} />, "sm"))
    }



    useEffect(() => {
        fetchList()
    }, [filters, fetchList])


    return (
        <>
            <ListUi
                title={title}
                onCreateBtnClick={onCreateBtnClick}
                filters={filters}
                setFilters={setFilters}
                loading={loading}
                list={list}
                columns={columns}


            />

        </>
    )
}
export default ListController