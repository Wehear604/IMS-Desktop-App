import { Box, Checkbox, FormControl, Grid, IconButton, InputLabel, ListItem, MenuItem, Select } from '@mui/material';
import React from 'react'
import CustomInput from '../../components/inputs/CustomInputs';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import { StyledSearchBar } from '../../components/inputs/SearchBar';
import DeleteIcon from '@mui/icons-material/Delete';
import { FetchSFGApi } from '../../apis/sfg.api';
import { VENDOR_PRIORITY } from '../../utils/constants';
import { titleCase } from '../../utils/main';

const AddSFG = ({ fields, setFields, loading, CheckBox }) => {
    const handleDeleteItem = (index) => {
        const updatedItems = fields.sfgs.filter((_, inx) => inx !== index);
        setFields({ ...fields, err: "", sfgs: updatedItems });
    };

    const handleChange = (index) => {
        setFields((prevFields) => {
            const updatedSFG = [...prevFields.sfgs];
            updatedSFG[index] = {
                ...updatedSFG[index],
                link: "",
                IsLinkActive: updatedSFG[index]?.IsLinkActive ? false : true
            };
            return { ...prevFields, sfgs: updatedSFG };
        });
    };

    return (
        <Box>
            {fields?.sfgs?.map((val, inx) => {
                if (!fields.sfgs[inx]) return null;

                return (
                    <Box mt={3} display={'flex'} width={'100%'} key={val.id} gap={2}>
                        {CheckBox.type === "SFG" && CheckBox.IsActive && <Checkbox
                            onChange={() => handleChange(inx)}
                            inputProps={{ 'aria-label': 'controlled' }}
                        />}
                        <Box
                            sx={{
                                display: 'flex',
                                flex: 1,
                                justifyContent: 'flex-end',
                                width: '65%',
                                mt: 2
                            }}
                        >
                            <AsyncDropDown
                                Value={
                                    fields.sfgs[inx]?.sfgId?._id
                                        ? {
                                            _id: fields.sfgs[inx]?.sfgId?._id,
                                            name: fields.sfgs[inx].sfgId?.name,
                                        }
                                        : null
                                }
                                lazyFun={async (para) =>
                                    await FetchSFGApi({ ...para, allStatus: true })
                                }
                                OptionComponent={({ option, ...rest }) => (
                                    <ListItem {...rest}>{option.name} {`(${option.mpn})`}</ListItem>
                                )}
                                onChange={async (changedVal) => {
                                    const updatedsfg = [...fields.sfgs];
                                    updatedsfg[inx] = {
                                        ...updatedsfg[inx],
                                        sfgId: changedVal ? changedVal._id : null,
                                    };
                                    setFields({ ...fields, err: "", sfgs: updatedsfg });
                                }}
                                titleKey={"name"}
                                valueKey={"_id"}
                                InputComponent={(params) => (
                                    <StyledSearchBar
                                        placeholder={"Select SFG"}
                                        {...params}
                                        margin="none"
                                    />
                                )}
                            />

                        </Box>

                        <Box sx={{ width: '15%' }}>
                            <CustomInput
                                disabled={loading}
                                value={val.min_of_quantity}
                                onChange={(e) => {
                                    const updatedsfg = [...fields.sfgs];
                                    updatedsfg[inx] = {
                                        ...updatedsfg[inx],
                                        min_of_quantity: e.target.value,
                                    };
                                    setFields({ ...fields, err: '', sfgs: updatedsfg });
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
                                    const updatedsfg = [...fields.sfgs];
                                    updatedsfg[inx] = {
                                        ...updatedsfg[inx],
                                        lead_time: e.target.value,
                                    };
                                    setFields({ ...fields, err: '', sfgs: updatedsfg });
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
                                        const updatedsfg = [...fields.sfgs];
                                        updatedsfg[inx] = {
                                            ...updatedsfg[inx],
                                            priority: e.target.value,
                                        };
                                        setFields({ ...fields, err: '', sfgs: updatedsfg })
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
                                    const updatedsfg = [...fields.sfgs];
                                    updatedsfg[inx] = {
                                        ...updatedsfg[inx],
                                        link: e.target.value,
                                    };
                                    setFields({ ...fields, err: '', sfgs: updatedsfg });
                                }}
                                type="text"
                                label={'Link'}
                            />
                        </Box>}
                        <IconButton
                            color="error"
                            onClick={() => handleDeleteItem(inx)}
                            aria-label="delete"
                            disabled={fields?.sfgs.length === 1}
                        >
                            <DeleteIcon fontSize="medium" />
                        </IconButton>
                    </Box>
                );
            })}
        </Box>
    );
};


export default AddSFG