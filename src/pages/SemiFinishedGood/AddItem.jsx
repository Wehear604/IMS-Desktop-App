import { Box, Grid, ListItem, IconButton } from '@mui/material';
import React from 'react';
import CustomInput from '../../components/inputs/CustomInputs';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import { StyledSearchBar } from '../../components/inputs/SearchBar';
import DeleteIcon from '@mui/icons-material/Delete';
import { FetchItemApi } from '../../apis/item.api';

const AddItems = ({ fields, setFields, loading }) => {
    const handleDeleteItem = (index) => {
        const updatedItems = fields.items.filter((_, inx) => inx !== index);
        setFields({ ...fields, err: "", items: updatedItems });
    };

    return (
        <Box mt={2}>
            {fields?.items?.length > 0 &&
                fields.items.map((val, inx) => {
                    if (!fields.items[inx]) return null;

                    return (
                        <Grid container spacing={2} key={inx}>
                            <Grid item xs={12} sm={4} md={8}>
                                <PaddingBoxInDesktop
                                    mt={2}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <AsyncDropDown
                                        Value={
                                            fields.items[inx]?.itemId?._id
                                                ? {
                                                    itemId: fields.items[inx]?.itemId._id,
                                                    name: fields.items[inx]?.itemId.name,
                                                }
                                                : null
                                        }
                                        lazyFun={async (para) =>
                                            await FetchItemApi({ ...para, allStatus: true })
                                        }
                                        OptionComponent={({ option, ...rest }) => (
                                            <ListItem {...rest}>{option.name}</ListItem>
                                        )}
                                        onChange={async (changedVal) => {
                                            const updatedItems = [...fields.items];
                                            updatedItems[inx] = {
                                                ...updatedItems[inx],
                                                itemId: changedVal ? changedVal._id : null,
                                                name: changedVal ? changedVal.name : "",
                                                displayName: changedVal ? changedVal.name : "",
                                            };
                                            setFields({ ...fields, err: "", items: updatedItems });
                                        }}
                                        titleKey={"name"}
                                        valueKey={"_id"}
                                        InputComponent={(params) => (
                                            <StyledSearchBar
                                                placeholder={"Select Item"}
                                                {...params}
                                                margin="none"
                                            />
                                        )}
                                    />
                                </PaddingBoxInDesktop>
                            </Grid>
                            <Grid item xs={12} sm={2} md={3.5}>
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
                                    label={"QTY"}
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

                            <Grid
                                item
                                xs={12}
                                sm={0.5}
                                display={"flex"}
                                justifyContent={"center"}
                                alignItems={"center"}
                            >
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

export default AddItems;
