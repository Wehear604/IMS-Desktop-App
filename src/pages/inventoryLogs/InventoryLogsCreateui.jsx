import React, { useEffect, useState } from "react";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import CustomInput from "../../components/inputs/CustomInputs";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItem,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { LOG_TYPE, MATERIAL_TYPE } from "../../utils/constants";
import { findObjectKeyByValue, titleCase } from "../../utils/main";
import moment from "moment";
import { fetchRawMaterialApi } from "../../apis/rawMaterial.api";
import AsyncDropDown from "../../components/inputs/AsyncDropDown";
import { StyledSearchBar } from "../../components/inputs/SearchBar";
import { FetchSKDApi } from "../../apis/skd.api";
import { FetchSFGApi } from "../../apis/sfg.api";
import { FetchFGApi, getFGItemCodeByIdApi } from "../../apis/FG.api";
import { fetchvendorApi, FetchvendorRawMaterialWiseApi } from "../../apis/vendor.api";
import { closeModal, openModal } from "../../store/actions/modalAction";
import { useDispatch } from "react-redux";
import { QrCodeScanner } from "@mui/icons-material";
import QrScannerPopup from "../../components/Scanner/QrScannerPopup";
import { CenteredBox } from "../../components/layouts/OneViewBox";
import { fetchRejectionReasonApi } from "../../apis/rejectionReason.api";
import AddIcon from "@mui/icons-material/Add";
import FileInput from "../../components/layouts/upload/FileInput";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchlocationMasterApi } from "../../apis/locationMaster.api";
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop";

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const InventoryLogsCreateui = ({
  id,
  QrId,
  QrLoading,
  SetQrId,
  loading,
  onSubmit,
  fields,
  setFields,
  APICall
}) => {
  const dispatch = useDispatch();
  let materialtype = [
    ...Object.keys(MATERIAL_TYPE)?.map((key) => ({
      label: titleCase(key).toUpperCase(),
      _id: MATERIAL_TYPE[key],
    })),
  ];

  const onScan = (data) => {
    SetQrId(data.text);
  };

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

  const fetchMaterialDetailsById = async (id) => {
    try {
      const response = await getFGItemCodeByIdApi({ id });
      return response.data;
    } catch (error) {
      console.error("Error fetching material details:", error);
      return {};
    }
  };

  useEffect(() => {
    if (id) {
      if (
        !fields.iqc ||
        !fields.iqc.rejected ||
        fields.iqc.rejected.length === 0
      ) {
        setFields((prev) => ({
          ...prev,
          iqc: {
            ...prev.iqc,
            rejected: [{ quantity: 0, reason: "" }],
          },
        }));
      }
    }
  }, [id, fields.iqc, setFields]);

  const calculateAcceptedQuantity = () => {
    const totalRejected =
      fields.iqc && fields.iqc.rejected
        ? fields.iqc.rejected.reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        )
        : 0;
    return Math.max(Number(fields.quantity) - totalRejected, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (QrId === "" || id || QrLoading.current) {
      QrLoading.current = true;
      return onSubmit(e);
    } else if (isValidObjectId(QrId) === false) {
      setFields({ ...fields, err: "Please enter a valid QR Code ID" });
    }
  };

  return (
    <CustomDialog
      id={id ? "update" : "inventoryLog"}
      loading={loading}
      err={fields.err}
      onSubmit={handleSubmit}
      title={"Update GRN"}
      closeText={"Close"}
      confirmText={"Update"}
    >
      {loading ? (
        <CenteredBox>
          <CircularProgress />
        </CenteredBox>
      ) : (
        <>
          {!id ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 3,
                  width: "100%",
                }}
              >
                <FormControl color="primary" fullWidth variant="outlined">
                  <InputLabel
                    color="primary"
                    htmlFor="outlined-adornment-boxid"
                  >
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
              <Box
                width={"100%"}
                gap={2}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 1,
                    width: "50%",
                  }}
                >
                  <DesktopDatePicker
                    disabled={loading || id}
                    inputFormat="DD-MM-yyyy"
                    value={moment(fields?.date ?? null)}
                    onChange={(changedVal) => {
                      setFields({ ...fields, err: "", date: changedVal });
                    }}
                    renderInput={(props) => (
                      <CustomInput {...props} sx={{ height: "56px" }} />
                    )}
                    type="date"
                    label={"Date*"}
                  />
                </Box>

                <Box mt={1} sx={{ width: "50%" }}>
                  <Autocomplete
                    disabled={loading || id}
                    options={materialtype}
                    value={findObjectKeyByValue(
                      fields?.materialType,
                      MATERIAL_TYPE
                    )?.toUpperCase()}
                    onChange={(e, newVal) => {
                      setFields({
                        ...fields,
                        materialType: newVal ? newVal._id : null,
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
              </Box>

              <Box mt={1}>
                {fields?.materialType && <AsyncDropDown
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
                  onChange={async (changedVal) => {
                    setFields({
                      ...fields,
                      materialId: changedVal ? changedVal?._id : null,
                      itemCode: changedVal ? APICall(fields.materialType, changedVal)?.code || "" : "",
                      pricePerUnits: changedVal ? (changedVal?.price_per_unit) : "",
                      amount: changedVal ? ((changedVal?.price_per_unit || 0) * (Number(fields?.quantity) || 0)) : 0,
                      materialName: changedVal && changedVal?.mpn
                        ? `${changedVal?.name ?? ""} (${changedVal?.mpn ?? ""})`.trim()
                        : null,
                    });
                  }}
                  titleKey={"name"}
                  valueKey={"_id"}
                  InputComponent={(params) => {
                    const label = APICall(fields.materialType)?.label || "";
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
                />}
              </Box>
              {!id && (
                <Box mt={1}>
                  <CustomInput
                    disabled={loading}
                    value={fields.itemCode}
                    onChange={(e) => {
                      setFields({
                        ...fields,
                        err: "",
                        itemCode: e.target.value,
                      });
                    }}
                    type="text"
                    label={"Item Code*"}
                  />
                </Box>
              )}
              {!id &&
                // fields?.materialType === 1 &&
                fields?.materialType !== MATERIAL_TYPE.FG &&
                fields.logType === LOG_TYPE.In && (
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
              {!id && (
                <Box mt={1}>
                  <CustomInput
                    disabled={loading}
                    value={fields.batchNumber}
                    onChange={(e) => {
                      setFields({
                        ...fields,
                        err: "",
                        batchNumber: e.target.value,
                      });
                    }}
                    type="text"
                    label={"Batch Number*"}
                  />
                </Box>
              )}

              {/* <Box mt={1}>
                <Autocomplete
                  disabled={true}
                  options={logType}
                  value={findObjectKeyByValue(fields?.logType, LOG_TYPE)}
                  onChange={(e, newVal) => {
                    setFields({
                      ...fields,
                      logType: newVal ? newVal._id : null,
                    });
                  }}
                  sx={{
                    width: "100%",
                    display: "flex",
                    "*": { display: "flex", justifyContent: "center" },
                  }}
                  renderInput={(params) => (
                    <CustomInput
                      placeholder="Select Log Type*"
                      {...params}
                      label="Select Log Type*"
                      margin="dense"
                    />
                  )}
                />
              </Box> */}

              <CustomInput
                disabled={loading || id}
                value={fields?.quantity}
                onChange={(e) => {
                  const newQuantity = Number(e.target.value) || 0;
                  setFields((prevFields) => ({
                    ...prevFields,
                    quantity: newQuantity,
                    iqc: {
                      ...prevFields.iqc,
                      accepted: Math.max(
                        newQuantity -
                        (prevFields.iqc && prevFields.iqc.rejected
                          ? prevFields.iqc.rejected.reduce(
                            (sum, item) =>
                              sum + (Number(item.quantity) || 0),
                            0
                          )
                          : 0),
                        0
                      ),
                    },
                  }));
                }}
                type="number"
                label={"Quantity*"}
                onWheel={(e) => e.target.blur()}
              />



              {!id && (
                <CustomInput
                  disabled={loading}
                  value={fields?.amount}
                  onChange={(e) =>
                    setFields({ ...fields, err: "", amount: e.target.value })
                  }
                  type="text"
                  label={"Amount"}
                />
              )}
              <Box mt={1}>
                <CustomInput
                  disabled={loading}
                  value={fields.invoiceNumber}
                  onChange={(e) => {
                    setFields({
                      ...fields,
                      err: "",
                      invoiceNumber: e.target.value,
                    });
                  }}
                  type="text"
                  label={"Invoice No"}
                />
              </Box>


            </>
          ) : (
            <>
              <Box mt={2}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {/* Render two label-value pairs per row */}
                    <tr>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          border: "1px solid #eee",
                          width: "15%",
                        }}
                      >
                        Date
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #eee",
                          width: "35%",
                        }}
                      >
                        {fields?.date
                          ? moment(fields?.date).format("DD-MM-YYYY")
                          : ""}
                      </td>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          border: "1px solid #eee",
                          width: "15%",
                        }}
                      >
                        Material Type
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #eee",
                          width: "35%",
                        }}
                      >
                        {titleCase(
                          findObjectKeyByValue(
                            fields?.materialType,
                            MATERIAL_TYPE
                          ) || ""
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          border: "1px solid #eee",
                        }}
                      >
                        Material Name
                      </td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>
                        {fields?.materialIds?.name || ""}
                      </td>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          border: "1px solid #eee",
                        }}
                      >
                        Log Type
                      </td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>
                        {titleCase(
                          findObjectKeyByValue(fields?.logType, LOG_TYPE) || ""
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          border: "1px solid #eee",
                        }}
                      >
                        Quantity
                      </td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>
                        {fields?.quantity}
                      </td>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          border: "1px solid #eee",
                        }}
                      >
                        Invoice No
                      </td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>
                        {fields?.invoiceNumber}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          border: "1px solid #eee",
                        }}
                      >
                        Amount
                      </td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>
                        {fields?.amount}
                      </td>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          border: "1px solid #eee",
                        }}
                      >
                        Vendor
                      </td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>
                        {fields?.vendorName || fields?.vendorId?.name || ""}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          border: "1px solid #eee",
                        }}
                      >
                        Item Code
                      </td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>
                        {fields?.itemCode}
                      </td>
                      <td
                        style={{
                          fontWeight: "bold",
                          padding: 8,
                          border: "1px solid #eee",
                        }}
                      >
                        Accepted Quantity
                      </td>
                      <td style={{ padding: 8, border: "1px solid #eee" }}>
                        {calculateAcceptedQuantity()}
                      </td>
                    </tr>
                    <tr> <td colSpan={4} style={{ padding: 0, border: "none" }}>
                      {<PaddingBoxInDesktop mt={3} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
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
                    </td>
                    </tr>
                    {fields.iqc.rejected.map((rejection, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td colSpan={4} style={{ padding: 0, border: "none" }}>
                            <Box
                              mt={2}
                              mb={2}
                              p={2}
                              sx={{ border: "1px solid", borderRadius: 2 }}
                            >
                              <Box
                                display="flex"
                                flexDirection="row"
                                alignItems="center"
                                gap={2}
                              >
                                <Box flex={1}>
                                  <Box display="flex" gap={2}>
                                    <CustomInput
                                      disabled={loading}
                                      value={rejection.quantity}
                                      min={0}
                                      onChange={(e) => {
                                        let inputValue = Number(e.target.value);
                                        if (inputValue < 0) inputValue = 0;

                                        const currentTotalRejected =
                                          fields.iqc.rejected.reduce(
                                            (sum, item, idx) =>
                                              idx === index
                                                ? sum
                                                : sum + (Number(item.quantity) || 0),
                                            0
                                          );
                                        const maxAllowed =
                                          Number(fields.quantity) -
                                          currentTotalRejected;

                                        if (inputValue > maxAllowed)
                                          inputValue = maxAllowed;

                                        let newRejected = [
                                          ...fields.iqc.rejected,
                                        ];
                                        newRejected[index] = {
                                          ...newRejected[index],
                                          quantity: inputValue,
                                        };

                                        const totalRejected = newRejected.reduce(
                                          (sum, item) =>
                                            sum + (Number(item.quantity) || 0),
                                          0
                                        );

                                        setFields({
                                          ...fields,
                                          iqc: {
                                            ...fields.iqc,
                                            rejected: newRejected,
                                            accepted: Math.max(
                                              Number(fields.quantity) -
                                              totalRejected,
                                              0
                                            ),
                                          },
                                        });
                                      }}
                                      type="number"
                                      label={"Rejected Quantity*"}
                                      onWheel={(e) => e.target.blur()}
                                    />
                                    <AsyncDropDown
                                      Value={
                                        {
                                          _id: fields.iqc.rejected[index]?.reason,
                                          name: fields.iqc.rejected[index]?.name,
                                        }
                                      }
                                      lazyFun={async (para) =>
                                        await fetchRejectionReasonApi({
                                          ...para,
                                          allStatus: true,
                                        })
                                      }
                                      OptionComponent={({ option, ...rest }) => (
                                        <ListItem {...rest}>
                                          {option?.name}
                                        </ListItem>
                                      )}
                                      value={rejection.reason}
                                      onChange={(selectedOption) => {
                                        let newRejected = [
                                          ...fields.iqc.rejected,
                                        ];
                                        newRejected[index] = {
                                          ...newRejected[index],
                                          reason: selectedOption?._id ? selectedOption?._id : "68593b996343fcfdb8e17f56",
                                          name: selectedOption?.name ? selectedOption?.name : "No Rejection",
                                        };
                                        setFields({
                                          ...fields,
                                          iqc: {
                                            ...fields.iqc,
                                            rejected: newRejected,
                                          },
                                        });
                                      }}
                                      titleKey={"name"}
                                      valueKey={"_id"}
                                      InputComponent={(params) => (
                                        <StyledSearchBar
                                          placeholder={"Select Rejection Reason*"}
                                          {...params}
                                          margin="dense"
                                        />
                                      )}
                                    />
                                  </Box>
                                  <Box mt={2}>
                                    <FileInput
                                      onlyImage={false}
                                      multi={false}
                                      onDelete={() => {
                                        let newRejected = [...fields.iqc.rejected];
                                        newRejected[index] = {
                                          ...newRejected[index],
                                          photo: null,
                                        };
                                        setFields({
                                          ...fields,
                                          iqc: {
                                            ...fields.iqc,
                                            rejected: newRejected,
                                          },
                                        });
                                      }}
                                      onChange={(files) => {
                                        let newRejected = [...fields.iqc.rejected];
                                        newRejected[index] = {
                                          ...newRejected[index],
                                          photo: files,
                                        };
                                        setFields({
                                          ...fields,
                                          iqc: {
                                            ...fields.iqc,
                                            rejected: newRejected,
                                          },
                                        });
                                      }}
                                      defaults={
                                        rejection?.photo ? [rejection?.photo] : []
                                      }
                                      accept="image/"
                                      title="Upload Photo"
                                      subTitle="Only png, jpeg, jpg, pdf files are allowed! Less than 1 MB"
                                    />
                                  </Box>
                                </Box>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  sx={{ height: "100%" }}
                                >
                                  <IconButton
                                    aria-label="delete"
                                    color="error"
                                    disabled={fields.iqc.rejected.length === 1}
                                    onClick={() => {
                                      if (index === 0) return;
                                      let newRejected = fields.iqc.rejected.filter(
                                        (_, idx) => idx !== index
                                      );
                                      if (newRejected.length === 0) {
                                        newRejected = [{
                                          quantity: 0, reason: "68593b996343fcfdb8e17f56", name: "No Rejection"
                                        }];
                                      }
                                      const totalRejected = newRejected.reduce(
                                        (sum, item) => sum + (Number(item.quantity) || 0),
                                        0
                                      );
                                      setFields({
                                        ...fields,
                                        iqc: {
                                          ...fields.iqc,
                                          rejected: newRejected,
                                          accepted: Math.max(
                                            Number(fields.quantity) - totalRejected,
                                            0
                                          ),
                                        },
                                      });
                                    }}
                                    sx={{ ml: 1 }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: 8,
                          border: "1px solid #eee",
                        }}
                      >
                        <Button
                          variant="outlined"
                          onClick={() => {
                            let newRejected = [
                              ...fields.iqc.rejected,
                              {
                                quantity: 0,
                                reason: "68593b996343fcfdb8e17f56",
                                name: "No Rejection"
                              },
                            ];
                            const totalRejected = newRejected.reduce(
                              (sum, item) => sum + (Number(item.quantity) || 0),
                              0
                            );
                            setFields({
                              ...fields,
                              iqc: {
                                ...fields.iqc,
                                rejected: newRejected,
                                accepted: Math.max(
                                  Number(fields.quantity) - totalRejected,
                                  0
                                ),
                              },
                            });
                          }}
                        >
                          <AddIcon fontSize="small" />
                          <Typography variant="h6">Add</Typography>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Box>
            </>
          )}
        </>
      )}
    </CustomDialog>
  );
};

export default InventoryLogsCreateui;


// {
//   fields?.materialType == 1 && (
//     <AsyncDropDown
//       defaultVal={
//         fields?.materialIds
//           ? {
//             _id: fields?.materialIds?._id,
//             name: fields?.materialIds?.name,
//           }
//           : null
//       }
//       lazyFun={async (para) =>
//         await fetchRawMaterialApi({ ...para, allStatus: true })
//       }
//       OptionComponent={({ option, ...rest }) => {
//         return <ListItem {...rest}>{option?.name}</ListItem>;
//       }}
//       value={fields?.materialId}
//       onChange={async (changedVal) => {
//         if (changedVal) {
//           try {
//             const materialDetails =
//               await fetchMaterialDetailsById(changedVal._id);
//             const pricePerUnit = materialDetails?.price_per_unit;
//             const quantity = Number(fields?.quantity) || 0;
//             setFields((prevFields) => ({
//               ...prevFields,
//               materialId: changedVal._id,
//               itemCode: materialDetails?.code || "",
//               pricePerUnits: pricePerUnit,
//               amount: pricePerUnit * quantity,
//             }));
//           } catch (error) {
//             console.error(
//               "Error fetching material details:",
//               error
//             );
//           }
//         } else {
//           setFields((prevFields) => ({
//             ...prevFields,
//             materialId: null,
//             itemCode: "",
//             pricePerUnits: 0,
//             amount: 0,
//           }));
//         }
//       }}
//       disabled={loading || id}
//       titleKey={"name"}
//       valueKey={"_id"}
//       InputComponent={(params) => (
//         <StyledSearchBar
//           placeholder={"Select Raw Material*"}
//           {...params}
//           margin="none"
//         />
//       )}
//     />
//   )
// }

// {
//   fields?.materialType == 2 && (
//     <AsyncDropDown
//       disabled={loading || id}
//       defaultVal={
//         fields?.materialIds
//           ? {
//             _id: fields?.materialIds?._id,
//             name: fields?.materialIds?.name,
//           }
//           : null
//       }
//       lazyFun={async (para) =>
//         await FetchSKDApi({ ...para, allStatus: true })
//       }
//       OptionComponent={({ option, ...rest }) => {
//         return <ListItem {...rest}>{option?.name}</ListItem>;
//       }}
//       value={fields?.materialId}
//       onChange={async (changedVal) => {
//         if (changedVal) {
//           try {
//             const materialDetails =
//               await fetchMaterialDetailsById(changedVal._id);
//             const pricePerUnit = materialDetails?.price_per_unit;
//             const quantity = Number(fields?.quantity) || 0;
//             setFields((prevFields) => ({
//               ...prevFields,
//               materialId: changedVal._id,
//               itemCode: materialDetails?.code || "",
//               pricePerUnits: pricePerUnit,
//               amount: pricePerUnit * quantity,
//             }));
//           } catch (error) {
//             console.error(
//               "Error fetching material details:",
//               error
//             );
//           }
//         } else {
//           setFields((prevFields) => ({
//             ...prevFields,
//             materialId: null,
//             itemCode: "",
//             pricePerUnits: 0,
//             amount: 0,
//           }));
//         }
//       }}
//       titleKey={"name"}
//       valueKey={"_id"}
//       InputComponent={(params) => (
//         <StyledSearchBar
//           placeholder={"Select Semi Knocked Down (SKD)*"}
//           {...params}
//           margin="none"
//         />
//       )}
//     />
//   )
// }

// {
//   fields?.materialType == 3 && (
//     <AsyncDropDown
//       disabled={loading || id}
//       defaultVal={
//         fields?.materialIds
//           ? {
//             _id: fields?.materialIds?._id,
//             name: fields?.materialIds?.name,
//           }
//           : null
//       }
//       lazyFun={async (para) =>
//         await FetchSFGApi({ ...para, allStatus: true })
//       }
//       OptionComponent={({ option, ...rest }) => {
//         return <ListItem {...rest}>{option?.name}</ListItem>;
//       }}
//       value={fields?.materialId}
//       onChange={async (changedVal) => {
//         if (changedVal) {
//           try {
//             const materialDetails =
//               await fetchMaterialDetailsById(changedVal._id);
//             const pricePerUnit = materialDetails?.price_per_unit;
//             const quantity = Number(fields?.quantity) || 0;
//             setFields((prevFields) => ({
//               ...prevFields,
//               materialId: changedVal._id,
//               itemCode: materialDetails?.code || "",
//               pricePerUnits: pricePerUnit,
//               amount: pricePerUnit * quantity,
//             }));
//           } catch (error) {
//             console.error(
//               "Error fetching material details:",
//               error
//             );
//           }
//         } else {
//           setFields((prevFields) => ({
//             ...prevFields,
//             materialId: null,
//             itemCode: "",
//             pricePerUnits: 0,
//             amount: 0,
//           }));
//         }
//       }}
//       titleKey={"name"}
//       valueKey={"_id"}
//       InputComponent={(params) => (
//         <StyledSearchBar
//           placeholder={"Select Semi-Finished Goods (SFG)*"}
//           {...params}
//           margin="none"
//         />
//       )}
//     />
//   )
// }

// {
//   fields?.materialType == 4 && (
//     <AsyncDropDown
//       disabled={loading || id}
//       defaultVal={
//         fields?.materialIds
//           ? {
//             _id: fields?.materialIds?._id,
//             name: fields?.materialIds?.name,
//           }
//           : null
//       }
//       lazyFun={async (para) =>
//         await FetchFGApi({ ...para, allStatus: true })
//       }
//       OptionComponent={({ option, ...rest }) => {
//         return <ListItem {...rest}>{option?.name}</ListItem>;
//       }}
//       value={fields?.materialId}
//       onChange={async (changedVal) => {
//         if (changedVal) {
//           try {
//             const materialDetails =
//               await fetchMaterialDetailsById(changedVal._id);
//             const pricePerUnit = materialDetails?.price_per_unit;
//             const quantity = Number(fields?.quantity) || 0;
//             setFields((prevFields) => ({
//               ...prevFields,
//               materialId: changedVal._id,
//               itemCode: materialDetails?.code || "",
//               pricePerUnits: pricePerUnit,
//               amount: pricePerUnit * quantity,
//             }));
//           } catch (error) {
//             console.error(
//               "Error fetching material details:",
//               error
//             );
//           }
//         } else {
//           setFields((prevFields) => ({
//             ...prevFields,
//             materialId: null,
//             itemCode: "",
//             pricePerUnits: 0,
//             amount: 0,
//           }));
//         }
//       }}
//       titleKey={"name"}
//       valueKey={"_id"}
//       InputComponent={(params) => (
//         <StyledSearchBar
//           placeholder={"Select Finished Goods (FG)*"}
//           {...params}
//           margin="none"
//         />
//       )}
//     />
//   )
// }