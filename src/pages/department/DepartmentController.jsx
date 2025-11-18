import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import DepartmentCreateController from "./DepartmentCreateController";
import DepartmentMainUi from "./DepartmentMainUi";
import {
  deleteDepartment,
} from "../../apis/department.api";
import MessageDilog from "../../components/texts/MessageDilog";
import { fetchDepartmentAction } from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
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
        <DepartmentCreateController
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
        async () => await deleteApi({ id: params._id }),
        (response) => {
          setParams({});
          setLoading(false);
          dispatch(closeModal("messagedialogdelete"));
          dispatch(callSnackBar(params.name + " Deleted Successfully", SNACK_BAR_VARIETNS.suceess))
          dispatch(fetchDepartmentAction(settings.department_filters))


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

const DepartmentController = () => {
  const dispatch = useDispatch();
  const { settings, user } = useSelector((state) => state)
  const title = "Department ";
  const deleteApi = deleteDepartment;

  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: "Department Name",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => (
          <Typography textTransform="capitalize">{params.name}</Typography>
        ),
      },
      {
        id: 5,
        fieldName: "",
        label: "Action",
        align: "right",
        hide: user?.data?.ims_modules?.find(item => item.module === MODULES.DEPARTMENT)?.actions?.length === 0 ? true : false,
        renderValue: (params, setParams) => <CommonActionComponent
          DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
          DeleteApi={deleteApi}
          modalkey={"UpdateDepartment"}
          EditComponent={DepartmentCreateController}
          params={params}
          setParams={setParams}
          ModuleMatch={MODULES.DEPARTMENT}
          callBack={() => dispatch(fetchDepartmentAction(filters))}
        />,
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
    if (JSON.stringify(filters) !== JSON.stringify(settings.department_filters)) {
      dispatch(fetchDepartmentAction(filters));
    }
  }, [filters, dispatch, settings.department_filters])
  useEffect(() => {
    getDepartmentList()

  }, [filters, getDepartmentList])

  return (
    <>
      <DepartmentMainUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={settings.department_loading}
        list={settings.department_data}
        columns={columns}
      />
    </>
  );
};
export default DepartmentController;
