import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chip, IconButton } from '@mui/material';
import { openModal } from '../../store/actions/modalAction';
import { callApiAction } from '../../store/actions/commonAction';
import { FetchPurchaseRequestApi, UpdatePurchaseRequestApi } from '../../apis/purchaseRequest.api';
import { findObjectKeyByValue, titleCase } from '../../utils/main';
import { MATERIAL_REQUEST_STATUS, MATERIAL_TYPE, SNACK_BAR_VARIETNS, USER_ROLES } from '../../utils/constants';
import moment from 'moment';

import PurchaseRequestListUi from './PurchaseRequestListUi';
import PurchaseRequestCreateController from './PurchaseRequestCreateController';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import PurchaseRequestViewController from './PurchaseRequestViewController';
import { callSnackBar } from '../../store/actions/snackbarAction';

const ActionComponent = ({ params, onApprove, onReject, onAllocate, onView }) => {
  const { status } = params;
  const { user } = useSelector((state) => state)

  // if (status === MATERIAL_REQUEST_STATUS.REJECTED) {
  //   return <Chip label="Rejected" color="error" variant="contained" />;
  // }
  // if (status === MATERIAL_REQUEST_STATUS.ALLOCATED) {
  //   return <Chip label="Allocated" color="primary" variant="contained" />;
  // }
  if (status === MATERIAL_REQUEST_STATUS.PENDING && user.data._id !== params?.requestCreatedBy?._id && user?.data?.isDepartmentHead) {
    return (
      <>
        <IconButton color="success" onClick={() => onApprove(params, MATERIAL_REQUEST_STATUS.APPROVAL_1)}>
          <CheckCircle />
        </IconButton>
        <IconButton color="error" onClick={() => onReject(params)}>
          <Cancel />
        </IconButton>
      </>
    );
  }
  if (status === MATERIAL_REQUEST_STATUS.APPROVAL_1 && user?.data?.isDepartmentHead && user.data.role === USER_ROLES.INVENTORY) {
    return (
      <>
        <IconButton color="success" onClick={() => onApprove(params, MATERIAL_REQUEST_STATUS.APPROVAL_2)}>
          <CheckCircle />
        </IconButton>
        <IconButton color="error" onClick={() => onReject(params)}>
          <Cancel />
        </IconButton>
      </>
    );
  }
  if (status === MATERIAL_REQUEST_STATUS.APPROVAL_2 && user.data.isAllocator) {
    return (
      <>
        <IconButton color="primary" onClick={() => onAllocate(params)}>
          <CheckCircle />
        </IconButton>
        <IconButton color="error" onClick={() => onReject(params)}>
          <Cancel />
        </IconButton>
      </>
    );
  }
  return <IconButton color="primary" onClick={() => onView(params)}>
    <Visibility />
  </IconButton>;
};


const PurchaseRequestListController = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const [list, setList] = useState({});
  const [loading, setLoading] = useState(false);

  const [viewParams, setViewParams] = useState(null);

  const onView = (params) => {
    setViewParams(params);
    dispatch(
      openModal(
        <PurchaseRequestViewController params={params} />,
        'md',
        false,
        'purchase-view'
      )
    );
  };
  const handleApprove = (params, nextStatus) => {
    dispatch(
      callApiAction(
        async () => await UpdatePurchaseRequestApi({
          id: params._id,
          materialId: params.materialId,
          quantity: params.quantity,
          materialType: params.materialType,
          date: params.date,
          reason: params.reason,
          status: nextStatus,
        }),
        async (response) => {
          fetchList()
        },
        (err) => {
          dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error))
        }
      )
    )
  };

  const handleAllocate = (params) => {
    dispatch(
      callApiAction(
        async () => await UpdatePurchaseRequestApi({
          id: params._id,
          materialId: params.materialId,
          quantity: params.quantity,
          materialType: params.materialType,
          date: params.date,
          reason: params.reason,
          status: MATERIAL_REQUEST_STATUS.ALLOCATED,
        }),
        async (response) => {
          fetchList()
        },
        (err) => {
          dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error))
        }
      )
    )
  };

  const handleReject = (params) => {
    dispatch(
      callApiAction(
        async () => await UpdatePurchaseRequestApi({
          id: params._id,
          status: MATERIAL_REQUEST_STATUS.REJECTED,
        }),
        async (response) => {
          fetchList()
        },
        (err) => {
          dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error))
        }
      )
    )
  };

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: '',
    searchable: ['name'],
    sort: '',
    sortDirection: -1,
  });

  const fetchList = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        () => FetchPurchaseRequestApi({ ...filters }),
        (res) => {
          setList(res);
          setLoading(false);
        },
        () => setLoading(false)
      )
    );
  };

  useEffect(() => {
    fetchList();
  }, [filters]);

  const getStatusLabelAndColor = (status) => {
    switch (status) {
      case MATERIAL_REQUEST_STATUS.PENDING:
        return { label: "Pending", color: "default" };
      case MATERIAL_REQUEST_STATUS.APPROVAL_1:
        return { label: "Approval 1", color: "primary" };
      case MATERIAL_REQUEST_STATUS.APPROVAL_2:
        return { label: "Approval 2", color: "info" };
      case MATERIAL_REQUEST_STATUS.ALLOCATED:
        return { label: "Allocated", color: "success" };
      case MATERIAL_REQUEST_STATUS.REJECTED:
        return { label: "Rejected", color: "error" };
      default:
        return { label: "NA", color: "default" };
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "",
        label: "Date",
        align: "left",
        sort: true,
        renderValue: (params, setParams) =>
          moment(params?.date).format("DD/MM/YYYY") || "NA",
      },
      {
        id: 2,
        fieldName: "",
        label: "Material Type",
        align: "left",
        sort: true,
        renderValue: (params, setParams) =>
          findObjectKeyByValue(params?.materialType, MATERIAL_TYPE) || "NA",
      },
      {
        id: 3,
        fieldName: "",
        label: "Material Name",
        align: "left",
        sort: true,
        renderValue: (params, setParams) =>
          params?.materialDetails?.name || "NA",
      },
      {
        id: 5,
        fieldName: "",
        label: "Quantity",
        align: "left",
        sort: true,
        renderValue: (params, setParams) =>
          params?.quantity || "NA",
      },
      {
        id: 6,
        fieldName: "",
        label: "Reason",
        align: "left",
        sort: true,
        renderValue: (params, setParams) =>
          params?.reason || "NA",
      },
      {
        id: 8,
        fieldName: "",
        label: "Category",
        align: "left",
        sort: true,
        renderValue: (params, setParams) =>
          params?.categoryId?.name || "NA",
      },

      {
        id: 4,
        fieldName: "",
        label: "Status",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => {
          const { label, color } = getStatusLabelAndColor(params?.status);
          return <Chip label={label} color={color} size="small" />;
        }
      },
      {
        id: 7,
        fieldName: "",
        label: "Action",
        align: "left",
        sort: false,
        renderValue: (params, setParams) => {

          return (
            <ActionComponent
              params={params}
              onApprove={handleApprove}
              onReject={handleReject}
              onAllocate={handleAllocate}
              onView={onView}
            />
          );
        },
      },
    ],
    [dispatch, handleApprove, handleReject, handleAllocate, onView]
  );


  const onCreateBtnClick = () => {
    dispatch(
      openModal(
        <PurchaseRequestCreateController
          id={params._id}
          callBack={fetchList}
        />,
        'sm',
        false,
        'purchase'
      )
    );
  };

  return (
    <PurchaseRequestListUi
      onCreateBtnClick={onCreateBtnClick}
      list={list}
      loading={loading}
      filters={filters}
      setFilters={setFilters}
      columns={columns}
    />
  );
};

export default PurchaseRequestListController;
