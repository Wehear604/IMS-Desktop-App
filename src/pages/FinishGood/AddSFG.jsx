import { Box, Grid, IconButton, ListItem } from '@mui/material';
import React from 'react'
import CustomInput from '../../components/inputs/CustomInputs';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import { StyledSearchBar } from '../../components/inputs/SearchBar';
import DeleteIcon from '@mui/icons-material/Delete';
import { FetchSFGApi } from '../../apis/sfg.api';

const AddSFG = ({ fields, setFields, loading }) => {
    const handleDeleteItem = (index) => {
        const updatedItems = fields.sfg.filter((_, inx) => inx !== index);
        setFields({ ...fields, err: "", sfg: updatedItems });
    };
    return (
        <Box mt={2}>
            {fields?.sfg?.length > 0 && fields.sfg.map((val, inx) => {
                if (!fields.sfg[inx]) return null;

                return (
                    <Grid container spacing={2} key={inx}>
                        <Grid item xs={12} sm={6} md={6}>
                            <PaddingBoxInDesktop
                                mt={2}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <AsyncDropDown
                                    Value={
                                        fields.sfg[inx]?.sfgId?._id
                                            ? {
                                                _id: fields.sfg[inx]?.sfgId?._id,
                                                name: fields.sfg[inx].sfgId?.name,
                                            }
                                            : null
                                    }
                                    lazyFun={async (para) =>
                                        await FetchSFGApi({ ...para, allStatus: true })
                                    }
                                    OptionComponent={({ option, ...rest }) => (
                                        <ListItem {...rest}>{option.name} {`(${option?.mpn})`}</ListItem>
                                    )}
                                    onChange={async (changedVal) => {
                                        const updatedsfg = [...fields.sfg];
                                        updatedsfg[inx] = {
                                            ...updatedsfg[inx],
                                            sfgId: changedVal ? changedVal._id : null,
                                        };
                                        setFields({ ...fields, err: "", sfg: updatedsfg });
                                    }}
                                    titleKey={"name"}
                                    valueKey={"_id"}
                                    InputComponent={(params) => (
                                        <StyledSearchBar
                                            placeholder={"Select sfg"}
                                            {...params}
                                            margin="none"
                                        />
                                    )}
                                />
                            </PaddingBoxInDesktop>
                        </Grid>

                        <Grid item xs={12} sm={5.5} md={5.5}>
                            <CustomInput
                                disabled={loading}
                                value={fields?.sfg[inx]?.min_of_quantity}
                                onChange={(e) => {
                                    let value = e.target.value;

                                    if (value.includes('-') || !/^\d*$/.test(value) || value === '0') return;

                                    const updatedValue = Number(value);

                                    const updatedskd = [...fields.sfg];
                                    updatedskd[inx] = {
                                        ...updatedskd[inx],
                                        min_of_quantity: updatedValue,
                                    };

                                    setFields({ ...fields, err: "", sfg: updatedskd });
                                }}
                                type="number"
                                label={"Required Quantity*"}
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
                        </Grid>

                        <Grid item xs={12} sm={0.5} md={0.5} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                            <IconButton
                                disabled={fields?.sfg?.length === 1}
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


export default AddSFG