import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { Box, IconButton, Typography } from "@mui/material";
import { DAY_WEEK_MONTH, SNACK_BAR_VARIETNS } from "../../utils/constants";
import ProductionListUi from "./ProductionListUi";
import { DeleteProductionPlanningApi, FetchProductionPlanningApi } from "../../apis/ProductionPlanning.api";
import moment from "moment";
import { callSnackBar } from "../../store/actions/snackbarAction";
import MessageDilog from "../../components/texts/MessageDilog";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { Delete, Visibility } from "@mui/icons-material";
import CreateProductionPlanController from "./CreateProductionPlanController";
import CommonActionComponent from "../../components/CommonActionComponent";
import MODULES from "../../utils/module.constant";

const ActionComponent = memo(({ params, setParams, deleteApi }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const deleteFun = async (e) => {
    e.preventDefault()
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await DeleteProductionPlanningApi({ id: params._id }),
        (response) => {
          setParams({});
          setLoading(false);
          dispatch(closeModal("messagedialogdelete"));
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

  const onInfo = () => {
    dispatch(
      openModal(
        <CreateProductionPlanController id={params?._id} IsVeiw={true} />,
        "lg",
        false,
        "Production-Planning"
      )
    );
  };

  return (
    <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
      <IconButton disabled={loading} size="inherit" onClick={onDelete}>
        <Delete color="error" fontSize="inherit" />
      </IconButton>

      <IconButton size="inherit" onClick={onInfo}>
        <Visibility color="info" fontSize="inherit" />
      </IconButton>
    </Box>
  );
});

const ProductionListController = () => {
  const dispatch = useDispatch();
  const title = "Production Planning";
  const fetchApi = FetchProductionPlanningApi;

  const [fields, setFields] = useState({
    quantity: null,
  });

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name"],
    sort: "createdAt",
    sortDirection: -1,
    product_id: null,
  });

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

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "createdAt",
        label: "Created Date",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">{moment(params.createdAt).format("DD/MM/YYYY")}</Typography>
        ),
      },
      {
        id: 2,
        fieldName: "name",
        label: "Name",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">{params.name}</Typography>
        ),
      },
      {
        id: 3,
        fieldName: "quantity",
        label: "Total Quantity",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">{params.quantity}</Typography>
        ),
      },
      {
        id: 4,
        fieldName: "fg_Code",
        label: "Finished Code",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">{params.fg_Code}</Typography>
        ),
      },
      {
        id: 2,
        fieldName: "",
        label: "Action",
        align: "right",
        renderValue: (params, setParams) => (
          <CommonActionComponent
            ViewComponent={CreateProductionPlanController}
            modalkeyView={"Production-Planning"}
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={DeleteProductionPlanningApi}
            // modalkey={"Production-Planning"}
            // EditComponent={CreateProductionPlanController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.PRODUCTIONPLANNING}
            callBack={() => fetchList()}
          />
        ),
      },
    ],
    [fetchList, DeleteProductionPlanningApi]
  );

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <ProductionListUi
      title={title}
      filters={filters}
      setFilters={setFilters}
      fields={fields}
      setFields={setFields}
      loading={loading}
      list={list}
      columns={columns}
      callBack={fetchList}
    />
  );
};

export default ProductionListController;