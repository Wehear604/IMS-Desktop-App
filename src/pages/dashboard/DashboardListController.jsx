import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { Chip, Typography } from "@mui/material";
import {
  fetchRawMaterialApi,
} from "../../apis/rawMaterial.api";
import {
  fetchProductCurrentStock,
  fetchRawMaterialCurrentStock,
} from "../../apis/leads.api";
import { LOG_TYPE, MATERIAL_TYPE, USER_ROLES } from "../../utils/constants";
import moment from "moment";
import { findObjectKeyByValue } from "../../utils/main";
import DashboardListUi from "../dashboard/DashboardListUi";
import { fetchDashboardMaterialApi, fetchFgCountApi, fetchRawMaterialCountApi, fetchSfgCountApi, fetchSkdCountApi } from "../../apis/dashboard.api";

const LogTypeComponent = memo(({ params }) => {
  return (
    <Chip size="small" label={findObjectKeyByValue(params.logType, LOG_TYPE)} />
  );
});

const DashboardListController = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user)

  const [buttonStatus, setButtonStatus] = useState("Finished_Good")
  const [Status, setStatus] = useState("Product_Stock")


  const [fields, setFields] = useState({
    projectId: null,
    projectName: null,
  });
  const fetchApi =
    buttonStatus === "Raw_Material"
      ? fetchRawMaterialCountApi
      : buttonStatus === "Finished_Good"
        ? fetchFgCountApi
        : buttonStatus === "Semi_Finished_Good"
          ? fetchSfgCountApi
          : buttonStatus === "Semi_Knocked_Down"
            ? fetchSkdCountApi
            : fetchFgCountApi;

  const Material = (type) => {
    switch (type) {
      case "Finished_Good":
        return { api: fetchFgCountApi, lable: "FG Name", searchable: ["name", "item_code"], materialType: MATERIAL_TYPE.FG };
      case "Semi_Finished_Good":
        return { api: fetchSfgCountApi, lable: "SFG Name", searchable: ["name", "item_code"], materialType: MATERIAL_TYPE.SFG };
      case "Semi_Knocked_Down":
        return { api: fetchSkdCountApi, lable: "SKD Name", searchable: ["name", "item_code"], materialType: MATERIAL_TYPE.SKD };
      case "Raw_Material":
        return { api: fetchRawMaterialCountApi, lable: "Raw Material Name", searchable: ["name", "item_code"], materialType: MATERIAL_TYPE.RAW_MATERIALS };
      default:
        return null;
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: Material(buttonStatus).lable,
        align: "left",
        sort: true,

      },
      {
        id: 2,
        fieldName: "item_code",
        label: "Item Code ",
        align: "left",
        sort: false,
      },

      {
        id: 3,
        fieldName: "available_stock",
        label: "Current Stock",
        align: "left",
        sort: true,
      },
      {
        id: 3,
        fieldName: "total_in_quantity_stock_count",
        label: "In Stock",
        align: "left",
        sort: true,
      },
      {
        id: 4,
        fieldName: "total_out_quantity_stock_count",
        label: "Out Stock",
        align: "left",
        sort: true,
      },
      {
        id: 4,
        fieldName: "total_rejected_quantity_stock_count",
        label: "Rejected Stock",
        align: "left",
        sort: true,
      },
    ],
    [dispatch, buttonStatus]
  );


  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    sort: "",
    sortDirection: -1,
    searchable: Material(buttonStatus).searchable,
  });


  const [loading, setLoading] = useState(false);
  const [list, setList] = useState({});
  const [data, setData] = useState([]);

  const fetchList = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await Material(buttonStatus).api({ ...filters }),
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
  }, [filters, buttonStatus]);

  const fetchProductList = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await fetchDashboardMaterialApi({ materialType: Material(buttonStatus).materialType, projectId: fields.projectId }),
        (response) => {
          setData(response.result);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        }
      )
    );
  };
  console.log("fields.projectId", fields.projectId)
  useEffect(() => {
    if (Status === "Project_Analysis")
      fetchProductList();
  }, [filters, Status, buttonStatus, fields]);

  return (
    <>
      <DashboardListUi
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        setButtonStatus={setButtonStatus}
        buttonStatus={buttonStatus}
        setStatus={setStatus}
        Status={Status}
        list={list}
        columns={columns}
        Material={Material}
        data={data}
        fetchProductList={fetchProductList}
        setData={setData}
        setFields={setFields}
        fields={fields}
      />
    </>
  );
};
export default DashboardListController;
