import { Autocomplete, Box, CircularProgress, ListItem } from "@mui/material";

import { memo } from "react";

import moment from "moment";
import { CenteredBox } from "../../components/layouts/OneViewBox";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import CustomInput from "../../components/inputs/CustomInputs";
import { LOG_TYPE, USER_ROLES } from "../../utils/constants";
import { StyledSearchBar } from "../../components/inputs/SearchBar";
import AsyncDropDown from "../../components/inputs/AsyncDropDown";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";
import { fetchProductApi } from "../../apis/product.api";
import { fetchvendorApi } from "../../apis/vendor.api";
import { fetchDepartments } from "../../apis/department.api";
import { fetchTypeofSaless } from "../../apis/typeofsale.api";
import { fetchRawMaterialApi } from "../../apis/rawMaterial.api";
import { fetchCategoryApi } from "../../apis/category.api";
import { useSelector } from "react-redux";
import { DesktopDatePicker } from "@mui/x-date-pickers";

const InOutProductStockCreateUi = ({
  isUpdate,
  fields,
  setFields,
  loading,
  onSubmit,
  createType,
  setCreateType,
}) => {
  const user = useSelector((state) => state.user);
  console.log("formatedd Date", moment(fields.date ?? null));

  return (
    <>
      <CustomDialog
        id={`${isUpdate ? "productupdate" : "CloseTheModal"}`}
        loading={loading}
        err={fields?.err}
        onSubmit={onSubmit}
        title={`${isUpdate ? "Update" : "Update"} Stock`}
        closeText="Close"
        confirmText={`${isUpdate ? "Update" : "Create"}`}
      >
        {loading ? (
          <CenteredBox>
            <CircularProgress />
          </CenteredBox>
        ) : (
          <>
            {
              <Autocomplete
                disabled={loading}
                options={[
                  { label: 'Raw Material', value: 'isRawMaterial' },
                  { label: 'Product', value: 'product' }
                ].filter(option => {
                  const role = user?.data?.role;

                  if ((role === USER_ROLES.ACCOUNT || role === USER_ROLES.PACKAGING_AND_DISPATCH) && option.value === 'isRawMaterial') return false;

                  if ((role === USER_ROLES.PURCHASE || role === USER_ROLES.DESIGN_TEAM) && option.value === 'product') return false;


                  return true;
                })}
                getOptionLabel={(option) => option.label}
                value={
                  createType
                    ? [{ label: 'Raw Material', value: 'isRawMaterial' }, { label: 'Product', value: 'product' }]
                      .find(option => option.value === createType) || null
                    : null
                }
                onChange={(event, newValue) => {
                  setCreateType(newValue?.value || '');
                }}
                renderInput={(params) => (
                  <CustomInput
                    {...params}
                    label="Select the Type*"
                    placeholder="Select the Type*"
                    sx={{ height: '56px' }}
                  />
                )}
              />
            }

            {
              <Autocomplete
                disabled={loading}
                options={[
                  { label: "Stock In", value: LOG_TYPE.In },
                  { label: "Stock Out", value: LOG_TYPE.Out }
                ].filter(option => {
                  const role = user?.data?.role;


                  if (role === USER_ROLES.ACCOUNT && option.value === LOG_TYPE.In) return false;

                  if (role === USER_ROLES.ASSEMBLY) {
                    if (createType === 'isRawMaterial' && option.value === LOG_TYPE.In) return false;
                    if (createType === 'product') return true;
                  }

                  if ((role === USER_ROLES.PURCHASE || role === USER_ROLES.DESIGN_TEAM) && createType === 'product') return false;

                  if (role === USER_ROLES.PACKAGING_AND_DISPATCH && option.value === LOG_TYPE.In) return false;

                  return true;
                })}
                getOptionLabel={(option) => option.label}
                value={
                  fields.logType !== undefined
                    ? [
                      { label: "Stock In", value: LOG_TYPE.In },
                      { label: "Stock Out", value: LOG_TYPE.Out },
                    ].find((option) => option.value === fields.logType) || null
                    : null
                }
                onChange={(e, newValue) => {
                  setFields({ ...fields, logType: newValue?.value || '' });
                }}
                renderInput={(params) => (
                  <CustomInput
                    {...params}
                    label="Stock in/out*"
                    placeholder="Stock in/out*"
                    sx={{ height: '56px' }}
                  />
                )}
              />
            }


            {
              <PaddingBoxInDesktop
                mb={0.9}
                mt={2}
                sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
              >
                <AsyncDropDown
                  defaultVal={
                    fields.product_id
                      ? {
                        _id: fields.product_id?._id,
                        name: fields.product?.product_name,
                      }
                      : null
                  }
                  lazyFun={async (para) =>
                    await fetchProductApi({ ...para, allStatus: true })
                  }
                  OptionComponent={({ option, ...rest }) => {
                    return <ListItem {...rest}>{option.product_name}</ListItem>;
                  }}
                  value={fields?.product_id}
                  onChange={async (changedVal) => {
                    setFields({
                      ...fields,
                      product_id: changedVal ? changedVal._id : null,
                    });
                  }}
                  titleKey={"product_name"}
                  valueKey={"_id"}
                  InputComponent={(params) => (
                    <StyledSearchBar
                      placeholder={"Select Product*"}
                      {...params}
                      margin="none"
                    />
                  )}
                />
              </PaddingBoxInDesktop>
            }

            {<Box mt={2}>
              <CustomInput
                disabled={loading}
                value={fields.quantity}
                onChange={(e) =>
                  setFields({ ...fields, err: "", quantity: e.target.value })
                }
                type="text"
                label={"Quantity*"}
                sx={{ height: "56px" }}
              />
            </Box>
            }
            {<Box mt={2}>
              <CustomInput
                disabled={loading}
                value={fields.invoiceNumber}
                onChange={(e) =>
                  setFields({ ...fields, err: "", invoiceNumber: e.target.value })
                }
                type="text"
                label={"Invoice Number"}
                sx={{ height: "56px" }}
              />
            </Box>
            }
            {createType === "isRawMaterial" && (
              <PaddingBoxInDesktop
                mt={2}
                sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
              >
                <AsyncDropDown
                  defaultVal={
                    fields.rawMaterialId
                      ? {
                        _id: fields.rawMaterialId?._id,
                        name: fields.rawMaterialId?.name,
                      }
                      : null
                  }
                  lazyFun={async (para) =>
                    await fetchRawMaterialApi({ ...para, allStatus: true })
                  }
                  OptionComponent={({ option, ...rest }) => {
                    return <ListItem {...rest}>{option.name}</ListItem>;
                  }}
                  value={fields?.rawMaterialId}
                  onChange={async (changedVal) => {
                    setFields({
                      ...fields,
                      rawMaterialId: changedVal ? changedVal._id : null,
                    });
                  }}
                  titleKey={"name"}
                  valueKey={"_id"}
                  InputComponent={(params) => (
                    <StyledSearchBar
                      placeholder={"Select Raw Material*"}
                      {...params}
                      margin="none"
                    />
                  )}
                />
              </PaddingBoxInDesktop>
            )}

            {
              <PaddingBoxInDesktop
                mt={4}
                sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
              >
                <AsyncDropDown
                  defaultVal={
                    fields.departmentId
                      ? {
                        _id: fields.departmentId._id,
                        name: fields.departmentId.name,
                      }
                      : null
                  }
                  lazyFun={async (para) =>
                    await fetchDepartments({ ...para, allStatus: true })
                  }
                  OptionComponent={({ option, ...rest }) => {
                    return <ListItem {...rest}>{option.name}</ListItem>;
                  }}
                  value={fields?.departmentId}
                  onChange={async (changedVal) => {
                    setFields({
                      ...fields,
                      departmentId: changedVal ? changedVal._id : null,
                    });
                  }}
                  titleKey={"name"}
                  valueKey={"_id"}
                  InputComponent={(params) => (
                    <StyledSearchBar
                      placeholder={"Select Department*"}
                      {...params}
                      margin="none"
                    />
                  )}
                />
              </PaddingBoxInDesktop>
            }
            {
              <PaddingBoxInDesktop
                mt={4}
                sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
              >
                <AsyncDropDown
                  defaultVal={
                    fields.categoryId
                      ? {
                        _id: fields.categoryId._id,
                        name: fields.categoryId.name,
                      }
                      : null
                  }
                  lazyFun={async (para) =>
                    await fetchCategoryApi({ ...para, allStatus: true })
                  }
                  OptionComponent={({ option, ...rest }) => {
                    return <ListItem {...rest}>{option.name}</ListItem>;
                  }}
                  value={fields?.categoryId}
                  onChange={async (changedVal) => {
                    setFields({
                      ...fields,
                      categoryId: changedVal ? changedVal._id : null,
                    });
                  }}
                  titleKey={"name"}
                  valueKey={"_id"}
                  InputComponent={(params) => (
                    <StyledSearchBar
                      placeholder={"Select Category*"}
                      {...params}
                      margin="none"
                    />
                  )}
                />
              </PaddingBoxInDesktop>
            }

            {
              <PaddingBoxInDesktop
                mt={4}
                sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
              >
                <AsyncDropDown
                  defaultVal={
                    fields.vendor
                      ? {
                        _id: fields.vendor?._id,
                        name: fields.vendor?.name,
                      }
                      : null
                  }
                  lazyFun={async (para) =>
                    await fetchvendorApi({ ...para, allStatus: true })
                  }
                  OptionComponent={({ option, ...rest }) => {
                    return <ListItem {...rest}>{option.name}</ListItem>;
                  }}
                  value={fields?.vendor}
                  onChange={async (changedVal) => {
                    setFields({
                      ...fields,
                      vendor: changedVal ? changedVal._id : null,
                    });
                  }}
                  titleKey={"name"}
                  valueKey={"_id"}
                  InputComponent={(params) => (
                    <StyledSearchBar
                      placeholder={"Select Vendor*"}
                      {...params}
                      margin="none"
                    />
                  )}
                />
              </PaddingBoxInDesktop>
            }
            {
              <Box
                mt={2}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "52%" }}
                >
                  <CustomInput
                    disabled={loading}
                    value={fields.amount}
                    onChange={(e) =>
                      setFields({ ...fields, err: "", amount: e.target.value })
                    }
                    type="text"
                    label={"Price*"}
                    sx={{ height: "56px" }}
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <DesktopDatePicker
                    disabled={loading}
                    inputFormat="DD/MM/yyyy"
                    value={moment(fields.date ?? null)}
                    onChange={(e) => {
                      setFields({ ...fields, err: "", date: moment(e).toISOString() });
                    }}
                    renderInput={(props) => (
                      <CustomInput {...props} sx={{ height: "56px" }} />
                    )}
                    type="date"
                    label={"Date*"}
                  />
                </Box>
              </Box>
            }
            {fields.logType === LOG_TYPE.Out && (
              <PaddingBoxInDesktop
                mt={1}
                sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
              >
                <AsyncDropDown
                  defaultVal={
                    fields.typeof_sale
                      ? {
                        _id: fields.typeof_sale?._id,
                        name: fields.typeof_sale?.type,
                      }
                      : null
                  }
                  lazyFun={async (para) =>
                    await fetchTypeofSaless({ ...para, allStatus: true })
                  }
                  OptionComponent={({ option, ...rest }) => {
                    return <ListItem {...rest}>{option.type}</ListItem>;
                  }}
                  value={fields?.typeof_sale}
                  onChange={async (changedVal) => {
                    setFields({
                      ...fields,
                      typeof_sale: changedVal ? changedVal._id : null,
                    });
                  }}
                  titleKey={"type"}
                  valueKey={"_id"}
                  InputComponent={(params) => (
                    <StyledSearchBar
                      placeholder={"Type of Sale*"}
                      {...params}
                      margin="none"
                    />
                  )}
                />
              </PaddingBoxInDesktop>
            )}
          </>
        )}
      </CustomDialog>
    </>
  );
};
export default memo(InOutProductStockCreateUi);
