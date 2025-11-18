import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import { fetchProductTypeAction } from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { deleteColorApi } from "../../apis/productColor.api";
import ProductTypeMainUi from "./ProductTypeMainUi";
import ProductTypeCreateController from "./ProductTypeCreateController";
import { deleteTypeApi } from "../../apis/productType.api";
import { useCallback } from "react";
import CommonActionComponent from "../../components/CommonActionComponent";
import MODULES from "../../utils/module.constant";

const ActionComponent = memo(({ params, setParams, deleteApi }) => {
  const dispatch = useDispatch();
  const modalkey = "delete";
  const [loading, setLoading] = useState(false);
  const { settings } = useSelector((state) => state)


  const onEdit = () => {
    dispatch(
      openModal(
        <ProductTypeCreateController
          id={params._id}
          callBack={(response, updatedData) => {
            setParams({ ...params, ...updatedData });
          }}
        />,
        "sm",
        false,
        modalkey
      )
    );
  };

  const deleteFun = async (e) => {
    e.preventDefault()
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await deleteTypeApi({ id: params._id }),
        (response) => {
          setParams({});
          setLoading(false);
          dispatch(closeModal("messagedialogdelete"));
          dispatch(fetchProductTypeAction(settings.productType_filters))
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
          onSubmit={(e) => deleteFun(e)}
          title="Alert!"
          modalId="messagedialogdelete"
          message={`Are you sure to delete "${params?.name || params?.title}" ?`}
        />,
        "sm",
        false,
        "messagedialogdelete"
      )
    );
  };

  return (
    <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
      <IconButton size="inherit" onClick={onEdit}>
        <Edit color="info" fontSize="inherit" />
      </IconButton>
      <IconButton disabled={loading} size="inherit" onClick={onDelete}>
        <Delete color="error" fontSize="inherit" />
      </IconButton>
    </Box>
  );
});

const ProductTypeController = () => {
  const dispatch = useDispatch();
  const { settings, user } = useSelector((state) => state)
  const title = "Type ";
  const deleteApi = deleteColorApi;

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name"],
    sort: "",
    sortDirection: -1,
  });

  const getDepartmentList = useCallback(() => {
    if (JSON.stringify(filters) !== JSON.stringify(settings.productType_filters)) {
      dispatch(fetchProductTypeAction(filters));
    }
  }, [filters, settings.productType_filters, dispatch]);

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: "Product Type",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">{params?.name}</Typography>
        ),
      },
      {
        id: 2,
        fieldName: "name",
        label: "Product Brand",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">{params?.brand?.name}</Typography>
        ),
      },
      {
        id: 5,
        fieldName: "",
        label: "Action",
        align: "right",
        hide: user?.data?.ims_modules?.find(item => item.module === MODULES.PRODUCTTYPE)?.actions?.length === 0 ? true : false,
        renderValue: (params, setParams) => (
          <CommonActionComponent
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={deleteApi}
            modalkey={"delete"}
            EditComponent={ProductTypeCreateController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.PRODUCTTYPE}
            callBack={() => dispatch(fetchProductTypeAction(filters))}
          />
        ),
      },
    ],
    [deleteApi]
  );

  useEffect(() => {
    getDepartmentList()

  }, [filters, getDepartmentList])

  return (
    <>
      <ProductTypeMainUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={settings.productType_loading}
        list={settings.productType_data}
        columns={columns}
      />
    </>
  );
};
export default ProductTypeController;
