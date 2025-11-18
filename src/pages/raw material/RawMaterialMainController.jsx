import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit, Info } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import RawMaterialMainUi from "./RawMaterialMainUi";
import RawMaterialCreateController from "./RawMaterialCreateController";
import RawMaterialInfoController from "./RawMaterialInfoController";
import {
  deleteRawMaterialApi,
} from "../../apis/rawMaterial.api";
import { DAY_WEEK_MONTH, SNACK_BAR_VARIETNS, USER_ROLES } from "../../utils/constants";
import {
  fetchRawMaterialAction,
} from "../../store/actions/setting.Action";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { fetchCategoryApi } from "../../apis/category.api";
import { useCallback } from "react";
import CommonActionComponent from "../../components/CommonActionComponent";
import MODULES from "../../utils/module.constant";

const ActionComponent = memo(({ params, setParams, deleteApi }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);
  const { settings } = useSelector((state) => state)

  const onEdit = () => {
    dispatch(
      openModal(
        <RawMaterialCreateController
          id={params._id}
          callBack={(response, updatedData) => {
            setParams({ ...params, ...updatedData });
          }}
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
        <RawMaterialInfoController id={params._id} params={params} />,
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
},
);

const RawMaterialMainController = () => {
  const [ loading, setLoading] = useState(false);
  const { settings, user } = useSelector((state) => state);
  const dispatch = useDispatch();
  const title = "Department ";
  const deleteApi = deleteRawMaterialApi;
  const [categoryType, setCategoryType] = useState("all");
  const [categories, setCategories] = useState([]);
  const columns = useMemo(
    () => [
      {
        id: 1,
        fieldName: "name",
        label: "Raw Material Name",
        align: "left",
        sort: true,
      },

      {
        id: 4,
        fieldName: "rawMaterial_code",
        label: "Item Code ",
        align: "left",
        sort: false,
      },

      {
        id: 6,
        fieldName: "price_per_unit",
        label: "Price Per Unit",
        align: "left",
        sort: false,
      },


      {
        id: 3,
        fieldName: "lead_time",
        label: "Lead Time",
        align: "left",
        sort: true,
        renderValue: (params, setParams) => {
          if (params?.lead_time <= 7) {
            return `${params?.lead_time} ${DAY_WEEK_MONTH.DAY}`;
          } else {
            if (params?.lead_time % 7 === 0) {
              return `${Math.floor(
                (params?.lead_time ?? 0) / 7
              )} ${DAY_WEEK_MONTH.WEEK} `;
            }
            return `${Math.floor(
              (params?.lead_time ?? 0) / 7
            )} ${DAY_WEEK_MONTH.WEEK} ${(params?.lead_time ?? 0) % 7
              } ${DAY_WEEK_MONTH.DAY}`;
          }
        },
      },

      {
        id: 9,
        fieldName: "mpn",
        label: "MPN Number",
        align: "left",
        sort: false,
      },

      user.data.role === USER_ROLES.ADMIN && {
        id: 5,
        fieldName: "",
        label: "Action",
        align: "right",
        renderValue: (params, setParams) => (
          // <ActionComponent
          //   deleteApi={deleteApi}
          //   params={params}
          //   setParams={setParams}
          // />
          <CommonActionComponent
            ViewComponent={RawMaterialInfoController}
            modalkeyView={"infoupdatee"}
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={deleteApi}
            modalkey={"update"}
            EditComponent={RawMaterialCreateController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.BOM}
            callBack={() => dispatch(fetchRawMaterialAction(filters))}            
          />
        ),
      },
    ],
    [deleteApi, user.data.role]
  );

  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name", "mpn", "price_per_unit","rawMaterial_code"],
    sort: "",
    sortDirection: -1,
    name: "",
  });


  const fetchCategoryFun = useCallback(() => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await fetchCategoryApi({ ...filters }),
        (response) => {
          setCategories(response.result);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        }
      )
    );
  }, [dispatch, filters]);


  const getRawMaterialList = useCallback(() => {
    if (
      JSON.stringify(filters) !== JSON.stringify(settings.rawMaterial_filters)
    ) {
      dispatch(fetchRawMaterialAction(filters));
    }
  }, [filters, settings.rawMaterial_filters, dispatch]);
  useEffect(() => {
    getRawMaterialList();
  }, [filters, getRawMaterialList]);


  const handleCategoryChange = (name) => {
    setCategoryType(name);
    setFilters((prevFilters) => ({
      ...prevFilters,
      pageNo: 1,
      name: name === "all" ? null : name,
    }));
  };

  useEffect(() => {
    fetchCategoryFun();
  }, [fetchCategoryFun]);

  return (
    <>
      <RawMaterialMainUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={settings.rawMaterial_loading}
        list={settings.rawMaterial_data}
        columns={columns}
        categoryType={categoryType}
        setCategoryType={setCategoryType}
        categories={categories}
        onCategoryChange={handleCategoryChange}
        loadingCategory={loading}
      />
    </>
  );
};
export default RawMaterialMainController;
