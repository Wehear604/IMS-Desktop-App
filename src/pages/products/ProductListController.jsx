import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit, Info } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import {
  DAY_WEEK_MONTH,
  SNACK_BAR_VARIETNS,
  USER_ROLES,
} from "../../utils/constants";
import ProductListUi from "./ProductListUi";
import { deleteProductApi, fetchProductApi } from "../../apis/product.api";
import CreateProductController from "./CreateProductController";
import RawMaterialViewControllerProduct from "./RawMaterialViewControllerProduct";
import {
  fetchProductAction,
} from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";

const ActionComponent = memo(({ params, setParams, deleteApi }) => {
  const dispatch = useDispatch();
  const modalkey = "productupdate";
  const [loading, setLoading] = useState(false);
  const { settings } = useSelector((state) => state);
  const user = useSelector((state) => state.user);

  const onEdit = () => {
      dispatch(openModal(<CreateProductController id={params._id}
      />, "sm", false, modalkey))
  }
  const onInfo = () => {
    dispatch(
      openModal(
        <RawMaterialViewControllerProduct params={params} />,
        "sm",
        false,
        "infoupdate"
      )
    );
  };

  const deleteFun = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await deleteApi({ id: params._id }),
        (response) => {
          setParams({});
          setLoading(false);
          dispatch(
            callSnackBar(
              params.product_name + " Deleted Successfully",
              SNACK_BAR_VARIETNS.suceess
            )
          );
          dispatch(closeModal("productidd"));
          dispatch(fetchProductAction(settings.rawMaterial_filters))

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
          modalId="productidd"
          message={`Are you sure to delete "${
            params.product_name || params.title
          }" ?`}
        />,
        "sm",
        false,
        "productidd"
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
      {user.data.role === USER_ROLES.ADMIN ? (<IconButton size="inherit" onClick={onEdit}>
            <Edit color="info" fontSize="inherit" />
        </IconButton>) : ("") }
      {user.data.role === USER_ROLES.ADMIN ? (
        <IconButton disabled={loading} size="inherit" onClick={onDelete}>
          <Delete color="error" fontSize="inherit" />
        </IconButton>
      ) : (
        ""
      )}
    </Box>
  );
});

const ProductListController = () => {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state);
  const title = "Products";
  const deleteApi = deleteProductApi;
  const [categoryType, setCategoryType] = useState("production");

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "product_name",
        label: "Product Name",
        align: "left",
        sort: true,
      },
      {
        id: 2,
        fieldName: "product_code",
        label: "Product Code",
        align: "left",
        sort: true,
      },

      {
        id: 3,
        fieldName: "lead_time",
        label: "Duration Of Manufacturing",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => {
          const rawMaterialLeadTimes = params.requiredRawMaterials?.map(
            (rm) => {
              return rm.rawMaterialId?.length
                ? Math.max(
                    ...rm.rawMaterialId.map((rmId) => rmId.lead_time || 0)
                  )
                : 0;
            }
          ) || [0];

          const maxRawMaterialLeadTime = Math.max(...rawMaterialLeadTimes);

          const totalLeadTime = params.lead_time + maxRawMaterialLeadTime;

          if (totalLeadTime <= 7) {
            return `${totalLeadTime} ${DAY_WEEK_MONTH.DAY}`;
          } else {
            if (totalLeadTime % 7 == 0) {
              return `${Math.floor(totalLeadTime / 7)} ${DAY_WEEK_MONTH.WEEK} `;
            }
            return `${Math.floor(totalLeadTime / 7)} ${DAY_WEEK_MONTH.WEEK} ${
              totalLeadTime % 7
            } ${DAY_WEEK_MONTH.DAY}`;
          }
        },
      },
      {
        id: 4,
        fieldName: "product_price",
        label: "Product Price",
        align: "left",
        sort: true,
      },
      {
        id: 5,
        fieldName: "department",
        label: "Department",
        align: "left",
        sort: true,
        renderValue: (params, setParams) =>
          params.department.map((e) => e.name),
      },

      {
        id: 7,
        fieldName: "current_stock",
        label: "Current Stock",
        align: "left",
        sort: true,
      },
      {
        id: 8,
        fieldName: "",
        label: "Action",
        align: "right",
        renderValue: (params, setParams) => (
          <ActionComponent deleteApi={deleteApi} params={params} setParams={setParams} />
        ),
      },
    ],
    []
  );

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["product_name"],
    sort: "createdAt",
    sortDirection: -1,
  });


  const getProductList = () => {
    if (
      !settings.product_data ||
      settings.product_data.length === 0 ||
      JSON.stringify(filters) != JSON.stringify(settings.product_filters)
    ) {
      dispatch(fetchProductAction(filters));
    }
  };

  useEffect(() => {
    getProductList();
  }, [filters]);

  return (
    <>
      <ProductListUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={settings.product_loading}
        list={settings.product_data}
        columns={columns}
        categoryType={categoryType}
        setCategoryType={setCategoryType}
      />
    </>
  );
};
export default ProductListController;
