import { Box, Grid, IconButton, ListItem } from '@mui/material';
import React from 'react'
import CustomInput from '../../components/inputs/CustomInputs';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import { StyledSearchBar } from '../../components/inputs/SearchBar';
import DeleteIcon from '@mui/icons-material/Delete';
import { FetchSKDApi } from '../../apis/skd.api';

const AddSKD = ({ fields, setFields, loading }) => {
    const handleDeleteItem = (index) => {
        const updatedItems = fields.skds.filter((_, inx) => inx !== index);
        setFields({ ...fields, err: "", skds: updatedItems });
    };
    return (
        <Box mt={2}>
            {fields?.skds?.length > 0 && fields.skds.map((val, inx) => {
                if (!fields.skds[inx]) return null;

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
                                        fields.skds[inx]?.skdId?._id
                                            ? {
                                                _id: fields.skds[inx]?.skdId?._id,
                                                name: fields.skds[inx].skdId?.name,
                                            }
                                            : null
                                    }
                                    lazyFun={async (para) =>
                                        await FetchSKDApi({ ...para, allStatus: true })
                                    }
                                    OptionComponent={({ option, ...rest }) => (
                                        <ListItem {...rest}>{option.name}</ListItem>
                                    )}
                                    onChange={async (changedVal) => {
                                        const updatedskd = [...fields.skds];
                                        updatedskd[inx] = {
                                            ...updatedskd[inx],
                                            skdId: changedVal ? changedVal._id : null,
                                        };
                                        setFields({ ...fields, err: "", skds: updatedskd });
                                    }}
                                    titleKey={"name"}
                                    valueKey={"_id"}
                                    InputComponent={(params) => (
                                        <StyledSearchBar
                                            placeholder={"Select SKD"}
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
                                value={fields?.skds[inx]?.min_of_quantity || ''}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (!/^\d*$/.test(value)) return;
                                    const updatedValue = Math.max(0, Number(value));

                                    const updatedskd = [...fields.skds];
                                    updatedskd[inx] = {
                                        ...updatedskd[inx],
                                        min_of_quantity: updatedValue,
                                    };

                                    setFields({ ...fields, err: "", skds: updatedskd });
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
                                disabled={fields?.skds?.length === 1}
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


export default AddSKD