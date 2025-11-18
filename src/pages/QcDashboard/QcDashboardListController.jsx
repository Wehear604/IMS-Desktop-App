import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { useMemo } from "react";
import { fetchQcResultApi, downloadRxtxCsv } from "../../apis/Qc-Result";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { COUNTRY_CATEGORY, SNACK_BAR_VARIETNS, USER_ROLES } from "../../utils/constants";
import QcDashboardListUi from "./QcDashboardListUi";
import { openModal } from "../../store/actions/modalAction";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import QcDashboardDetailsViewUi from "./QcDashboardDetailsViewUi";
import { fetchQcDashboardApi } from "../../apis/qcDashboard.api";
import { titleCase } from "../../utils/main";
// import fileDownload from "js-file-download";

const ActionComponent = memo(({ params, setParams ,callBack}) => {
  console.log("params", params);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const modalkey = "qc-dashboard";

  const DetailedView = () => {
    dispatch(openModal(<QcDashboardDetailsViewUi title={"Qc Details"} params={params}/>, "md", false, "qc-dashboard"))
  }

  return (
    <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
         <Tooltip title={"QC Details View"}>
        <IconButton disabled={loading} size="inherit" onClick={DetailedView}>
          <Visibility color="info" fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  );
});

const QcDashboardListController = () => {
  const dispatch = useDispatch();
  const {user} = useSelector(state=>state)
  const title = "QC Dashboard";
  const fetchApi = fetchQcDashboardApi;

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    searchable: ["box_id","qc_created_by"],
    search: "",
    sort: "createdAt",
    country_category:(user.data.role == USER_ROLES.QC_PACAKAGING ? COUNTRY_CATEGORY.GENERAL : ((user.data.role == USER_ROLES.QC_UAE) ?  COUNTRY_CATEGORY.UAE : "")),
    sortDirection: -1,
  });

  const onDownloadCsv = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await downloadRxtxCsv({}),
        (response) => {
          // fileDownload(response, "qc dashboard.csv");
          setLoading(false);
        },
        (err) => {
          dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error));
          setLoading(false);
        },
        true
      )
    );
  };

  const columns = useMemo(() => {
    const arr = [
      {
        id: 1,
        fieldName: "SN",
        label: "Serial Number",
        align: "left",
        // renderValue: (params) => params?.SN || "",
      },
      {
        id: 2,
        fieldName: "batchNumber",
        label: "Batch Number",
        align: "left",
        renderValue: (params) => params?.product_id?.batchNumber,
      },
      {
        id: 2,
        fieldName: "box_id",
        label: "Box Id",
        align: "left",
        // renderValue: (params) => params?.product_id?.batchNumber,
      },
      {
        id: 3,
        fieldName: "qc_test",
        label: "Qc Pass",
        align: "left",
        renderValue: (params) => {
          const tests = params?.qc_test;
          if (Array.isArray(tests) && tests.length > 0) {
            return tests.every(item => item?.value === true) ? 
            <Chip label="Pass"/> : <Chip label="Fail"/>;
          } else {
            return "NA";
          }
        }
      },
      {
        id: 4,
        fieldName: "device_mac",
        label: "MAC Address",
        align: "left",  
        // renderValue: (params) => params?.MAC || "",
      },
      {
        id: 5,
        fieldName: "device",
        label: "Device",  
        align: "left",
        renderValue: (params) => params?.product_id?.name,
      },
      {
        id: 6,
        fieldName: "qc_created_by",
        label: "Qc Created Name",
        align: "left",
        renderValue: (params) => titleCase(params?.qc_created_by),
      },
      {
        id: 7,
        fieldName: "createdAt",
        label: "Created Date",
        sort: true,
        align: "left",
        renderValue: (params) => {
          if (!params?.createdAt) return "";
          const date = new Date(params.createdAt);
          const options = {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          };
          return new Intl.DateTimeFormat("en-GB", options).format(date);
        },
      },
      {
        id: 8,
        fieldName: "",
        label: "Action",
        align: "left",
        renderValue: (params,setParams) => <>
           <ActionComponent
            params={params}
            setParams={setParams}
            callBack={() => {fetchList()}}
          />
        </>
      },
    ];
    return arr;
  }, [dispatch, filters.deleted]);

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState({});

  const fetchList = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await fetchApi({ ...filters }),
        (response) => {
          setList(response);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        }
      )
    );
  };

  useEffect(() => {
    fetchList();
  }, [filters]);

  return (
    <>
      <QcDashboardListUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        list={list}
        columns={columns}
        onDownloadCsv={onDownloadCsv}
      />
    </>
  );
};
export default QcDashboardListController;
