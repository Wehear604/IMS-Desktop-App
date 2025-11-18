import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import VersionsUi from "./VersionsUi"
import { Box } from "@mui/material"
import { deleteVersion, fetchVersiones } from "../../apis/version.api"
import moment from "moment"
import { findObjectKeyByValue, unEscapeStr } from "../../utils/main"
import { APP_TYPES } from "../../utils/constants"
import { fetchVersionDataAction } from "../../store/actions/setting.Action"
import CommonActionComponent from "../../components/CommonActionComponent"
import MODULES from "../../utils/module.constant"

const VersionsController = ({ userId }) => {
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()

    const [state, setState] = useState([])
    const [loading, setLoading] = useState(false)
    const { settings } = useSelector((state) => state)

    const fetchVersionsApi = fetchVersiones


    const columns = useMemo(() => [
        { id: 0, fieldName: 'launch_date', label: 'Launch Date', align: "left", sort: true, minWidth: '150px', renderValue: (params) => moment(params.launch_date).format("DD/MM/YYYY") },
        { id: 1, fieldName: 'name', label: 'Name', align: "left", sort: true, minWidth: '150px' },

        { id: 4, fieldName: 'main_id', label: 'Version Code', align: "left", sort: true, minWidth: '150px', renderValue: (params) => params.main_version + "." + params.sub_version },
        { id: 5, fieldName: 'app_type', label: 'Type', align: "left", sort: true, renderValue: (params) => findObjectKeyByValue(params.app_type, APP_TYPES) },
        {
            id: 2, fieldName: 'description', label: 'description', align: "left", renderValue: (params) => <Box
                dangerouslySetInnerHTML={{ __html: unEscapeStr(params.description) }} />
        },
        {
            id: 3, fieldName: 'action', label: 'Action', align: "left", renderValue: (params, setParams) => <CommonActionComponent
                DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
                DeleteApi={deleteVersion}
                params={params}
                setParams={setParams}
                ModuleMatch={MODULES.VERSIONS}
            />
        },
    ], [dispatch]);
    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 10,
        search: "",
        searchable: "",
        sort: "",
        sortDirection: -1,
    })

    // const fetchList = () => {
    //     setLoading(true)
    //     dispatch(callApiAction(
    //         async () => await fetchVersionsApi(filters),
    //         (response) => {
    //             setState(response.result)

    //             setLoading(false)
    //         },
    //         (err) => {
    //             setLoading(false)
    //         }
    //     ))
    // }

    const getVersionList = useCallback(() => {
        if (JSON.stringify(filters) !== JSON.stringify(settings.version_filters)) {
            dispatch(fetchVersionDataAction(filters));
        }
    }, [filters, settings.version_filters, dispatch])
    useEffect(() => {
        getVersionList()
    }, [filters])

    return <VersionsUi
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        setState={setState}
        callBack={getVersionList}
        loading={settings.version_loading}
        state={settings.version_data} />
}
export default VersionsController