import React from 'react'
import CustomDialog from '../../components/layouts/common/CustomDialog'
import { CenteredBox } from '../../components/layouts/OneViewBox'
import { Box, CircularProgress, FormControl, InputLabel, ListItem, MenuItem, Select } from '@mui/material'
import CustomInput from '../../components/inputs/CustomInputs'
import AsyncDropDown from '../../components/inputs/AsyncDropDown'
import { fetchitemTypeApi } from '../../apis/itemType.api'
import { StyledSearchBar } from '../../components/inputs/SearchBar'
import { fetchHrmsUsers } from '../../apis/item.api'
import { ITEM_STATUS, USER_ROLES } from '../../utils/constants'
import { useSelector } from 'react-redux'

const CreateItemUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal, handleAreaModalClose }) => {
    const { user } = useSelector(state => state)
    return (
        <>
            {!isModal &&
                <CustomDialog
                    id={`${isUpdate ? "edit" : "item"}`}
                    loading={loading}
                    err={fields?.err}
                    onSubmit={onSubmit}
                    title={`${isUpdate ? "Update" : "Create"} ${title}`}
                    closeText="Close"
                    confirmText={`${isUpdate ? (fields.status == ITEM_STATUS.ASSIGNED ? "Take Return" : "Assign") : "Create"}`}
                >
                    {loading ? <CenteredBox><CircularProgress /></CenteredBox> :
                        <>
                            {<CustomInput
                                autoFocus={true}
                                disabled={loading}
                                value={fields?.name}
                                onChange={(e) => setFields({ ...fields, err: '', name: e.target.value })}
                                type="text"
                                label={"Item Name*"}

                            />}

                            <Box mt={2}>
                                <AsyncDropDown

                                    defaultVal={
                                        fields?.itemType ? {

                                            _id: fields?.itemType?._id,
                                            name: fields?.itemType?.name,
                                        }
                                            : null
                                    }
                                    lazyFun={async (para) => await fetchitemTypeApi({ ...para, allStatus: true })}
                                    OptionComponent={({ option, ...rest }) => {
                                        return <ListItem {...rest}>{option?.name}</ListItem >
                                    }}
                                    onChange={async (changedVal) => {
                                        setFields({ ...fields, itemType: changedVal ? [changedVal?._id] : null });
                                    }}

                                    titleKey={'name'}
                                    valueKey={"_id"}
                                    InputComponent={(params) => <StyledSearchBar placeholder={"Select Item Type*"} {...params} margin="none" />}
                                />
                            </Box>
                            {isUpdate && <Box mt={2}>
                                <AsyncDropDown
                                    disabled={fields.status == ITEM_STATUS.ASSIGNED}
                                    Value={
                                        fields?.userName && fields?.user ? {

                                            _id: fields?.user,
                                            first_name: fields?.userName,
                                        }
                                            : null
                                    }
                                    lazyFun={async (para) => await fetchHrmsUsers({ ...para, allStatus: true, searchable: ["first_name", "last_name"] })}
                                    OptionComponent={({ option, ...rest }) => {
                                        return <ListItem {...rest}>{option?.first_name} {option?.last_name}</ListItem >
                                    }}
                                    onChange={async (changedVal) => {
                                        setFields({
                                            ...fields,
                                            user: changedVal?._id || null,
                                            userName: changedVal ? `${changedVal.first_name || ''}  ${changedVal.last_name || ''}` : null,
                                        });
                                    }}
                                    titleKey={'first_name'}
                                    valueKey={"_id"}
                                    InputComponent={(params) => <StyledSearchBar placeholder={"Select User*"} {...params} margin="none" />}
                                />
                            </Box>}
                            {fields.status == ITEM_STATUS.ASSIGNED && isUpdate&&
                                <CustomInput
                                    disabled={loading}
                                    value={fields?.remarks}
                                    onChange={(e) => setFields({ ...fields, err: '', remarks: e.target.value })}
                                    type="text"
                                    label={"Remarks"}
                                />}

                            {/* {isUpdate && <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel >Status</InputLabel>
                                <Select
                                    value={fields.status}
                                    label="Status"
                                    onChange={(e) => setFields({ ...fields, err: "", status: e.target.value })}
                                    disabled={loading}
                                >
                                    <MenuItem value={ITEM_STATUS.ASSIGNED}>Assigned</MenuItem>
                                    <MenuItem value={ITEM_STATUS.AVAILABLE}>Available</MenuItem>
                                </Select>
                            </FormControl>} */}
                        </>
                    }
                </CustomDialog>
            }
        </>
    )
}

export default CreateItemUi