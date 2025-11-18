import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Delete, Edit, KeyboardArrowRight } from "@mui/icons-material";
import ProductListUi from "../products/ProductListUi";
import CreateProductController from "../products/CreateProductController";
import { fetchProductAction, fetchQualityCheckAction } from "../../store/actions/setting.Action";
import RawMaterialViewControllerProduct from "../products/RawMaterialViewControllerProduct";
import { fetchProductApi } from "../../apis/product.api";
import { DAY_WEEK_MONTH } from "../../utils/constants";
import QualityCheckListUi from "./QualityCheckListUi";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductQcApi } from "../../apis/qc.api";
import moment from "moment";

// const ActionComponent = memo(({ params, setParams, deleteApi }) => {
//     const dispatch = useDispatch();
//     const modalkey = "productupdate";
//     const [loading, setLoading] = useState(false);
//     const { settings } = useSelector((state) => state);
//     const user = useSelector((state) => state.user);

//     const onEdit = () => {
//         dispatch(openModal(<CreateProductController id={params._id}
//         />, "sm", false, modalkey))
//     }
//     const onInfo = () => {
//       dispatch(
//         openModal(
//           <RawMaterialViewControllerProduct params={params} />,
//           "sm",
//           false,
//           "infoupdate"
//         )
//       );
//     };

//     // const deleteFun = async (e) => {
//     //   e.preventDefault();
//     //   setLoading(true);
//     //   dispatch(
//     //     callApiAction(
//     //       async () => await deleteApi({ id: params._id }),
//     //       (response) => {
//     //         setParams({});
//     //         setLoading(false);
//     //         dispatch(
//     //           callSnackBar(
//     //             params.product_name + " Deleted Successfully",
//     //             SNACK_BAR_VARIETNS.suceess
//     //           )
//     //         );
//     //         dispatch(closeModal("productidd"));
//     //         // const updateData = settings.rawMaterial_data.filters(item => item._id != params._id)
//     //         // dispatch(deleteProductAction(updateData, settings.rawMaterial_filters))
//     //       },
//     //       (err) => {
//     //         setLoading(false);
//     //       }
//     //     )
//     //   );
//     // };

//     // const onDelete = () => {
//     //   dispatch(
//     //     openModal(
//     //       <MessageDilog
//     //         onSubmit={deleteFun}
//     //         title="Alert!"
//     //         modalId="productidd"
//     //         message={`Are you sure to delete "${
//     //           params.product_name || params.title
//     //         }" ?`}
//     //       />,
//     //       "sm",
//     //       false,
//     //       "productidd"
//     //     )
//     //   );
//     // };

//     return (
//       <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
//         <Tooltip title={"Raw-Materials Information"}>
//           <IconButton disabled={loading} size="inherit" onClick={onInfo}>
//             <Info color="info" fontSize="inherit" />
//           </IconButton>
//         </Tooltip>
//         {user.data.role === USER_ROLES.ADMIN ? (<IconButton size="inherit" onClick={onEdit}>
//               <Edit color="info" fontSize="inherit" />
//           </IconButton>) : ("") }
//         {user.data.role === USER_ROLES.ADMIN ? (
//           <IconButton disabled={loading} size="inherit" onClick={onDelete}>
//             <Delete color="error" fontSize="inherit" />
//           </IconButton>
//         ) : (
//           ""
//         )}
//       </Box>
//     );
//   });


const ActionComponent = memo(({ params, setParams, deleteApi }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state);
  const onViewMore = () => {
    navigate(`batch-list/${params.product_id}/${params.batch_no}`);
  };


  return (
    <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
      <IconButton disabled={loading} size="inherit" onClick={onViewMore}>
        <KeyboardArrowRight fontSize="inherit" />
      </IconButton>
    </Box>
  );
});


const QualityCheckListController = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { settings } = useSelector((state) => state);
  const title = "Products";
  const params = useParams();
  // const fetchApi = fetchProductApi;
  // const deleteApi = deleteProductApi;
  const [categoryType, setCategoryType] = useState("production");

  const columns = useMemo(
    () => [
      {
        id: 4,
        fieldName: "date",
        label: "Date",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => moment(params?.date).format("DD/MM/YYYY"),
      },

      {
        id: 1,
        fieldName: "product_id",
        label: "Product Name",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => params.product.product_name

      },

      {
        id: 2,
        fieldName: "batch_no",
        label: "Product Batch",
        align: "left",
        sort: true,
      },

      {
        id: 3,
        fieldName: "quantity",
        label: "Quantity",
        align: "left",
        sort: true,

      },

      {
        id: 5,
        fieldName: "",
        label: "",

        align: "right",
        renderValue: (params, setParams) => (
          <ActionComponent params={params} setParams={setParams} />
        ),
      }

    ],
    []
  );


  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["product.product_name"],
    sort: "createdAt",
    sortDirection: -1,
    id: "",
  });

  // const fetchProductFun = () => {
  //   setLoading(true);
  //   dispatch(
  //     callApiAction(
  //       async () => await fetchProductQcApi({ ...filters }),
  //       (response) => {
  //         setCategories(response.result);
  //         setLoading(false);
  //       },
  //       (err) => {
  //         setLoading(false);
  //       }
  //     )
  //   );
  // };


  const getBatchList = () => {
    if (
      !settings.qualityCheck_data ||
      settings.qualityCheck_data.length === 0 ||
      JSON.stringify(filters) != JSON.stringify(settings.qualityCheck_filters)
    ) {
      dispatch(fetchQualityCheckAction(filters));
    }
  };

  useEffect(() => {
    getBatchList();
  }, [filters]);

  return (
    <>
      <QualityCheckListUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={settings.qualityCheck_loading}
        list={settings.qualityCheck_data}
        columns={columns}
        categoryType={categoryType}
        setCategoryType={setCategoryType}
      />
    </>
  );
};
export default QualityCheckListController;
