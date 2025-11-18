import React, { useEffect, useState } from "react";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import CustomInput from "../../components/inputs/CustomInputs";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItem,
  OutlinedInput,
  TextField,
} from "@mui/material";
import { LOG_TYPE, MATERIAL_TYPE } from "../../utils/constants";
import { findObjectKeyByValue, titleCase } from "../../utils/main";
import moment from "moment";
import { fetchRawMaterialApi } from "../../apis/rawMaterial.api";
import AsyncDropDown from "../../components/inputs/AsyncDropDown";
import { StyledSearchBar } from "../../components/inputs/SearchBar";
import { FetchSKDApi } from "../../apis/skd.api";
import { FetchSFGApi } from "../../apis/sfg.api";
import { FetchFGApi } from "../../apis/FG.api";

import { CenteredBox } from "../../components/layouts/OneViewBox";
import { fetchvendorApi, FetchvendorRawMaterialWiseApi } from "../../apis/vendor.api";
import { QrCodeScanner } from "@mui/icons-material";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { useDispatch } from "react-redux";
import QrScannerPopup from "../../components/Scanner/QrScannerPopup";
import { fetchHrmsProjects, FetchItemApi } from "../../apis/item.api";
import { fetchCategoryApi } from "../../apis/category.api";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { callApiAction } from "../../store/actions/commonAction";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";
import { fetchlocationMasterApi } from "../../apis/locationMaster.api";

const UpdateStockUi = ({
  Type,
  id,
  QrId,
  QrLoading,
  SetQrId,
  loading,
  onSubmit,
  fields,
  setFields
}) => {

  console.log("fields?.materialIds?.materialName", fields.materialName);
  let materialtype = [
    ...Object.keys(MATERIAL_TYPE)?.map((key) => ({
      label: titleCase(key).toUpperCase(),
      _id: MATERIAL_TYPE[key],
    })),
  ];

  const onScan = (data) => {
    SetQrId(data.text);
  };
  const dispatch = useDispatch();
  const onQrBtnClick = () => {
    dispatch(
      openModal(
        <QrScannerPopup
          onScan={onScan}
          onClose={() => dispatch(closeModal("scanner"))}
        />,
        "sm",
        false,
        "scanner"
      )
    );
  };

  const APICall = (type) => {
    switch (type) {
      case MATERIAL_TYPE.RAW_MATERIALS:
        return { api: fetchRawMaterialApi, lable: "Select Raw Material" };
      case MATERIAL_TYPE.SKD:
        return { api: FetchSKDApi, lable: "Select Sami Know Down" };
      case MATERIAL_TYPE.SFG:
        return { api: FetchSFGApi, lable: "Select Sami Finsh Good" };
      case MATERIAL_TYPE.FG:
        return { api: FetchFGApi, lable: "Select Finsh Good" };
      case MATERIAL_TYPE.ITEM:
        return { api: FetchItemApi, lable: "Select Item" };
      default:
        return null;
    }
  };

  const TypeData = Type === LOG_TYPE.Out ? fields?.quantity ? false : true : false

  const handleDeleteItem = (index) => {
    const updated = fields.batchNumbers.filter((_, inx) => inx !== index);
    setFields({ ...fields, err: "", batchNumbers: updated });
  };

  const [project, SetProject] = useState([]);

  const fetchProductList = () => {
    dispatch(
      callApiAction(
        async () => await fetchHrmsProjects({ allStatus: true }),
        (response) => {
          SetProject(response.result);
        },
        (err) => {
          console.log("Fetch error", err);
        }
      )
    );
  };

  useEffect(() => {
    fetchProductList();
  }, []);

  return (
    <CustomDialog
      id={"stockInOut"}
      loading={loading}
      err={fields.err}
      onSubmit={onSubmit}
      title={"Update Stock"}
      closeText={"Close"}
      confirmText={"Update"}
    >
      {loading || QrLoading?.current ? (
        <CenteredBox>
          <CircularProgress />
        </CenteredBox>
      ) : (
        <>

          {(!id && Type === LOG_TYPE.In) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: 3,
                width: "100%",
              }}
            >
              <FormControl color="primary" fullWidth variant="outlined">
                <InputLabel color="primary" htmlFor="outlined-adornment-boxid">
                  Enter QR ID*
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-boxid"
                  value={QrId || ""}
                  onChange={(e) => SetQrId(e.target.value)}
                  type="text"
                  autoFocus={true}
                  disabled={loading}
                  endAdornment={
                    <>
                      {loading && <CircularProgress size={30} />}
                      <InputAdornment position="end">
                        <IconButton onClick={onQrBtnClick} edge="end">
                          <QrCodeScanner />
                        </IconButton>
                      </InputAdornment>
                    </>
                  }
                  color="primary"
                  label="Enter QR ID*"
                />
              </FormControl>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, width: '100%' }}>
            <DesktopDatePicker
              disabled={loading}
              inputFormat="DD-MM-yyyy"
              value={moment(fields?.date ?? null)}
              onChange={(changedVal) => {
                console.log('Date changed:', changedVal);
                setFields({ ...fields, err: '', date: changedVal });
              }}
              renderInput={(props) => <CustomInput {...props} sx={{ height: '56px' }} />}
              type="date"
              label={'Date*'}
              maxDate={moment()}
            />
          </Box>
          <Box
            width={"100%"}
            gap={2}
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            {Type === LOG_TYPE.Out &&
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  // mt: 1,

                  width: fields?.category?.name === "R & D" ? "50%" : "100%",
                }}
              > <AsyncDropDown
                  key={fields?.materialId}
                  defaultVal={
                    fields.category
                      ? {
                        _id: fields?.category?._id
                          ? fields?.category?._id
                          : fields?.category,
                        name: fields?.category?.name
                          ? fields?.category?.name
                          : fields?.categoryName,
                      }
                      : null
                  }
                  lazyFun={async (para) =>
                    await fetchCategoryApi({
                      ...para,
                      allStatus: true
                    })
                  }
                  OptionComponent={({ option, ...rest }) => {
                    return <ListItem {...rest}>{option.name}</ListItem>;
                  }}
                  onChange={async (changedVal) => {
                    setFields({
                      ...fields,
                      category: changedVal ? changedVal._id : null,
                      categoryName: changedVal ? changedVal.name : null,
                    });
                  }}
                  titleKey={"name"}
                  valueKey={"_id"}
                  InputComponent={(params) => (
                    <CustomInput
                      {...params}
                      label="Select Category*"
                      placeholder="Select Category*"
                      margin="dense"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Box>}
            {fields?.categoryName === "R & D" &&
              <Autocomplete
                defaultVal={
                  fields.projectId
                    ? {
                      _id: fields?.projectId?._id
                        ? fields?.projectId?._id
                        : fields?.projectId,
                      name: fields?.projectName?.name
                        ? fields?.projectName?.name
                        : fields?.projectName,
                    }
                    : null
                }
                sx={{ width: "100%" }}
                options={project ?? []}
                getOptionLabel={(option) => option.project_name}
                onChange={(event, value) => {
                  setFields({
                    ...fields,
                    projectId: value ? value._id : null,
                    projectName: value ? value.project_name : null,
                  });
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip label={option.project_name} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    label="Select Project*"
                    variant="outlined"
                    placeholder="Select Project*"
                  />
                )}
              />
              // <AsyncDropDown
              //   defaultVal={
              //     fields.projectId
              //       ? {
              //         _id: fields?.projectId?._id
              //           ? fields?.projectId?._id
              //           : fields?.projectId,
              //         name: fields?.projectName?.name
              //           ? fields?.projectName?.name
              //           : fields?.projectName,
              //       }
              //       : null
              //   }
              //   lazyFun={async (para) =>
              //     await fetchHrmsProjects({
              //       ...para,
              //       allStatus: true,
              //     })
              //   }
              //   OptionComponent={({ option, ...rest }) => {
              //     return <ListItem {...rest}>{option.project_name}</ListItem>;
              //   }}
              //   onChange={async (changedVal) => {
              //     setFields({
              //       ...fields,
              //       projectId: changedVal ? changedVal._id : null,
              //       projectName: changedVal ? changedVal.project_name : null,
              //     });
              //   }}
              //   titleKey={"project_name"}
              //   valueKey={"_id"}
              //   InputComponent={(params) => (
              //     <CustomInput
              //       {...params}
              //       label="Select Project*"
              //       placeholder="Select Project*"
              //       margin="dense"
              //       InputLabelProps={{ shrink: true }}
              //     />
              //   )}
              // />
            }
          </Box>
          <Box mt={1} sx={{ width: "100%" }}>
            <Autocomplete
              disableClearable
              options={materialtype}
              value={findObjectKeyByValue(
                fields?.materialType,
                MATERIAL_TYPE
              )}
              onChange={(e, newVal) => {
                setFields({
                  ...fields,
                  materialType: newVal ? newVal._id : null,
                  materialId: null,
                });
              }}
              sx={{
                width: "100%",
                display: "flex",
                "*": { display: "flex", justifyContent: "center" },
              }}
              renderInput={(params) => (
                <CustomInput
                  placeholder="Select Material Type*"
                  {...params}
                  label="Select Material Type*"
                  margin="dense"
                />
              )}
            />
          </Box>

          <Box mt={1}>
            {fields.materialType && (
              <AsyncDropDown
                key={fields.materialType}
                Value={
                  fields?.materialName
                    ? {
                      _id: fields?.materialIds?._id,
                      name: fields?.materialName,
                    }
                    : null
                }
                lazyFun={async (para) => {
                  const apiFn = APICall(fields.materialType);
                  return apiFn ? await apiFn.api(para) : [];
                }}
                OptionComponent={({ option, ...rest }) => {
                  return <ListItem {...rest}>{option?.name} {option?.mpn && `(${option?.mpn})`}</ListItem>;
                }}
                // value={fields?.materialId}
                onChange={async (changedVal) => {
                  setFields({
                    ...fields,
                    materialId: changedVal ? changedVal?._id : null,
                    materialName: changedVal
                      ? `${changedVal?.name ?? ""} (${changedVal?.mpn ?? ""})`.trim()
                      : null,
                  });
                }}
                titleKey={"name"}
                valueKey={"_id"}
                InputComponent={(params) => {
                  const label = APICall(fields.materialType)?.lable || "";
                  console.log("LABEKDD", label)
                  console.log("paramsss")
                  return (
                    <CustomInput
                      {...params}
                      label={`${label}*`}
                      placeholder={`${label}*`}
                      margin="dense"
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
              />
            )}
          </Box>

          {/* {fields?.materialType === MATERIAL_TYPE.RAW_MATERIALS && */}
          {Type === LOG_TYPE.In && fields?.materialType !== MATERIAL_TYPE.FG && (
            <Box>
              <AsyncDropDown
                key={fields?.materialId}
                defaultVal={
                  fields.vendorId
                    ? {
                      _id: fields?.vendorId?._id
                        ? fields?.vendorId?._id
                        : fields?.vendorId,
                      name: fields?.vendorId?.name
                        ? fields?.vendorId?.name
                        : fields?.vendorName,
                    }
                    : null
                }
                lazyFun={async (para) =>
                  await FetchvendorRawMaterialWiseApi({
                    ...para,
                    allStatus: true,
                    materialId: fields?.materialId
                  })
                }
                OptionComponent={({ option, ...rest }) => {
                  return <ListItem {...rest}>{option.name}</ListItem>;
                }}
                value={fields?.vendorName}
                onChange={async (changedVal) => {
                  setFields({
                    ...fields,
                    vendorId: changedVal ? changedVal._id : null,
                    vendorName: changedVal ? changedVal.name : null,
                  });
                }}
                titleKey={"name"}
                valueKey={"_id"}
                InputComponent={(params) => (
                  <CustomInput
                    {...params}
                    label="Select Vendor"
                    placeholder="Select Vendor"
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Box>
          )}

          {
            <CustomInput
              disabled={loading || !(fields.materialType && fields.materialId)}
              value={fields?.quantity}
              onChange={(e) => {
                let inputValue = Number(e.target.value);
                if (inputValue < 0) inputValue = 0;
                setFields({ ...fields, err: "", quantity: inputValue });
              }}
              type="number"
              label={"Quantity*"}
              onWheel={(e) => e.target.blur()}
            />
          }

          {
            <CustomInput
              disabled={fields?.totalPrice && (fields?.projectId || fields?.projectId?._id) || loading}
              value={fields?.totalPrice && (fields?.projectId || fields?.projectId?._id) ? fields?.totalPrice : fields?.amount}
              onChange={(e) => {
                let inputValue = Number(e.target.value);
                if (inputValue < 0) inputValue = 0;
                setFields({ ...fields, err: "", amount: inputValue });
              }}
              type="number"
              label={"Amount"}
              onWheel={(e) => e.target.blur()}
            />
          }

          {
            <CustomInput
              disabled={loading}
              value={fields?.invoiceNumber}
              onChange={(e) =>
                setFields({ ...fields, err: "", invoiceNumber: e.target.value })
              }
              type="text"
              label={"Invoice Number"}
            />
          }

          {Type === LOG_TYPE.In && <PaddingBoxInDesktop mt={3} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
            <AsyncDropDown
              lazyFun={async (para) => await fetchlocationMasterApi({ ...para, allStatus: true })}
              OptionComponent={({ option, ...rest }) => {
                return <ListItem {...rest}>{option.name}</ListItem >
              }}
              value={fields?.product_name}
              onChange={async (changedVal) => {
                setFields({ ...fields, location: changedVal ? changedVal._id : null });
              }}
              titleKey={'name'}
              valueKey={"_id"}
              InputComponent={(params) => <StyledSearchBar placeholder={"Location Master*"} {...params} margin="none" />}
            />
          </PaddingBoxInDesktop>}

          {Array.isArray(fields?.batchNumbers) && fields.batchNumbers.length > 0 && !TypeData && (
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              {fields.batchNumbers.map((batch, index) => (
                <Box key={index} display="flex" gap={2}>
                  <CustomInput
                    disabled={Type === LOG_TYPE.Out}
                    value={batch?.batchNumber}
                    type="text"
                    label={`Batch Number ${index + 1}*`}
                    InputLabelProps={{
                      shrink: batch?.batchNumber ? true : false,
                    }}
                    onChange={(e) => {
                      let value = e.target.value;

                      const updated = [...fields.batchNumbers];
                      updated[index] = {
                        ...updated[index],
                        batchNumber: value,
                      };

                      setFields({ ...fields, err: "", batchNumbers: updated });
                    }}

                  />
                  <CustomInput
                    disabled={Type === LOG_TYPE.Out}
                    value={batch?.quantity}
                    type="number"
                    label={`Quantity ${index + 1}*`}
                    InputLabelProps={{
                      shrink: batch?.quantity ? true : false,
                    }}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (!/^\d*$/.test(value)) return;
                      const updatedValue = Math.max(0, Number(value));

                      const updated = [...fields.batchNumbers];
                      updated[index] = {
                        ...updated[index],
                        quantity: updatedValue,
                      };

                      setFields({ ...fields, err: "", batchNumbers: updated });
                    }}

                  />
                  {Type === LOG_TYPE.In
                    && < IconButton
                      disabled={fields?.batchNumbers?.length <= 1}
                      color="error"
                      onClick={() => handleDeleteItem(index)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>}
                </Box>
              ))}
            </Box>
          )}
          {Type === LOG_TYPE.In && <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>

            <IconButton sx={{ width: "9%" }} disabled={loading} size="inherit" onClick={() => {
              setFields((data) => {
                let arr = [...data.batchNumbers];
                arr.push({
                  quantity: null,
                  batchNumber: ""
                });
                return { ...data, batchNumbers: arr };
              });
            }}>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", borderRadius: "50%", border: "2px solid" }}>
                <AddIcon sx={{ width: "100%", height: "4vh" }} />
              </Box>
            </IconButton>
          </Box>}
        </>
      )}
    </CustomDialog>
  );
};

export default UpdateStockUi;
