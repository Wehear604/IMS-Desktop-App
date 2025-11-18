import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit, Info } from "@mui/icons-material";
import { Box, Chip, IconButton } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import SemiKnockedDownListUi from "./SemiKnockedDownListUi";
import { SNACK_BAR_VARIETNS, USER_ROLES } from "../../utils/constants";
import CreateSemiKnockedDownController from "./CreateSemiKnockedDownController";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { deleteSKDApi, FetchSKDApi } from "../../apis/skd.api";
import { useCallback } from "react";
import SemiKnockDownInfoController from "./SemiKnockDownInfoController";
import CommonActionComponent from "../../components/CommonActionComponent";
import MODULES from "../../utils/module.constant";

const ActionComponent = memo(({ params, setParams, deleteApi, callBack }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);

  const onEdit = () => {
    dispatch(
      openModal(
        <CreateSemiKnockedDownController
          id={params._id}
          callBack={callBack}
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
        <SemiKnockDownInfoController id={params._id} params={params} />,
        "md",
        false,
        "infoupdatee"
      )
    );
  };

  return <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>

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

});

const SemiKnockedDownListController = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state);
  const [list, setList] = useState({});
  const dispatch = useDispatch();
  const title = "Semi Knocked Down List";
  const deleteApi = deleteSKDApi;


  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name","skd_Code"],
    sort: "",
    sortDirection: -1,
    name: "",
  });

  const fetchList = useCallback(() => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await FetchSKDApi({ ...filters }),
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
  }, [filters, fetchList]);


  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: "SKD Name",
        align: "left",
        sort: true,
      },

      {
        id: 2,
        fieldName: "skd_Code",
        label: "SKD Code",
        align: "left",
        sort: false,
      },
      // {
      //   id: 4,
      //   fieldName: "",
      //   label: "Raw Materials",
      //   align: "left",
      //   sort: false,
      //   renderValue: (params, setParams) => params?.rawMaterials?.map((item) => (<Chip sx={{ mr: 1 }} key={item._id} label={`${item?.name}  x${item?.min_of_quantity}`} />)),
      // },
      // {
      //   id: 6,
      //   fieldName: "",
      //   label: "Raw Material Quantity",
      //   align: "left",
      //   sort: false,
      //   renderValue: (params, setParams) => params?.items?.map((item) => (<Chip sx={{ mr: 1 }} key={item._id} label={item?.min_of_quantity} />)),
      // },
      // {
      //   id: 5,
      //   fieldName: "min_of_quantity",
      //   label: "Quantity ",
      //   align: "left",
      //   sort: false,
      //   renderValue: (params, setParams) =>
      //     params?.rawMaterials?.map((item) => (<Chip key={item?._id} label={item?.min_of_quantity} sx={{ mr: 1 }} />)),

      // },


      {
        id: 5,
        fieldName: "",
        label: "Action",
        align: "right",
        // hide: user?.data?.ims_modules?.find(item => item.module === MODULES.CATEGORY)?.actions?.length === 0 ? true : false,
        renderValue: (params, setParams) => (
          <CommonActionComponent
            ViewComponent={SemiKnockDownInfoController}
            modalkeyView={"infoupdatee"}
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={deleteApi}
            modalkey={"update"}
            EditComponent={CreateSemiKnockedDownController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.BOM}
            callBack={() => fetchList()}
          />
        ),
      },
    ],
    [deleteApi, user.data.role, fetchList]
  );



  return (
    <>
      <SemiKnockedDownListUi
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
export default SemiKnockedDownListController;
