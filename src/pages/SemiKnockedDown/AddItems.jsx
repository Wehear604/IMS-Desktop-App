import { Box, Grid, ListItem, IconButton } from '@mui/material';
import React from 'react'
import CustomInput from '../../components/inputs/CustomInputs';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import { StyledSearchBar } from '../../components/inputs/SearchBar';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchRawMaterialApi } from '../../apis/rawMaterial.api';
import { findObjectKeyByValue } from '../../utils/main';
import { UNITS } from '../../utils/constants';

const AddItems = ({ fields, setFields, loading }) => {
  const handleDeleteItem = (index) => {
    const updatedItems = fields.items.filter((_, inx) => inx !== index);
    setFields({ ...fields, err: "", items: updatedItems });
  };
  return (
    <Box mt={2}>
      {fields?.items?.length > 0 && fields.items.map((val, inx) => {
        if (!fields.items[inx]) return null;
        const Unit = fields.rawMaterials[inx]?.rawMaterialId?.unit ? findObjectKeyByValue(fields.rawMaterials[inx]?.rawMaterialId?.unit, UNITS) : fields.rawMaterials[inx]?.unit
        return (
          <Grid container spacing={2} key={inx}>
            <Grid item xs={12} sm={4}>
              <PaddingBoxInDesktop
                mt={2}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <AsyncDropDown
                  Value={
                    fields.items[inx]?.itemId._id
                      ? {
                        itemId: fields.items[inx]?.itemId._id,
                        rawMaterial_code: fields.items[inx]?.code,
                      }
                      : null
                  }
                  lazyFun={async (para) =>
                    await fetchRawMaterialApi({ ...para, allStatus: true })
                  }
                  OptionComponent={({ option, ...rest }) => (
                    <ListItem {...rest}>{option.rawMaterial_code}</ListItem>
                  )}
                  onChange={async (changedVal) => {
                    const updatedItems = [...fields.items];
                    updatedItems[inx] = {
                      ...updatedItems[inx],
                      itemId: changedVal ? changedVal._id : null,
                      code: changedVal ? changedVal.rawMaterial_code : "",
                      displayName: changedVal ? changedVal.name : "",
                      unit: changedVal ? findObjectKeyByValue(changedVal.unit, UNITS) : "",
                    };
                    setFields({ ...fields, err: "", items: updatedItems });
                  }}
                  titleKey={"rawMaterial_code"}
                  valueKey={"_id"}
                  InputComponent={(params) => (
                    <StyledSearchBar
                      placeholder={"Select Material"}
                      {...params}
                      margin="none"
                    />
                  )}
                />
              </PaddingBoxInDesktop>
            </Grid>

            <Grid item xs={12} sm={5.5}>
              <CustomInput
                disabled={true}
                value={fields?.items[inx]?.displayName || fields?.items[inx]?.itemId?.name}
                onChange={(e) =>
                  setFields({ ...fields, err: '', displayName: e.target.value })
                }
                type="text"
                label={"Raw Material Name"}
                InputLabelProps={{
                  shrink: true,
                }}
                onWheel={(e) => e.target.blur()}
                sx={{
                  "& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                  "& input": {
                    MozAppearance: "textfield",
                  },
                }}
              />
            </Grid>

            {<Grid item xs={12} sm={2}>
              <CustomInput
                disabled={loading}
                value={fields?.items[inx]?.min_of_quantity}
                onChange={(e) => {
                  let value = e.target.value;
                  if (!/^\d*$/.test(value)) return;
                  const updatedValue = Math.max(0, Number(value));

                  const updatedItems = [...fields.items];
                  updatedItems[inx] = {
                    ...updatedItems[inx],
                    min_of_quantity: updatedValue,
                  };
                  setFields({ ...fields, err: "", items: updatedItems });
                }}
                type="number"
                label={Unit || "QTY"}
                onWheel={(e) => e.target.blur()}
                sx={{
                  "& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                  "& input": {
                    MozAppearance: "textfield",
                  },
                }}
              />

            </Grid>}
            <Grid item xs={12} sm={0.5} display={"flex"} justifyContent={"center"} alignItems={"center"}>
              <IconButton
                color="error"
                onClick={() => handleDeleteItem(inx)}
                aria-label="delete"
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>

        );
      })}
    </Box>
  );
};


export default AddItems