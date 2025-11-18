import { Autocomplete, Box, Checkbox, FormControl, IconButton, InputLabel, ListItem, MenuItem, Select } from '@mui/material';
import React from 'react';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import CustomInput from '../../components/inputs/CustomInputs';
import { fetchRawMaterialApi } from '../../apis/rawMaterial.api';
import { DAY_WEEK_MONTH, VENDOR_PRIORITY } from '../../utils/constants';
import { findNameByRole, titleCase } from '../../utils/main';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';

const AddMaterialUi = ({ fields, setFields, index, loading, CheckBox }) => {

  const handleDeleteItem = (index) => {
    const updatedItems = fields.rawMaterials.filter((_, inx) => inx !== index);
    setFields({ ...fields, err: '', rawMaterials: updatedItems });
  };

  const handleChange = (index) => {
    setFields((prevFields) => {
      const updatedRawMaterials = [...prevFields.rawMaterials];
      updatedRawMaterials[index] = {
        ...updatedRawMaterials[index],
        link: "",
        IsLinkActive: updatedRawMaterials[index]?.IsLinkActive ? false : true
      };
      return { ...prevFields, rawMaterials: updatedRawMaterials };
    });
  };

  return (
    <Box>
      {fields?.rawMaterials?.map((val, inx) => {
        if (!fields.rawMaterials[inx]) return null;

        // Ensure stable id
        if (!val.id) {
          val.id = uuidv4();
        }

        return (
          <Box mt={3} display={'flex'} width={'100%'} key={val.id} gap={2}>
            {CheckBox.type === "Raw_Materials" && CheckBox.IsActive && <Checkbox
              onChange={() => handleChange(inx)}
              inputProps={{ 'aria-label': 'controlled' }}
            />}
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                justifyContent: 'flex-end',
                width: '65%',
              }}
            >
              <AsyncDropDown
                disableClearable
                defaultVal={
                  fields.rawMaterials
                    ? {
                      _id: val.rawMaterialId?._id,
                      name: val.rawMaterialId?.name,
                    }
                    : []
                }
                lazyFun={async (para) =>
                  await fetchRawMaterialApi({ ...para, allStatus: true })
                }
                OptionComponent={({ option, ...rest }) => (
                  <ListItem {...rest}>{option.name} {`(${option.mpn})`}</ListItem>
                )}
                onChange={(changedVal) => {
                  const updatedRawMaterials = [...fields.rawMaterials];
                  updatedRawMaterials[inx] = {
                    ...updatedRawMaterials[inx],
                    rawMaterialId: changedVal ? { _id: changedVal._id, name: changedVal.name } : null,
                  };
                  setFields({ ...fields, rawMaterials: updatedRawMaterials });
                }}
                titleKey={'name'}
                valueKey={'_id'}
                InputComponent={(params) => (
                  <CustomInput
                    {...params}
                    placeholder={'Select Material'}
                    label="Select Material"
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Box>

            <Box sx={{ width: '15%' }}>
              <CustomInput
                disabled={loading}
                value={val.min_of_quantity}
                onChange={(e) => {
                  const updatedRawMaterials = [...fields.rawMaterials];
                  updatedRawMaterials[inx] = {
                    ...updatedRawMaterials[inx],
                    min_of_quantity: e.target.value,
                  };
                  setFields({ ...fields, err: '', rawMaterials: updatedRawMaterials });
                }}
                type="text"
                label={'MOQ*'}
              />
            </Box>

            <Box sx={{ width: '17%' }}>
              <CustomInput
                disabled={loading}
                value={val.lead_time}
                onChange={(e) => {
                  const updatedRawMaterials = [...fields.rawMaterials];
                  updatedRawMaterials[inx] = {
                    ...updatedRawMaterials[inx],
                    lead_time: e.target.value,
                  };
                  setFields({ ...fields, err: '', rawMaterials: updatedRawMaterials });
                }}
                type="text"
                label={'Lead Time*'}
              />
            </Box>
            <Box sx={{ width: '15%' }}>
              <FormControl fullWidth sx={{ mt: 2 }} >
                <InputLabel >Priority</InputLabel>
                <Select
                  value={val.priority}
                  label="Priority*"
                  onChange={(e) => {
                    const updatedRawMaterials = [...fields.rawMaterials];
                    updatedRawMaterials[inx] = {
                      ...updatedRawMaterials[inx],
                      priority: e.target.value,
                    };
                    setFields({ ...fields, err: '', rawMaterials: updatedRawMaterials })
                  }}

                >
                  {Object.keys(VENDOR_PRIORITY).map((key) => (
                    <MenuItem key={key} value={VENDOR_PRIORITY[key]}>{titleCase(key)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {(val?.IsLinkActive || val?.link) && <Box sx={{ width: '15%' }}>
              <CustomInput
                disabled={loading}
                value={val?.link}
                onChange={(e) => {
                  const updatedRawMaterials = [...fields.rawMaterials];
                  updatedRawMaterials[inx] = {
                    ...updatedRawMaterials[inx],
                    link: e.target.value,
                  };
                  setFields({ ...fields, err: '', rawMaterials: updatedRawMaterials });
                }}
                type="text"
                label={'Link'}
              />
            </Box>}

            <IconButton
              color="error"
              onClick={() => handleDeleteItem(inx)}
              aria-label="delete"
              disabled={fields?.rawMaterials.length === 1}
            >
              <DeleteIcon fontSize="medium" />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
};

export default AddMaterialUi;
