import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit, Info } from "@mui/icons-material";
import { Box, Chip, IconButton } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import SemiFinishedGoodListUi from "./SemiFinishedGoodListUi";
import { SNACK_BAR_VARIETNS, USER_ROLES } from "../../utils/constants";
import CreateSemiFinishedGoodController from "./CreateSemiFinishedGoodController";
import SemiFinishedGoodInfoController from "./SemiFinishedGoodInfoController";
import {
  fetchRawMaterialAction,
} from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { deleteSFGApi, FetchSFGApi } from "../../apis/sfg.api";
import { useCallback } from "react";
import MODULES from "../../utils/module.constant";
import CommonActionComponent from "../../components/CommonActionComponent";

const ActionComponent = memo(({ params, setParams, deleteApi, fetchList }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);
  const { settings } = useSelector((state) => state)
  console.log("object params", params);
  const onEdit = () => {
    dispatch(
      openModal(
        <CreateSemiFinishedGoodController
          id={params._id}
          callBack={fetchList}
        />,
        "sm",
        false,
        "update"
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

  const onInfo = () => {
    dispatch(
      openModal(
        <SemiFinishedGoodInfoController id={params._id} params={params} />,
        "md",
        false,
        "infoupdatee"
      )
    );
  };

  return (
    <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
      <IconButton size="inherit" onClick={onInfo}>
        <Info color="info" fontSize="inherit" />
      </IconButton>

      {user.data.role === USER_ROLES.ADMIN ? (<IconButton size="inherit" onClick={onEdit}>
        <Edit color="info" fontSize="inherit" />
      </IconButton>) : ("")}

      {user.data.role === USER_ROLES.ADMIN ? <IconButton disabled={loading} size="inherit" onClick={onDelete}>
        <Delete color="error" fontSize="inherit" />
      </IconButton> : ""}
    </Box>
  );
});

const SemiFinishedGoodListController = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state);
  const [list, setList] = useState({});
  const dispatch = useDispatch();
  const title = "Semi Finished Good List";
  const deleteApi = deleteSFGApi;

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name", "sfg_Code","mpn"],
    sort: "",
    sortDirection: -1,
    name: "",
  });

  const fetchList = useCallback(() => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await FetchSFGApi({ ...filters }),
        (response) => {
          setList(response);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        }
      )
    );
  }, [filters, dispatch]);
  useEffect(() => {
    fetchList();
  }, [filters, fetchList]);


  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: "SFG Name",
        align: "left",
        sort: true,
      },

      {
        id: 2,
        fieldName: "sfg_Code",
        label: "SFG Code",
        align: "left",
        sort: false,
      },
      {
        id: 6,
        fieldName: "mpn",
        label: "MPN",
        align: "left",
        sort: false,
      },
      // {
      //   id: 6,
      //   fieldName: "designator",
      //   label: "Desginator",
      //   align: "left",
      //   sort: false,
      // },
      // {
      //   id: 3,
      //   fieldName: "",
      //   label: "Skds",
      //   align: "left",
      //   sort: false,
      //   renderValue: (params, setParams) => params?.skds?.map((item) => (<Chip sx={{ mr: 1 }} key={item?._id} label={`${item?.name}  x${item?.min_of_quantity}`} />)),
      // },
      // {
      //   id: 3,
      //   fieldName: "",
      //   label: "Raw Materials",
      //   align: "left",
      //   sort: false,
      //   renderValue: (params, setParams) => params?.rawmaterials?.map((item) => (<Chip sx={{ mr: 1 }} key={item?._id} label={`${item?.name}  x${item?.min_of_quantity}`} />)),
      // },
      // {
      //   id: 3,
      //   fieldName: "min_of_quantity",
      //   label: "Quantity",
      //   align: "left",
      //   sort: false,
      //   renderValue: (params, setParams) => params?.skd?.map((item) => (<Chip sx={{ mr: 1 }} key={item?.skdId?._id} label={item?.skdId?.min_of_quantity} />)),
      // },
      // {
      //   id: 4,
      //   fieldName: "",
      //   label: "Item Name",
      //   align: "left",
      //   sort: false,
      //   renderValue: (params, setParams) => params?.items?.map((item) => (<Chip sx={{ mr: 1 }} key={item._id} label={`${item?.name}  x${item?.min_of_quantity}`} />)),
      // },

      user.data.role === USER_ROLES.ADMIN && {
        id: 5,
        fieldName: "",
        label: "Action",
        align: "right",
        renderValue: (params, setParams) => (
          <CommonActionComponent
            ViewComponent={SemiFinishedGoodInfoController}
            modalkeyView={"infoupdatee"}
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={deleteApi}
            modalkey={"update"}
            EditComponent={CreateSemiFinishedGoodController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.BOM}
            callBack={()=>fetchList()}
          />
        ),
      },
    ],
    [deleteApi, user.data.role, fetchList]
  );



  return (
    <>
      <SemiFinishedGoodListUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        list={list}
        columns={columns}
        fetchList={fetchList}
      />
    </>
  );
};
export default SemiFinishedGoodListController;
