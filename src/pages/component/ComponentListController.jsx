import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import { fetchComponentAction } from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import ComponentCreateController from "./ComponentCreateController";
import ComponentListUi from "./ComponentListUi";
import { deleteComponentApi } from "../../apis/component.api";
import CommonActionComponent from "../../components/CommonActionComponent";
import MODULES from "../../utils/module.constant";

const ActionComponent = memo(({ params, setParams }) => {
  const dispatch = useDispatch();
  const modalkey = "delete";
  const [loading, setLoading] = useState(false);
  const { settings } = useSelector((state) => state)

  const onEdit = () => {
    dispatch(
      openModal(
        <ComponentCreateController
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
        async () => await deleteComponentApi({ id: params._id }),
        (response) => {
          setParams({});
          setLoading(false);
          dispatch(closeModal("messagedialogdelete"));
          dispatch(fetchComponentAction(settings.component_filters))
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

const ComponentListController = () => {
  const dispatch = useDispatch();
  const { settings, user } = useSelector((state) => state)
  const title = "Component";
  const deleteApi = deleteComponentApi;

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: "Component Name",
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
        hide: user?.data?.ims_modules?.find(item => item.module === MODULES.COMPONENT)?.actions?.length === 0 ? true : false,
        renderValue: (params, setParams) => (
          <CommonActionComponent
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={deleteApi}
            modalkey={"delete"}
            EditComponent={ComponentCreateController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.COMPONENT}
            callBack={() => dispatch(fetchComponentAction(filters))}
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



  const getComponentList = useCallback(() => {
    if (JSON.stringify(filters) !== JSON.stringify(settings.component_filters)) {
      dispatch(fetchComponentAction(filters));
    }
  }, [filters, settings.component_filters, dispatch])

  useEffect(() => {
    getComponentList()
  }, [getComponentList, filters])

  return (
    <>
      <ComponentListUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={settings.component_loading}
        list={settings.component_data}
        columns={columns}
      />
    </>
  );
};
export default ComponentListController;
