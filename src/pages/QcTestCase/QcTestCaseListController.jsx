import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { callApiAction } from "../../store/actions/commonAction";
import { Delete, Edit } from "@mui/icons-material";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import MessageDilog from "../../components/texts/MessageDilog";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { CATEGORY, QC_TEST_CASE_BAND, QC_TEST_CASE_HEARING_AID, SNACK_BAR_VARIETNS } from "../../utils/constants";
import { deleteComponentApi } from "../../apis/component.api";
import QcTestCaseListUi from "./QcTestCaseListUi";
import { deleteQcTestCaseApi, fetchQcTestCaseApi } from "../../apis/qcTestCase.api";
import { findObjectKeyByValue } from "../../utils/main";
import QcTestCaseCreateController from "./QcTestCaseCreateController";
import MODULES from "../../utils/module.constant";
import CommonActionComponent from "../../components/CommonActionComponent";

const ActionComponent = memo(({ params, setParams, callBack }) => {
  console.log("params", params);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const modalkey = "qc-test-case";

  const onEdit = () => {
    dispatch(
      openModal(
        <QcTestCaseCreateController
          id={params._id}
          callBack={callBack}
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
        async () => await deleteQcTestCaseApi({ id: params._id }),
        (response) => {
          setLoading(false);
          dispatch(closeModal("messagedialogdelete"));
          dispatch(callSnackBar(params.name + " Deleted Successfully", SNACK_BAR_VARIETNS.suceess))
          callBack();
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

const QcTestCaseListController = () => {
  const dispatch = useDispatch();
  const title = "Qc Test Case";
  const { settings, user } = useSelector((state) => state)

  const deleteApi = deleteComponentApi;
  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["name"],
    sort: "createdAt",
    sortDirection: -1,
  });

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState({});

  const fetchList = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await fetchQcTestCaseApi({ ...filters }),
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
        fieldName: "name",
        label: "Name",
        align: "left",
        sort: true,
      },
      {
        id: 2,
        fieldName: "category",
        label: "Test Case Hearing Category",
        align: "left",
        maxWidth: "150px",
        renderValue: (params, setParams) =>
          findObjectKeyByValue(params.category, CATEGORY),
      },
      {
        id: 3,
        fieldName: (CATEGORY.HEARING_BAND
          ? "test_case_band"
          : "test_case_hearing_aid"),
        label: "Test Case Category",
        align: "left",
        maxWidth: "150px",
        renderValue: (params, setParams) => {
          if (params.category === CATEGORY.HEARING_BAND) {
            return findObjectKeyByValue(params.test_case_band, QC_TEST_CASE_BAND);
          } else if (params.category === CATEGORY.HEARING_AID) {
            return (
              findObjectKeyByValue(params.test_case_hearing_aid, QC_TEST_CASE_HEARING_AID)
            );
          }
          return "";
        }
      },

      {
        id: 4,
        fieldName: "product_id",
        label: "Product",
        align: "left",
        minWidth: "300px",
        renderValue: (params, setParams) =>
          params?.product_id?.map((item) => (
            <>
              <Chip

                label={item?.name}
                sx={{ m: 1 }}
                key={item?._id}
                color="primary"
                variant="outlined"
                size="medium"
              />
            </>
          )),
      },
      {
        id: 5,
        fieldName: "",
        label: "Action",
        align: "right",
        hide: user?.data?.ims_modules?.find(item => item.module === MODULES.QC_TEST_CASE)?.actions?.length === 0 ? true : false,
        renderValue: (params, setParams) => (
          <CommonActionComponent
            DeleteMessage={`Are you sure to delete "${params.name || params.title}" ?`}
            DeleteApi={deleteApi}
            modalkey={"qc-test-case"}
            EditComponent={QcTestCaseCreateController}
            params={params}
            setParams={setParams}
            ModuleMatch={MODULES.QC_TEST_CASE}
            callBack={() => fetchList()}
          />
        ),
      },
    ],
    [dispatch, filters]
  );

  const onCreateBtnClick = () => {
    dispatch(
      openModal(
        <QcTestCaseCreateController
          callBack={async () => {
            fetchList();
          }}
        />,
        "sm",
        false,
        "qc-test-case"
      )
    );
  };

  useEffect(() => {
    fetchList();
  }, [filters]);

  return (
    <>
      <QcTestCaseListUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        list={list}
        setList={setList}
        columns={columns}
        onCreateBtnClick={onCreateBtnClick}
      />
    </>
  );
};
export default QcTestCaseListController;
