import React, { memo, useEffect, useMemo, useState } from 'react'
import { openModal } from '../../store/actions/modalAction';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Chip, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { fetchStockInOutApi, GenerateInventoryQrCodeApi } from '../../apis/inventoryLogs.api';
import { Download, Edit, Info, Visibility } from "@mui/icons-material";
import { callApiAction } from '../../store/actions/commonAction';
import moment from 'moment';
import { findObjectKeyByValue } from '../../utils/main';
import { LOG_TYPE, SNACK_BAR_VARIETNS } from '../../utils/constants';
import UpdateStockController from './UpdateStockController';
import StockInOutListUi from './StockInOutListUi';
import { useParams } from 'react-router-dom';
import { saveAs } from "file-saver";
import { callSnackBar } from '../../store/actions/snackbarAction';
import RejectedQuantityController from './RejectedQuantityController';
import CommonActionComponent from '../../components/CommonActionComponent';
import MODULES from '../../utils/module.constant';

const ActionComponent = memo(({ params, setParams, Type }) => {
  const dispatch = useDispatch();
  const modalkey = "RejectedQuantity";

  const onEdit = () => {
    dispatch(
      openModal(
        <RejectedQuantityController
          _id={params._id}
          params={params}
          callBack={(response) => {
            setParams({ ...response });
          }}
        />,
        "md",
        false,
        modalkey
      )
    );
  };

  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleQrImageDownload = async (params) => {
    setDownloadLoading(true);
    try {
      const response = await GenerateInventoryQrCodeApi({ _id: params?._id });
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

  const onInfo = () => {
    dispatch(
      openModal(
        <RejectedQuantityController params={params} isview={true} />,
        "md",
        false,
        modalkey
      )
    );
  };
  return (
    <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
      {params?.rejected?.length > 0 && Type === LOG_TYPE.Out && <Tooltip title={"Total Rejected Quantity"}>
        <IconButton size="inherit" onClick={onInfo}>
          <Visibility color="info" fontSize="inherit" />
        </IconButton>
      </Tooltip>}
      {!params?.isReturned && Type === LOG_TYPE.Out && <Tooltip title={"Rejected Quantity"}>
        <IconButton size="inherit" onClick={onEdit}>
          <Edit color="info" fontSize="inherit" />
        </IconButton></Tooltip>}
      <IconButton onClick={() => handleQrImageDownload(params)} disabled={downloadLoading}>
        {downloadLoading ? (
          <CircularProgress size={24} />
        ) : (
          <Download sx={{ color: "#255766" }} />
        )}
      </IconButton>
    </Box>
  );
});

const StockInOutListController = ({ Type }) => {
  const dispatch = useDispatch()
  const params = useParams();

  const id = 'stockInOut';
  const [list, setList] = useState({})
  const [loading, setLoading] = useState(false)

  const onCreateBtnClick = () => {
    dispatch(openModal(
      <UpdateStockController
        id={params._id}
        Type={Type}
        callBack={() => { fetchList() }}
      />, "sm", false, id))
  }

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name"],
    sort: "",
    sortDirection: -1,
  });


  const fetchList = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await fetchStockInOutApi({ ...filters, Type }),
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

  const columns = useMemo(
    () => [

      {
        id: 1,
        fieldName: "",
        label: "Date",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => moment(params?.date).format("DD/MM/YYYY") || "NA",
      },

      {
        id: 2,
        fieldName: "",
        label: "Material Type",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => params?.materialCollection || "NA",
      },

      {
        id: 3,
        fieldName: "",
        label: "Material Name",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => params?.materialDetails?.name || "NA",
      },

      {
        id: 8,
        fieldName: "",
        label: "Batch Number",
        align: "left",
        sort: true,
        renderValue: (params, setParams) =>
          params?.batchNumbers?.map((item, index) => (
            <Chip
              sx={{ mr: 1 }}
              key={index}
              label={`${item?.batchNumber}`}
              color="info"
              variant="outlined"
            />
          )),
      },


      {
        id: 5,
        fieldName: "",
        label: "Quantity",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => params?.quantity || "NA",
      },
      {
        id: 4,
        fieldName: "",
        label: "Amount",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => params?.amount || "NA",
      },

      {
        id: 6,
        fieldName: "",
        label: "Vendor",
        align: "left",
        sort: true,
        hide: Type === LOG_TYPE.Out,
        renderValue: (params, setParams) => params?.vendor?.name || "NA",
      },
      {
        id: 6,
        fieldName: "",
        label: "Category",
        align: "left",
        sort: true,
        hide: Type === LOG_TYPE.In,
        renderValue: (params, setParams) => params?.category?.name || "NA",
      },
      {
        id: 8,
        fieldName: "",
        label: "Invoice Number",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => <span
          dangerouslySetInnerHTML={{
            __html:
              params?.invoiceNumber || "NA",
          }} />,
      },
      {
        id: 12,
        fieldName: "",
        label: "Action",
        align: "right",
        renderValue: (params, setParams) => (
          // <ActionComponent
          //   params={params}
          //   setParams={setParams}
          //   Type={Type}
          // />
          <CommonActionComponent
            ViewComponent={RejectedQuantityController}
            modalkeyView={Type === LOG_TYPE.Out && params.isReturned && "RejectedQuantity"}
            modalkey={"RejectedQuantity"}
            EditComponent={!params.isReturned && RejectedQuantityController}
            params={params}
            setParams={setParams}
            ModuleMatch={Type === LOG_TYPE.In ? MODULES.STOCK_IN : MODULES.STOCK_OUT}
            isDownload={true}
            isSize={"md"}
            callBack={() => fetchList()}
          />
        ),
      }

    ],
    [dispatch, Type]
  );

  useEffect(() => {
    fetchList();
  }, [filters, Type]);

  return (
    <StockInOutListUi
      onCreateBtnClick={onCreateBtnClick}
      list={list}
      setList={setList}
      loading={loading}
      filters={filters}
      columns={columns}
      setFilters={setFilters}
      Type={Type}
    />
  )
}

export default StockInOutListController