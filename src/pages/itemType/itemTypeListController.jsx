import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import { fetchItemTypeAction } from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";

import ItemTypeCreateController from "./itemTypeCreateController";
import { deleteItemTypeApi } from "../../apis/itemType.api";
import ItemTypeListUi from "./itemTypeListUi";
import { useCallback } from "react";
import MODULES from "../../utils/module.constant";
import CommonActionComponent from "../../components/CommonActionComponent";

const ActionComponent = memo(({ params, setParams, deleteApi }) => {
  const dispatch = useDispatch();
  const modalkey = "delete";
  const [loading, setLoading] = useState(false);
  const { settings } = useSelector((state) => state)

  const onEdit = () => {
    dispatch(
      openModal(
        <ItemTypeCreateController
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
        async () => await deleteItemTypeApi({ id: params._id }),
        (response) => {
          setParams({});
          setLoading(false);
          dispatch(closeModal("messagedialogdelete"));
          dispatch(fetchItemTypeAction(settings.itemType_filters))
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

const ItemTypeListController = () => {
  const dispatch = useDispatch();
  const { settings, user } = useSelector((state) => state)
  const title = "Item Type";
  const deleteApi = deleteItemTypeApi;

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: "Item Type",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">{params.name}</Typography>
        ),
      },
      {
        id: 2,
        fieldName: "",
        label: "Action",
        align: "right",
        hide: user?.data?.ims_modules?.find(item => item.module === MODULES.ITEMTYPE)?.actions?.length === 0 ? true : false,
        renderValue: (params, setParams) => (
          <CommonActionComponent
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={deleteApi}
            modalkey={"delete"}
            EditComponent={ItemTypeCreateController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.ITEMTYPE}
            callBack={() => dispatch(fetchItemTypeAction(filters))}
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



  const getItemTypeList = useCallback(() => {
    if (JSON.stringify(filters) !== JSON.stringify(settings.itemType_filters)) {
      dispatch(fetchItemTypeAction(filters));
    }
  }, [dispatch, filters, settings.itemType_filters])
  useEffect(() => {
    getItemTypeList()

  }, [filters, getItemTypeList])

  return (
    <>
      <ItemTypeListUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={settings.itemType_loading}
        list={settings.itemType_data}
        columns={columns}
      />
    </>
  );
};
export default ItemTypeListController;
