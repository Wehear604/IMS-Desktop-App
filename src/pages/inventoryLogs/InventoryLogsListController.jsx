import React, { memo, useEffect, useMemo, useState } from "react";
import InventoryLogsListUi from "./InventoryLogsListUi";
import { openModal } from "../../store/actions/modalAction";
import { useDispatch } from "react-redux";
import InventoryLogsCreateController from "./InventoryLogsCreateController";
import { Box, Chip, CircularProgress, IconButton, Typography } from "@mui/material";
import {
  fetchInventoryLogsApi,
  GenerateInventoryQrCodeApi,
} from "../../apis/inventoryLogs.api";
import { callApiAction } from "../../store/actions/commonAction";
import moment from "moment";
import { findObjectKeyByValue } from "../../utils/main";
import { LOG_TYPE, SNACK_BAR_VARIETNS } from "../../utils/constants";
import { Download, Edit, Info } from "@mui/icons-material";
import InventoryLogsViewController from "./InventoryLogsViewController";
import { useCallback } from "react";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { saveAs } from "file-saver";
import CommonActionComponent from "../../components/CommonActionComponent";
import MODULES from "../../utils/module.constant";
const ActionComponent = memo(({ params, callBack }) => {
  const dispatch = useDispatch();
  const [downloadLoading, setDownloadLoading] = useState(false);

  const onEdit = () => {
    dispatch(
      openModal(
        <InventoryLogsCreateController
          id={params._id}
          callBack={callBack}
        />,
        "md",
        false,
        "update"
      )
    );
  };

  const onInfo = () => {
    dispatch(
      openModal(
        <InventoryLogsViewController params={params} />,
        "md",
        false,
        "infoupdatee"
      )
    );
  };

  const handleQrImageDownload = async () => {
    setDownloadLoading(true);
    try {
      const response = await GenerateInventoryQrCodeApi({ _id: params._id });
      const qrImageBlob = response.data;
      const sanitizeFilename = (name) =>
        name?.replace(/[^a-z0-9_\-]/gi, '_') || 'qr_code';

      const filename = `${sanitizeFilename(params?.materialDetails?.name)}.png`;

      saveAs(qrImageBlob, filename);
    } catch (downloadError) {
      dispatch(callSnackBar("Cannot Download QR", SNACK_BAR_VARIETNS.error));
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
      {
        <IconButton size="inherit" onClick={onInfo}>
          <Info color="info" fontSize="inherit" />
        </IconButton>
      }

      {!params.iqc?.quantity && (
        <IconButton size="inherit" onClick={onEdit}>
          <Edit color="info" fontSize="inherit" />
        </IconButton>
      )}
      <IconButton onClick={handleQrImageDownload} disabled={downloadLoading}>
        {downloadLoading ? (
          <CircularProgress size={24} />
        ) : (
          <Download sx={{ color: "#255766" }} />
        )}
      </IconButton>
    </Box>
  );
});

const InventoryLogsListController = () => {
  const dispatch = useDispatch();
  const id = "inventoryLog";
  const [list, setList] = useState({});
  const [loading, setLoading] = useState(false);

  const onCreateBtnClick = () => {
    dispatch(
      openModal(
        <InventoryLogsCreateController callBack={fetchList} />,
        "sm",
        false,
        id
      )
    );
  };

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name"],
    sort: "",
    sortDirection: -1,
  });

  const fetchList = useCallback(() => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await fetchInventoryLogsApi({ ...filters }),
        (response) => {
          setList(response);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        }
      )
    );
  }, [dispatch, filters]);
  useEffect(() => {
    fetchList();
  }, [filters, fetchList]);

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "",
        label: "Date",
        align: "left",
        sort: true,
        renderValue: (params, setParams) =>
          moment(params?.date).format("DD/MM/YYYY"),
      },
      {
        id: 2,
        fieldName: "grn_number",
        label: "GRN Number",
        align: "left",
        // sort: true,
        // renderValue: (params, setParams) => params?.materialCollection,
      },

      {
        id: 2,
        fieldName: "",
        label: "Material Type",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => params?.materialCollection,
      },

      {
        id: 3,
        fieldName: "",
        label: "Material Name",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => params?.materialDetails?.name,
      },

      {
        id: 5,
        fieldName: "",
        label: "Quantity",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => params?.quantity,
      },
      {
        id: 4,
        fieldName: "",
        label: "Amount",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => params?.amount || "N/A",
      },
      // {
      //   id: 6,
      //   fieldName: "",
      //   label: "Vendor",
      //   align: "left",
      //   sort: true,
      //   renderValue: (params, setParams) => params?.vendor?.name ?? "NA",
      // },
      {
        id: 9,
        fieldName: "",
        label: "Status",
        align: "left",
        sort: true,
        renderValue: ({ iqc }) => (
          <Chip
            label={iqc?.quantity ? 'IQC Completed' : 'IQC Pending'}
            color={iqc?.quantity ? 'success' : 'error'}
            variant="outlined"
          />
        )
      },
      {
        id: 8,
        fieldName: "",
        label: "Action",
        align: "right",
        renderValue: (params, setParams) => (
          <CommonActionComponent
            ViewComponent={InventoryLogsViewController}
            modalkeyView={"infoupdatee"}
            // DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}0
            // DeleteApi={deleteApi}
            modalkey={"update"}
            EditComponent={!params.iqc?.quantity && InventoryLogsCreateController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.GRN}
            callBack={() => fetchList()}
            isDownload={true}
          />
        ),
      },
    ],
    [fetchList]
  );

  return (
    <InventoryLogsListUi
      onCreateBtnClick={onCreateBtnClick}
      list={list}
      setList={setList}
      loading={loading}
      filters={filters}
      columns={columns}
      setFilters={setFilters}
    />
  );
};

export default InventoryLogsListController;
