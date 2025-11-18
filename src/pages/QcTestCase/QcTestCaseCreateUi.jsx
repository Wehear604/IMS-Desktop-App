import { Autocomplete, Box, CircularProgress, ListItem } from "@mui/material";
import { memo } from "react";
import { CATEGORY, QC_TEST_CASE_BAND, QC_TEST_CASE_HEARING_AID } from "../../utils/constants";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { CenteredBox } from "../../components/layouts/OneViewBox";
import CustomInput from "../../components/inputs/CustomInputs";
import {
  findObjectKeyByValue,
  titleCase,
} from "../../utils/main";
import AsyncDropDown from "../../components/inputs/AsyncDropDown";
import { FetchFGApi } from "../../apis/FG.api";

const QcTestCaseCreateUi = ({
  title,
  isUpdate,
  fields,
  setFields,
  loading,
  onSubmit,
}) => {
  return (
    <>
      <CustomDialog
        id="qc-test-case"
        loading={loading}
        err={fields.err}
        onSubmit={onSubmit}
        title={`${isUpdate ? "Update" : "Create"} ${title}`}
        closeText="Close"
        confirmText={`${isUpdate ? "Update" : "Create"}`}
      >
        {loading ? (
          <CenteredBox>
            <CircularProgress />
          </CenteredBox>
        ) : (
          <>
            <CustomInput
              autoFocus={true}
              disabled={loading}
              value={fields.name}
              onChange={(e) =>
                setFields({ ...fields, err: "", name: e.target.value })
              }
              type="text"
              label={"Name*"}
              sx={{margin:"dense"}}
            />

<Autocomplete
              disableClearable
              value={findObjectKeyByValue(fields?.category, CATEGORY)}
              onChange={(e, newVal) => {
                setFields({
                  ...fields,
                  category: newVal ? newVal?._id : null,
                });
              }}
              options={Object.keys(CATEGORY).map((key) => ({
                label: titleCase(key),
                _id: CATEGORY[key],
              }))}
              sx={{
                width: "100%",
                display: "flex",
                "*": { display: "flex", justifyContent: "center" },
              }}
              renderInput={(params) => (
                <CustomInput
                  placeholder="Select Hearing Category*"
                  {...params}
                  label="Select Hearing Category*"
                  margin="dense"
                />
              )}
            />

             {fields.category === CATEGORY.HEARING_BAND &&
            <Autocomplete
              disableClearable
              value={findObjectKeyByValue(fields?.test_case_band, QC_TEST_CASE_BAND)}
              onChange={(e, newVal) => {
                setFields({
                  ...fields,
                  test_case_band: newVal ? newVal?._id : null,
                });
              }}
              options={Object.keys(QC_TEST_CASE_BAND).map((key) => ({
                label: titleCase(key),
                _id: QC_TEST_CASE_BAND[key],
              }))}
              sx={{
                width: "100%",
                display: "flex",
                "*": { display: "flex", justifyContent: "center" },
              }}
              renderInput={(params) => (
                <CustomInput
                  placeholder="Select Test Case Category For Hearing Band*"
                  {...params}
                  label="Select Test Case Category For Hearing Band*"
                  margin="dense"
                />
              )}
            /> }
           
           {fields.category === CATEGORY.HEARING_AID &&
              <Autocomplete
              disableClearable
              value={findObjectKeyByValue(fields?.test_case_hearing_aid, QC_TEST_CASE_HEARING_AID)}
              onChange={(e, newVal) => {
                setFields({
                  ...fields,
                  test_case_hearing_aid: newVal ? newVal?._id : null,
                });
              }}
              options={Object.keys(QC_TEST_CASE_HEARING_AID).map((key) => ({
                label: titleCase(key),
                _id: QC_TEST_CASE_HEARING_AID[key],
              }))}
              sx={{
                width: "100%",
                display: "flex",
                "*": { display: "flex", justifyContent: "center" },
              }}
              renderInput={(params) => (
                <CustomInput
                  placeholder="Select Test Case Category For Hearing Aid*"
                  {...params}
                  label="Select Test Case Category For Hearing Aid*"
                  margin="dense"
                />
              )}
            />}

            <AsyncDropDown
                defaultVal={fields?.product_id ? fields?.product_id?.map(product => ({
                    _id: product?._id,   
                    name: product?.name
                  })) : []}
              lazyFun={async (para) => await FetchFGApi({ ...para })}
              OptionComponent={({ option, ...rest }) => {
                return <ListItem {...rest}>{option.name}</ListItem>;
              }}
              value={fields?.product_id}
              onChange={async (changedVal) => {
                console.log("changed val", changedVal);
                setFields({
                  ...fields,
                   product_id:changedVal ? changedVal.map((val) => val?._id) : null ,
                });
              }}
              titleKey={"name"}
              valueKey={"_id"}
              InputComponent={(params) => (
                <CustomInput
                  placeholder={"Select The Product*"}
                  {...params}
                  margin="none"
                />
              )}
              multiple={true}
            />
          </>
        )}
      </CustomDialog>
    </>
  );
};
export default memo(QcTestCaseCreateUi);
