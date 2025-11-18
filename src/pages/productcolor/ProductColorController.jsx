import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import { fetchProductColorAction } from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import ProductColorCreateController from "./ProductColorCreateController";
import { deleteColorApi } from "../../apis/productColor.api";
import ProductColorMainUi from "./ProductColorMainUi";
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
        <ProductColorCreateController
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
        async () => await deleteColorApi({ id: params._id }),
        (response) => {
          setParams({});
          setLoading(false);
          dispatch(closeModal("messagedialogdelete"));
          dispatch(fetchProductColorAction(settings.productColor_filters))
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
          message={`Are you sure to delete "${params.name || params.title}" ?`}
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

const ProductColorController = () => {
  const dispatch = useDispatch();
  const { settings, user } = useSelector((state) => state)
  const title = "Product Color ";
  const deleteApi = deleteColorApi;

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: "Product Color",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">{params.name}</Typography>
        ),
      },
      // { id: 2, fieldName: 'has_a_distributor', label: 'Has a Destributor', align: "left", sort: true, renderValue: (params, setParams) => <Typography textTransform="capitalize">{params.has_a_distributor ? "Yes" : "No"}</Typography> },
      {
        id: 5,
        fieldName: "",
        label: "Action",
        align: "right",
        hide: user?.data?.ims_modules?.find(item => item.module === MODULES.COLOR)?.actions?.length === 0 ? true : false,
        renderValue: (params, setParams) => (
          <CommonActionComponent
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={deleteApi}
            modalkey={"delete"}
            EditComponent={ProductColorCreateController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.COLOR}
            callBack={() => dispatch(fetchProductColorAction(filters))}
          />
        ),
      },
    ],
    [deleteApi]
  );

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name"],
    sort: "",
    sortDirection: -1,
  });

  const getDepartmentList = useCallback(() => {
    if (JSON.stringify(filters) !== JSON.stringify(settings.productColor_filters)) {
      dispatch(fetchProductColorAction(filters));
    }
  }, [dispatch, filters, settings.productColor_filters])
  useEffect(() => {
    getDepartmentList()

  }, [filters, getDepartmentList])

  return (
    <>
      <ProductColorMainUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={settings.productColor_loading}
        list={settings.productColor_data}
        columns={columns}
      />
    </>
  );
};
export default ProductColorController;
