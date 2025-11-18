import {
  Box,
  Button,
  Checkbox,
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Slide,
  Typography,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CustomInput from "../../components/inputs/CustomInputs";

import SubmitButton from "../../components/button/SubmitButton";
import { APP_TYPES } from "../../utils/constants";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import FileInput from "../../components/layouts/upload/FileInput";
import CustomDialog from "../../components/layouts/common/CustomDialog";

const AddVersionUI = ({
  loading,
  onSubmit,
  fields,
  setFields,
}) => {
  return (
    <CustomDialog
      title="Add Version"
      id={"version"}
      closeText="Close"
      onSubmit={onSubmit}
      submitText="Add"
      loading={loading}
      err={fields.err}

    >
      <Box
        // onSubmit={onSubmit}
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          position: "relative",
        }}
        maxHeight="100%"
      >

        {!loading && (
          <>
            <Box sx={{ display: "flex", width: "100%" }}>
              <CustomInput
                disabled={loading}
                value={fields.name}
                onChange={(e) => setFields({ ...fields, name: e.target.value })}
                type="text"
                label="Version Name"
              />
            </Box>
            <Box sx={{ display: "flex", width: "100%" }}>
              <CustomInput
                disabled={loading}
                value={fields.main_version}
                onChange={(e) => setFields({ ...fields, main_version: e.target.value })}
                type="number"
                label="Main Version"
              />
            </Box>
            <Box sx={{ display: "flex", width: "100%" }}>
              <CustomInput
                disabled={loading}
                value={fields.sub_version}
                onChange={(e) => setFields({ ...fields, sub_version: e.target.value })}
                type="number"
                label="Sub Version"
              />
            </Box>



            <Box>
              <FormControl fullWidth margin="dense">
                <InputLabel>App Type*</InputLabel>
                <Select
                  label={"App Type*"}
                  name="app_type"
                  value={fields.app_type || ""}
                  onChange={(e) =>
                    setFields({
                      ...fields,
                      err: "",
                      app_type: e.target.value,
                    })
                  }

                // sx={{ backgroundColor: "background.paper" }}
                >
                  <MenuItem value={APP_TYPES.WEB}>Web</MenuItem>
                  <MenuItem value={APP_TYPES.APP}>APP</MenuItem>
                </Select>
              </FormControl>


              <CKEditor
                config={{
                  placeholder: "Write Version Description...",
                  style: { height: "500px", minHeight: "500px" },
                  toolbar: { items: ['p', 'heading', 'italic', 'bold', 'blockquote', 'link', 'table', 'undo', 'redo', 'numberedList', 'bulletedList'] }

                }}
                name="description"
                id="description"

                disabled={loading}
                editor={ClassicEditor}

                onInit={(editor) => {


                }}
                data={fields.description}
                onReady={(editor) => {

                  editor.editing.view.change((writer) => {
                    writer.setStyle(
                      "height",
                      "200px",
                      editor.editing.view.document.getRoot()
                    );
                  });
                }}
                onChange={(event, editor) => {
                  const data = editor.getData()
                  setFields({ ...fields, err: '', description: data })
                }}
                onBlur={(event, editor) => { }}
                onFocus={(event, editor) => { }}
              />
            </Box>

          </>
        )}

        {/* <DialogActions>
          <Box sx={{ float: "right", marginTop: "7px" }}>
            <SubmitButton
              loading={loading}
              type="submit"
              variant="contained"
              color="primary"
              title="Add"
            >

            </SubmitButton>
          </Box>
        </DialogActions> */}
      </Box>
    </CustomDialog>
  );
};

export default AddVersionUI;
