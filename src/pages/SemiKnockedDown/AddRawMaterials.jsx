import { Box, Grid, ListItem, IconButton } from '@mui/material';
import React from 'react';
import CustomInput from '../../components/inputs/CustomInputs';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import { StyledSearchBar } from '../../components/inputs/SearchBar';
import { fetchRawMaterialApi } from '../../apis/rawMaterial.api';
import DeleteIcon from '@mui/icons-material/Delete';
import { findObjectKeyByValue } from '../../utils/main';
import { UNITS } from '../../utils/constants';

const AddRawMaterials = ({ fields, setFields, loading }) => {
    const handleDeleteItem = (index) => {
        const updatedrawMaterials = fields.rawMaterials.filter((_, inx) => inx !== index);
        setFields({ ...fields, err: "", rawMaterials: updatedrawMaterials });
    };

    return (
        <Box mt={2}>
            {fields?.rawMaterials?.length > 0 &&
                fields.rawMaterials.map((val, inx) => {
                    if (!fields.rawMaterials[inx]) return null;
                    const Unit = fields.rawMaterials[inx]?.rawMaterialId?.unit ? findObjectKeyByValue(fields.rawMaterials[inx]?.rawMaterialId?.unit, UNITS) : fields.rawMaterials[inx]?.unit
                    const id = fields.rawMaterials[inx]?.rawMaterialId?._id ? fields.rawMaterials[inx]?.rawMaterialId?._id : fields.rawMaterials[inx]?.rawMaterialId
                    const name = fields.rawMaterials[inx]?.rawMaterialId?.name ? fields.rawMaterials[inx]?.rawMaterialId.name : fields.rawMaterials[inx]?.displayName
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
                                        Value={{
                                                rawMaterialId: id || "",
                                                name: name || ""
                                            }}
                                        lazyFun={async (para) =>
                                            await fetchRawMaterialApi({ ...para, allStatus: true })
                                        }
                                        OptionComponent={({ option, ...rest }) => (
                                            <ListItem {...rest}>{option.name} {`(${option?.mpn})`}</ListItem>
                                        )}
                                        onChange={async (changedVal) => {
                                            const updatedrawMaterials = [...fields.rawMaterials];
                                            updatedrawMaterials[inx] = {
                                                ...updatedrawMaterials[inx],
                                                rawMaterialId: changedVal ? changedVal._id : null,
                                                code: changedVal ? changedVal.rawMaterial_code : "",
                                                displayName: changedVal
                                                    ? `${changedVal?.name ?? ""} (${changedVal?.mpn ?? ""})`.trim()
                                                    : null,
                                                code: "",
                                                unit: changedVal ? findObjectKeyByValue(changedVal.unit, UNITS) : "",

                                            };
                                            setFields({ ...fields, err: "", rawMaterials: updatedrawMaterials });
                                        }}
                                        titleKey={"name"}
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
                                    value={fields?.rawMaterials[inx]?.code}
                                    onChange={(e) =>
                                        setFields({ ...fields, err: '', code: e.target.value })
                                    }
                                    type="text"
                                    label={"Raw Material Code"}
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
                                    value={fields?.rawMaterials[inx]?.min_of_quantity || ''}
                                    onChange={(e) => {
                                        let value = e.target.value;

                                        if (value.includes('-') || !/^\d*$/.test(value)) return;

                                        const updatedValue = Number(value);

                                        const updatedrawMaterials = [...fields.rawMaterials];
                                        updatedrawMaterials[inx] = {
                                            ...updatedrawMaterials[inx],
                                            min_of_quantity: updatedValue,
                                        };
                                        setFields({ ...fields, err: "", rawMaterials: updatedrawMaterials });
                                    }}
                                    type="number"
                                    label={Unit || "QTY"}
                                    inputProps={{
                                        min: 0,
                                        onKeyDown: (e) => {
                                            if (['-', 'e', '+'].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        },
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

                            </Grid>}

                            <Grid
                                item
                                xs={12}
                                sm={0.5}
                                display={"flex"}
                                justifyContent={"center"}
                                alignrawMaterials={"center"}
                            >
                                <IconButton
                                    disabled={fields?.rawMaterials?.length === 1}
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

export default AddRawMaterials;
