import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit, Info } from "@mui/icons-material";
import { Box, Chip, IconButton } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import FinishGoodListUi from "./FinishGoodListUi";
import { COUNTRY_CATEGORY, SNACK_BAR_VARIETNS, USER_ROLES } from "../../utils/constants";
import CreateControllerFinishGood from "./CreateControllerFinishGood";
import {
  fetchRawMaterialAction,
} from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { deleteFGApi, FetchFGApi } from "../../apis/FG.api";
import { useCallback } from "react";
import FinishGoodInfoController from "./FinishGoodInfoController";
import CommonActionComponent from "../../components/CommonActionComponent";
import MODULES from "../../utils/module.constant";

const ActionComponent = memo(({ params, setParams, deleteApi, fetchList }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);
  const { settings } = useSelector((state) => state)

  const onEdit = () => {
    dispatch(
      openModal(
        <CreateControllerFinishGood
          id={params._id}
          callBack={(response, updatedData) => {
            setParams({ ...params, ...updatedData });
            fetchList()
          }}
        />,
        "sm",
        false,
        "update"
      )
    );
  };
  const onInfo = () => {
    dispatch(
      openModal(
        <FinishGoodInfoController  id={params._id} params={params} />,
        
        "md",
        false,
        "infoupdatee"
      )
    );
  };

  const deleteFun = async (e) => {
    e.preventDefault()
    setLoading(true)
    dispatch(callApiAction(
      async () => await deleteApi({ id: params._id }),
      (response) => {
        setParams({})
        setLoading(false)
        dispatch(fetchRawMaterialAction(settings.rawMaterial_filters))
        dispatch(callSnackBar(params.name + " Deleted Successfully", SNACK_BAR_VARIETNS.suceess))
        dispatch(closeModal("rawMaterialadd"))

      },
      (err) => {
        setLoading(false)
      }
    ))

  }

  const onDelete = () => {
    dispatch(openModal(<MessageDilog onSubmit={deleteFun}
      title="Alert!" modalId="rawMaterialadd" message={`Are you sure to delete "${params.name || params.title}" ?`}
    />, "sm", false, "rawMaterialadd"))
  }

  return <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
    {
        <IconButton size="inherit" onClick={onInfo}>
          <Info color="info" fontSize="inherit" />
        </IconButton>
      }
    {user.data.role === USER_ROLES.ADMIN ? (<IconButton size="inherit" onClick={onEdit}>
      <Edit color="info" fontSize="inherit" />
    </IconButton>) : ("")}

    {user.data.role === USER_ROLES.ADMIN ? <IconButton disabled={loading} size="inherit" onClick={onDelete}>
      <Delete color="error" fontSize="inherit" />
    </IconButton> : ""}
  </Box>

});

const FinishGoodListController = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state);
  const [list, setList] = useState({});
  const dispatch = useDispatch();
  const title = "Semi Finished Good List";
  const deleteApi = deleteFGApi;


  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name", "fg_Code", "product_type","product_color"],
    sort: "",
    sortDirection: -1,
    country_category: (user.data.role == USER_ROLES.QC_PACAKAGING ? COUNTRY_CATEGORY.GENERAL : ((user.data.role == USER_ROLES.QC_UAE) ? COUNTRY_CATEGORY.UAE : "")),
    name: "",
  });


  const fetchList = useCallback(() => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await FetchFGApi({ ...filters }),
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
  }, [fetchList]);


  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: "FG Name",
        align: "left",
        sort: true,
      },

      {
        id: 2,
        fieldName: "fg_Code",
        label: "FG Code",
        align: "left",
        sort: false,
      },

      // {
      //   id: 3,
      //   fieldName: "sfg",
      //   label: "SFG Name",
      //   align: "left",
      //   sort: false,
      //   renderValue: (params, setParams) => params?.sfg?.map((item) => (<Chip sx={{ mr: 1 }} key={item?.sfgId?._id} label={`${item?.sfgId?.name}  x${item?.min_of_quantity}`} />)),
      // },
      // {
      //   id: 4,
      //   fieldName: "",
      //   label: "Raw Materials",
      //   align: "left",
      //   sort: false,
      //   renderValue: (params, setParams) => params?.rawMaterials?.map((item) => (<Chip sx={{ mr: 1 }} key={item?._id} label={`${item?.name}  x${item?.min_of_quantity}`} />)),
      // },
      // {
      //   id: 10,
      //   fieldName: "",
      //   label: "Item Name",
      //   align: "left",
      //   sort: false,
      //   renderValue: (params, setParams) => params?.items?.map((item) => (<Chip sx={{ mr: 1 }} key={item._id} label={`${item?.name}  x${item?.min_of_quantity}`} />)),
      // },
      {
        id: 6,
        fieldName: "product_type",
        label: "FG Type",
        align: "left",
        sort: false,
        renderValue: (params) => params?.product_type?.map((product_type) => product_type.name),
      },
      {
        id: 7,
        fieldName: "product_color",
        label: "FG Color ",
        align: "left",
        sort: false,
        renderValue: (params) => params?.product_color?.map((product_color) => product_color.name),
      },
      // {
      //   id: 10,
      //   fieldName: "lead_time",
      //   label: "Lead Time",
      //   align: "left",
      //   sort: true,
      //   renderValue: (params, setParams) => {
      //     if (params?.lead_time <= 7) {
      //       return `${params?.lead_time} ${DAY_WEEK_MONTH.DAY}`;
      //     } else {
      //       if (params?.lead_time % 7 == 0) {
      //         return `${Math.floor(
      //           params?.lead_time / 7
      //         )} ${DAY_WEEK_MONTH.WEEK} `;
      //       }
      //       return `${Math.floor(
      //         params?.lead_time / 7
      //       )} ${DAY_WEEK_MONTH.WEEK} ${params?.lead_time % 7
      //         } ${DAY_WEEK_MONTH.DAY}`;
      //     }
      //   },
      // },
      {
        id: 8,
        fieldName: "product_brand",
        label: "FG Brand ",
        align: "left",
        sort: false,
        renderValue: (params) => params?.product_brand?.map((product_brand) => product_brand?.name),
      },
      {
        id: 9,
        fieldName: "product_price",
        label: "Price",
        align: "left",
        sort: false,
      },
      // user.data.role === USER_ROLES.ADMIN &&
      {
        id: 5,
        fieldName: "",
        label: "Action",
        align: "right",
        // hide:true,
        renderValue: (params, setParams) => (
          <CommonActionComponent
            ViewComponent={FinishGoodInfoController}
            modalkeyView={"infoupdatee"}
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={deleteApi}
            modalkey={"update"}
            EditComponent={CreateControllerFinishGood}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.BOM}
            callBack={() => fetchList()}
          />
        ),
      },
    ],
    [user.data.role, deleteApi, fetchList]
  );



  return (
    <>
      <FinishGoodListUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        list={list}
        fetchList={fetchList}
        columns={columns}
      />
    </>
  );
};
export default FinishGoodListController;
