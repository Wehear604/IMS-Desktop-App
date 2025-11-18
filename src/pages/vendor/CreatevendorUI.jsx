import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { memo, useState } from "react";
import CustomInput from "../../components/inputs/CustomInputs";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { CenteredBox } from "../../components/layouts/OneViewBox";
import AddMaterialUi from "./AddMaterialUi";
import COUNTRY_CODES from "../../utils/country";
import { VENDOR_PRIORITY } from "../../utils/constants";
import { titleCase } from "../../utils/main";
import AddSKD from "./AddSKD";
import AddSFG from "./AddSFG";
import AddIcon from '@mui/icons-material/Add';

function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

const CreatevendorUI = ({
  title,
  modalKey,
  isUpdate,
  fields,
  setFields,
  loading,
  onSubmit,
  index,
}) => {

  const [CheckBox, SetCheckBox] = useState({
    type: "",
    IsActive: false
  })

  const SelectLinkField = () => {

  }

  return (
    <>
      <CustomDialog
        id={`${isUpdate ? "vendorupdate" : modalKey}`}
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
              label={"Vendor Name*"}
            />
            <CustomInput
              disabled={loading}
              value={fields.address}
              onChange={(e) =>
                setFields({ ...fields, err: "", address: e.target.value })
              }
              type="text"
              label={"Address*"}
            />

            <CustomInput
              disabled={loading}
              value={fields.email}
              onChange={(e) =>
                setFields({ ...fields, err: "", email: e.target.value })
              }
              type="text"
              label={"Email"}
            />

            <CustomInput
              disabled={loading}
              value={fields.phone}
              onChange={(e) =>
                setFields({ ...fields, err: "", phone: e.target.value })
              }
              type="text"
              label={"Phone*"}
            />

            <Autocomplete
              id="country-select-demo"
              sx={{ width: "100%", mt: 2 }}
              options={COUNTRY_CODES}
              autoHighlight
              getOptionLabel={(option) => option.name}
              value={fields.country ? { name: fields.country } : null}
              onChange={(event, newValue) => {
                setFields({
                  ...fields,
                  err: "",
                  country: newValue?.name || "",
                });
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box key={key} component="li" {...optionProps}>
                    {option.name}
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Country*"
                  slotProps={{
                    htmlInput: {
                      ...params.inputProps,
                      autoComplete: "new-password",
                    },
                  }}
                />
              )}
            />

            {fields.country === "India" && (
              <Box mt={2}>
                <CustomInput
                  disabled={loading}
                  value={decodeHtml(fields?.gst_no || "")}
                  onChange={(e) =>
                    setFields({ ...fields, err: "", gst_no: e.target.value })
                  }
                  type="text"
                  label={"GST Number*"}
                />
              </Box>
            )}

            <Box mt={1} sx={{ display: "flex", width: "100%", height: "auto", border: "1px solid", flexDirection: "column", p: 2, borderRadius: "5px" }}>

              <Box sx={{ display: "flex", width: "100%", flexDirection: "row" }}>
                <Box mt={2} width={"100%"} display={"flex"} justifyContent={"flex-start"} alignItems={"center"}>
                  <Typography >SFG</Typography>
                </Box>
                <Box width={"100%"} display={"flex"} justifyContent={"flex-end"} alignItems={"center"}>
                  <Button variant={CheckBox.type === "SFG" ? "contained" : "outlined"} onClick={() => SetCheckBox({
                    type: CheckBox.type === "SFG" ? "" : "SFG",
                    IsActive: CheckBox.type === "SFG" ? false : true
                  })}><Typography >Select Link Field</Typography></Button>
                </Box>
              </Box>

              {<Box >
                  <AddSFG CheckBox={CheckBox} fields={fields} setFields={setFields} />
              </Box>}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>

                <IconButton sx={{ width: "9%" }} disabled={loading} size="inherit" onClick={() => {
                  setFields((data) => {
                    let arr = [...data?.sfgs];
                    arr.push({
                      sfgId: "",
                      min_of_quantity: null,
                      lead_time: null,
                      priority: null,
                    });
                    return { ...data, sfgs: arr };
                  });
                }}>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "60%", borderRadius: "50%", border: "2px solid" }}>
                    <AddIcon sx={{ width: "100%", height: "4vh" }} />
                  </Box>
                </IconButton>
              </Box>
            </Box>
            <Box mt={1} sx={{ display: "flex", width: "100%", height: "auto", border: "1px solid", flexDirection: "column", p: 2, borderRadius: "5px" }}>
              <Box sx={{ display: "flex", width: "100%", flexDirection: "row" }}>
                <Box width={"100%"} display={"flex"} justifyContent={"flex-start"} alignItems={"center"}>
                  <Typography >SKD</Typography>
                </Box>
                <Box width={"100%"} display={"flex"} justifyContent={"flex-end"} alignItems={"center"}>
                  <Button variant={CheckBox.type === "SKD" ? "contained" : "outlined"} onClick={() => SetCheckBox({
                    type: CheckBox.type === "SKD" ? "" : "SKD",
                    IsActive: CheckBox.type === "SKD" ? false : true
                  })}><Typography >Select Link Field</Typography></Button>
                </Box>
              </Box>
              {<Box >
                  <AddSKD CheckBox={CheckBox} fields={fields} setFields={setFields} />
              </Box>}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>

                <IconButton sx={{ width: "9%" }} disabled={loading} size="inherit" onClick={() => {
                  setFields((data) => {
                    let arr = [...data?.skds];
                    arr.push({
                      skdId: null,
                      min_of_quantity: null,
                      lead_time: null,
                      priority: null,
                    });
                    return { ...data, skds: arr };
                  });
                }}>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "60%", borderRadius: "50%", border: "2px solid" }}>
                    <AddIcon sx={{ width: "100%", height: "4vh" }} />
                  </Box>
                </IconButton>
              </Box>
            </Box>

            <Box mt={1} mb={2} sx={{ display: "flex", width: "100%", height: "auto", border: "1px solid", flexDirection: "column", p: 2, borderRadius: "5px" }}>
              <Box sx={{ display: "flex", width: "100%", flexDirection: "row" }}>
                <Box width={"100%"} display={"flex"} justifyContent={"flex-start"} alignItems={"center"}>
                  <Typography >Raw Materials</Typography>
                </Box>
                <Box width={"100%"} display={"flex"} justifyContent={"flex-end"} alignItems={"center"}>
                  <Button variant={CheckBox.type === "Raw_Materials" ? "contained" : "outlined"} onClick={() => SetCheckBox({
                    type: CheckBox.type === "Raw_Materials" ? "" : "Raw_Materials",
                    IsActive: CheckBox.type === "Raw_Materials" ? false : true
                  })}><Typography >Select Link Field</Typography></Button>
                </Box>
              </Box>
              {<Box >
                  <AddMaterialUi CheckBox={CheckBox} fields={fields} setFields={setFields} />
              </Box>}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>

                <IconButton sx={{ width: "9%" }} disabled={loading} size="inherit" onClick={() => {
                  setFields((data) => {
                    let arr = [...data?.rawMaterials];
                    arr.push({
                      rawMaterialId: { _id: null, name: "" },
                      min_of_quantity: null,
                      lead_time: null,
                      priority: null,
                    });
                    return { ...data, rawMaterials: arr };
                  });
                }}>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "60%", borderRadius: "50%", border: "2px solid" }}>
                    <AddIcon sx={{ width: "100%", height: "4vh" }} />
                  </Box>
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </CustomDialog>
    </>
  );
};

export default memo(CreatevendorUI);