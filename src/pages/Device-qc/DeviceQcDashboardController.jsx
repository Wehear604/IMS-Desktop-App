import React, { memo, useEffect, useMemo, useState } from "react";
import DeviceQcDashboardUi from "./DeviceQcDashboardUi";
import { fetchDeviceApi, fetchDeviceCountsApi } from "../../apis/deviceQc.api";
import { useDispatch, useSelector } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import {
  findObjectKeyByValue,
  toTitleCase,
  toTitleSpaceCase,
} from "../../utils/main";
import { Edit, Visibility } from "@mui/icons-material";
import DeviceQcInformationUi from "./DeviceQcInformationUi";
import { openModal } from "../../store/actions/modalAction";
import { DEVICES, QC_BUTTON_FILTER } from "../../utils/constants";
import ProductDetailsQcUi from "../wehearDeviceQc/ProductDetailsQcUi";
import DeviceQcListController from "../wehearDeviceQc/DeviceQcListController";
import SafebudsMainUi from "../wehearDeviceQc/SafebudsUi/SafebudsMainUi";
import { SetStepAction } from "../../store/actions/stepAction";

const ActionComponent = memo(({ params, setParams, buttonStatus }) => {
  const dispatch = useDispatch();
  const {step} = useSelector((state) => state);

  const onInfo = () => {
    dispatch(
      openModal(
        <DeviceQcInformationUi id={params?._id} IsVeiw={true} />,
        "lg",
        false,
        "device-qc-information"
      )
    );
  };

const onEdit = () => {
  dispatch(SetStepAction(4));

  dispatch(
    openModal(
      <SafebudsMainUi
        id={params._id}
        isUpdate={true}
      />,
      "sm",
      false,
      "deviceAudioMicCheck"
    )
  );
};


  return (
    <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
      <IconButton size="inherit" onClick={onInfo}>
        <Visibility color="info" fontSize="inherit" />
      </IconButton>

      {buttonStatus === QC_BUTTON_FILTER.QC_PENDING && (
        <IconButton size="inherit" onClick={onEdit}>
          <Edit color="info" fontSize="inherit" />
        </IconButton>
      )}
    </Box>
  );
});

const DeviceQcDashboardController = () => {
  const dispatch = useDispatch();
  const [list, SetList] = useState([]);
  const [counts, SetCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonStatus, setButtonStatus] = useState(QC_BUTTON_FILTER.ALL);
  const firstDeviceValue = Object.values(DEVICES)[0];
  const [selectedDevices, setSelectedDevices] = useState(firstDeviceValue);

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["boxId"],
    sort: "",
    sortDirection: -1,
  });

  const fetchDevice = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () =>
          await fetchDeviceApi({
            ...filters,
            buttonStatus,
            device: selectedDevices,
          }),
        (response) => {
          SetList(response);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        }
      )
    );
  };

  const fetchDeviceCounts = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () =>
          await fetchDeviceCountsApi({
            ...filters,
            buttonStatus,
            device: selectedDevices,
          }),
        (response) => {
          SetCounts(response);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        }
      )
    );
  };

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "deviceName",
        label: "Device Name",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">
            {findObjectKeyByValue(params?.device, DEVICES) || "NA"}
          </Typography>
        ),
      },
      {
        id: 2,
        fieldName: "boxId",
        label: "Box ID",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">
            {params?.boxId || "NA"}
          </Typography>
        ),
      },
      {
        id: 3,
        fieldName: "deviceColor",
        label: "Device Color",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">
            {toTitleSpaceCase(params?.deviceColor?.name) || "NA"}
          </Typography>
        ),
      },

      {
        id: 4,
        fieldName: "",
        label: "Left Device QC Result",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => {
          const isPassed = params.left.result;

          return (
            <Chip
              label={isPassed ? "Passed" : "Failed"}
              size="small"
              sx={{
                backgroundColor: isPassed ? "success.main" : "error.main",
                color: "#fff",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            />
          );
        },
      },

      {
        id: 5,
        fieldName: "",
        label: "Right Device QC Result",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => {
          const isPassed = params.right.result;

          return (
            <Chip
              label={isPassed ? "Passed" : "Failed"}
              size="small"
              sx={{
                backgroundColor: isPassed ? "success.main" : "error.main",
                color: "#fff",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            />
          );
        },
      },

      {
        id: 6,
        fieldName: "",
        label: "QC Executive",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">
            {toTitleSpaceCase(params?.qcExcecutive?.name) || "NA"}
          </Typography>
        ),
      },

       {
        id: 8,
        fieldName: "",
        label: "Mac Address",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">
            {params?.left?.mac || "NA"}
          </Typography>
        ),
      },

       {
        id: 9,
        fieldName: "",
        label: "Mac Address Before OTA",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">
            {params?.macBeforeOta || "NA"}
          </Typography>
        ),
      },

      {
        id: 7,
        fieldName: "",
        label: "Action",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <ActionComponent
            params={params}
            setParams={setParams}
            buttonStatus={buttonStatus}
          />
        ),
      },
    ],
    [fetchDevice, buttonStatus]
  );

  useEffect(() => {
    fetchDevice();
    fetchDeviceCounts();
  }, [filters, buttonStatus, selectedDevices]);

  return (
    <DeviceQcDashboardUi
      list={list}
      fetchDevice={fetchDevice}
      loading={loading}
      filters={filters}
      setFilters={setFilters}
      columns={columns}
      buttonStatus={buttonStatus}
      setButtonStatus={setButtonStatus}
      counts={counts}
      selectedDevices={selectedDevices}
      setSelectedDevices={setSelectedDevices}
    />
  );
};

export default DeviceQcDashboardController;
