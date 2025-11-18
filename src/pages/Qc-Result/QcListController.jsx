import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { useMemo } from "react";
import QcListUi from "./QcListUi";
import { fetchQcResultApi, downloadRxtxCsv } from "../../apis/Qc-Result";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import fileDownload from "js-file-download";
import { useCallback } from "react";

const QcListController = () => {
  const dispatch = useDispatch();

  const title = "QC Result";
  const fetchApi = fetchQcResultApi;

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    searchable: ["name", "email"],
    search: "",
    role: "",
    sort: "",
    sortDirection: -1,
    deleted: null,
  });

  const onDownloadCsv = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await downloadRxtxCsv({}),
        (response) => {
          fileDownload(response, "rxtx.csv");
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
        sort: true,
        renderValue: (params) => params?.SN || "",
      },
      {
        id: 1,
        fieldName: "MAC Address",
        label: "MAC Address",
        align: "left",
        sort: true,
        renderValue: (params) => params?.MAC || "",
      },
      {
        id: 2,
        fieldName: "device",
        label: "Device",
        sort: true,
        align: "left",
        renderValue: (params) => params?.device || "",
      },
      {
        id: 3,
        fieldName: "Vtest",
        label: "Vtest",
        sort: true,
        align: "left",
        renderValue: (params) => params?.Vtest || "",
      },
      {
        id: 4,
        fieldName: "Flash",
        label: "Flash",
        sort: true,
        align: "left",
        renderValue: (params) => params?.Flash || "",
      },
      {
        id: 5,
        fieldName: "Usb",
        label: "USB",
        sort: true,
        align: "left",
        renderValue: (params) => params?.Usb || "",
      },
      {
        id: 6,
        fieldName: "createdAt",
        label: "Created At",
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
    ];
    return arr;
  }, []);

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState({});

  const fetchList = useCallback(() => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await fetchApi({ ...filters, isIncentive: true }),
        (response) => {
          setList(response);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        }
      )
    );
  }, [dispatch, fetchApi, filters]);

  useEffect(() => {
    fetchList();
  }, [filters, fetchList]);

  return (
    <>
      <QcListUi
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
export default QcListController;
