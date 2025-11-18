import { Box, Checkbox, FormControl, Grid, IconButton, InputLabel, ListItem, MenuItem, Select } from '@mui/material';
import React from 'react'
import CustomInput from '../../components/inputs/CustomInputs';
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import { StyledSearchBar } from '../../components/inputs/SearchBar';
import DeleteIcon from '@mui/icons-material/Delete';
import { FetchSKDApi } from '../../apis/skd.api';
import { VENDOR_PRIORITY } from '../../utils/constants';
import { titleCase } from '../../utils/main';
const AddSKD = ({ fields, setFields, loading, CheckBox }) => {
    const handleDeleteItem = (index) => {
        const updatedItems = fields.skds.filter((_, inx) => inx !== index);
        setFields({ ...fields, err: "", skds: updatedItems });
    };

    const handleChange = (index) => {
        setFields((prevFields) => {
            const updatedskds = [...prevFields.skds];
            updatedskds[index] = {
                ...updatedskds[index],
                link: "",
                IsLinkActive: updatedskds[index]?.IsLinkActive ? false : true
            };
            return { ...prevFields, skds: updatedskds };
        });
    };
    return (
        <Box mt={2}>
            {fields?.skds?.length > 0 && fields.skds.map((val, inx) => {
                if (!fields.skds[inx]) return null;

                return (<Box mt={3} display={'flex'} width={'100%'} key={val.id} gap={2}>
                    {CheckBox.type === "SKD" && CheckBox.IsActive && <Checkbox
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
                                fields.skds[inx]?.skdId?._id && fields.skds[inx].skdId?.name
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

                    </Box>

                    <Box sx={{ width: '15%' }}>
                        <CustomInput
                            disabled={loading}
                            value={val.min_of_quantity}
                            onChange={(e) => {
                                const updatedskds = [...fields.skds];
                                updatedskds[inx] = {
                                    ...updatedskds[inx],
                                    min_of_quantity: e.target.value,
                                };
                                setFields({ ...fields, err: '', skds: updatedskds });
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
                                const updatedskds = [...fields.skds];
                                updatedskds[inx] = {
                                    ...updatedskds[inx],
                                    lead_time: e.target.value,
                                };
                                setFields({ ...fields, err: '', skds: updatedskds });
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
                                    const updatedskds = [...fields.skds];
                                    updatedskds[inx] = {
                                        ...updatedskds[inx],
                                        priority: e.target.value,
                                    };
                                    setFields({ ...fields, err: '', skds: updatedskds })
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
                                const updatedskds = [...fields.rawMaterials];
                                updatedskds[inx] = {
                                    ...updatedskds[inx],
                                    link: e.target.value,
                                };
                                setFields({ ...fields, err: '', skds: updatedskds });
                            }}
                            type="text"
                            label={'Link'}
                        />
                    </Box>}

                    <IconButton
                        color="error"
                        onClick={() => handleDeleteItem(inx)}
                        aria-label="delete"
                        disabled={fields?.skds.length === 1}
                    >
                        <DeleteIcon fontSize="medium" />
                    </IconButton>
                </Box>
                );
            })}
        </Box>

    );
};


export default AddSKD