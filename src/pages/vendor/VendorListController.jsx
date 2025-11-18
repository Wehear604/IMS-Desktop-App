import React, { useEffect, useState } from 'react'
import VendorListUi from './VendorListUI';
import { deleteVendorApi } from '../../apis/vendor.api';
import { callApiAction } from '../../store/actions/commonAction';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from "react";
import { closeModal, openModal } from '../../store/actions/modalAction';
import { Delete, Edit, Info } from "@mui/icons-material";
import MessageDilog from "../../components/MessageDilog";
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { callSnackBar } from '../../store/actions/snackbarAction';
import { SNACK_BAR_VARIETNS, USER_ROLES } from '../../utils/constants';
import CreateVendorController from './CreateVendorController';
import { fetchVendorAction } from '../../store/actions/setting.Action';
import RawMaterialViewController from './RawMaterialViewController';
import { useCallback } from 'react';
import CommonActionComponent from '../../components/CommonActionComponent';
import MODULES from '../../utils/module.constant';

const VendorListController = () => {
  const { settings } = useSelector((state) => state)
  const dispatch = useDispatch();
  const modalKey = 'vendor'
  const title = "Vendor List";

  const ActionComponent = ({ params, setParams }) => {
    const modalKey = 'vendorname';
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.user);


    const onEdit = () => {
      dispatch(
        openModal(
          <CreateVendorController
            id={params._id}
            title={params.title}
          />,
          "md",
          false,
          "vendorupdate"
        )
      );
    };

    const onInfo = () => {
      dispatch(
        openModal(
          <RawMaterialViewController params={params} />
          ,
          "sm",
          false,
          "infoupdateee"
        )
      );
    };

    const deleteFun = async (e) => {
      e.preventDefault()
      setLoading(true);
      dispatch(
        callApiAction(
          async () => await deleteVendorApi({ id: params._id }),
          (response) => {
            setLoading(false);
            setParams({})
            dispatch(fetchVendorAction(settings.vender_filters));
            dispatch(closeModal(modalKey));
            dispatch(callSnackBar(params.name + " Deleted Successfully", SNACK_BAR_VARIETNS.suceess))
          },
          (err) => {
            setLoading(false);
          }
        )
      );

    };

    const onDelete = () => {
      dispatch(
        openModal(
          <MessageDilog
            onSubmit={deleteFun}
            title="Alert!"
            modalId={modalKey}
            closeText="Close"
            confirmText="Delete"
            message={`Are you sure to delete "${params.name || params.title}" ?`}
          />,
          "sm", true, 'vendorname'
        )
      );
    };

    return (

      <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
        <Tooltip title={"Raw-Materials Information"}>
          <IconButton disabled={loading} size="inherit" onClick={onInfo}>
            <Info color="info" fontSize="inherit" />
          </IconButton>
        </Tooltip>

        {user.data.role === USER_ROLES.ADMIN ? <IconButton disabled={loading} size="inherit" onClick={onEdit}>
          <Edit color="info" fontSize="inherit" />
        </IconButton> : ""}

        {user.data.role === USER_ROLES.ADMIN ? <IconButton disabled={loading} size="inherit" onClick={onDelete}>
          <Delete color="error" fontSize="inherit" />
        </IconButton> : ""}
      </Box>
    );
  };

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ['name'],
    role: "",
    sort: "createdAt",
    sortDirection: -1,
  });


  const getVendorList = useCallback(() => {
    if (JSON.stringify(filters) !== JSON.stringify(settings.vender_filters)) {
      dispatch(fetchVendorAction(filters));
    }
  }, [dispatch, filters, settings.vender_filters])

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: "Vendor Name",
        align: "left",
        sort: true,
      },
      {
        id: 2,
        fieldName: "address",
        label: "Address",
        align: "left",
        sort: true,
      },
      {
        id: 3,
        fieldName: "phone",
        label: "Phone",
        align: "left",
        sort: true,
      },

      {
        id: 4,
        fieldName: "email",
        label: "Email",
        align: "left",
        sort: true,
      },

      {
        id: 6,
        fieldName: "country",
        label: "Country",
        align: "left",
        sort: true,
      },

      {
        id: 7,
        fieldName: "",
        label: "GST Number",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => <span
          dangerouslySetInnerHTML={{
            __html:
              params?.gst_no || "NA",
          }}
        />,
      },
      // {
      //   id: 9,
      //   fieldName: "acceptanceRatio",
      //   label: "Acceptance Ratio",
      //   align: "left",
      //   sort: true,
      //   renderValue: (params, setParams) => {
      //     const ratio = params.acceptanceRatio;
      //     const isHigh = ratio < 90;

      //     return (
      //       <Chip
      //         label={`${ratio}%`}
      //         sx={{
      //           backgroundColor: isHigh ? "red" : "green",
      //           color:  "white" ,
      //         }}
      //       />
      //     );
      //   }      },
      {
        id: 5,
        fieldName: "",
        label: "Action",
        align: "right",
        renderValue: (params, setParams) => (
          <CommonActionComponent
            ViewComponent={RawMaterialViewController}
            modalkeyView={"infoupdateee"}
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={deleteVendorApi}
            modalkey={"vendorupdate"}
            EditComponent={CreateVendorController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.VENDOR}
            callBack={() => dispatch(fetchVendorAction(filters))}
            isSize={"md"}
          />
        ),
      },

    ],
    [deleteVendorApi, getVendorList]
  );

  useEffect(() => {
    getVendorList()

  }, [filters, getVendorList])

  return (
    <>
      <VendorListUi
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        title={title}
        callBack={getVendorList}
        loading={settings.vender_loading}
        list={settings.vender_data}
        modalKey={modalKey}
      />
    </>
  )
}

export default VendorListController