import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { callApiAction } from "../../store/actions/commonAction"
import VersionDetailsUi from "./VersionDetailsUi"
import { APP_TYPES, CALENDAR_ITEM_TYPES, LOGS_NAMES, SNACK_BAR_VARIETNS } from "../../utils/constants"
import { getDailyLogsApi } from "../../apis/leave.api"
import { calculateWorkingHours, lastReadVersion } from "../../utils/helper"
import moment from "moment"
import { fetchLatestVersion } from "../../apis/version.api"

const VersionDetailsController = ({ date }) => {
    const dispatch = useDispatch()

    const [list, setList] = useState({})
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({})
    const fetchList = async () => {
        setLoading(true)
        dispatch(
            callApiAction(
                async () => await fetchLatestVersion({ app_type: APP_TYPES.WEB }),
                async (response) => {
                    setLoading(false)
                    setList(response)
                    if (response) {
lastReadVersion.set(response.main_version+"-"+response.sub_version)
                    }
                },
                (err) => {
                    setLoading(false)


                    setList({})
                    dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error))
                },
            ),
        )

    }
    useEffect(() => {
        fetchList()
    }, [])
    return <>

        <VersionDetailsUi
            filters={filters}
            setFilters={setFilters}

            list={list}
            loading={loading}
        />

    </>
}
export default VersionDetailsController