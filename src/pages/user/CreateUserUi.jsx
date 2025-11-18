import { Autocomplete, Box, CircularProgress, ListItem, Checkbox, FormControlLabel } from "@mui/material"
import { memo } from "react"
import { useSelector } from 'react-redux'
import { USER_ROLES } from "../../utils/constants"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomInput from "../../components/inputs/CustomInputs"
import { findNameByRole, titleCase } from "../../utils/main"
import { fetchInventoryMaster } from "../../apis/inventoryMaster.api"
import { StyledSearchBar } from "../../components/inputs/SearchBar"
import AsyncDropDown from "../../components/inputs/AsyncDropDown"



const CreateUserUi = ({ title, isInstaller, isUpdate, fields, setFields, loading, onSubmit }) => {
    const { user } = useSelector(state => state)

    let allowedRoles = [...Object.keys(USER_ROLES).map((key) => ({ label: titleCase(key), _id: USER_ROLES[key] }))]

    if (user.data.role === USER_ROLES.partner_admin) {
        allowedRoles = []
        Object.keys(USER_ROLES).forEach((key) => {
            if (USER_ROLES[key] !== USER_ROLES.admin)
                allowedRoles.push({ label: titleCase(key), _id: USER_ROLES[key] })
        })
    }


    return <>

        <CustomDialog

            loading={loading}
            err={fields.err}
            onSubmit={onSubmit}
            title={`${isUpdate ? "Update" : "Create"} ${title}`}
            closeText="Close"
            confirmText={`${isUpdate ? "Update" : "Create"}`}
        >

            {loading ? <CenteredBox><CircularProgress /></CenteredBox> :
                <>
                    <CustomInput
                        autoFocus={true}
                        disabled={loading}
                        value={fields.name}
                        onChange={(e) => setFields({ ...fields, err: '', name: e.target.value })}
                        type="text"
                        label={"Name*"}

                    />

                    {!isUpdate && <CustomInput
                        disabled={loading}
                        value={fields.email}
                        onChange={(e) => setFields({ ...fields, err: '', email: e.target.value })}
                        type="text"
                        label={"Email*"}

                    />}
                    {
                        <CustomInput
                            disabled={loading}
                            value={fields.phone}
                            onChange={(e) => setFields({ ...fields, err: '', phone: e.target.value })}
                            type="tel"
                            label={"Phone No*"}

                        />
                    }
                    {!isUpdate &&
                        <Box mt={2}>
                            <CustomInput
                                disabled={loading}
                                value={fields.password}
                                onChange={(e) => setFields({ ...fields, err: '', password: e.target.value })}

                                type="password"
                                label={"Password*"}
                            />
                        </Box>}

                    <Box mt={2}>
                        <Autocomplete
                            disableClearable
                            options={allowedRoles}
                            value={findNameByRole(fields.role)}
                            onChange={(e, newVal) => {
                                setFields({ ...fields, role: newVal ? newVal._id : null, parent_id: null })
                            }}

                            sx={{ width: "100%", display: "flex", "*": { display: "flex", justifyContent: "center" } }}
                            renderInput={(params) => <CustomInput placeholder="Select Role*" {...params} label="Select Role*" margin="dense" />}
                        />
                    </Box>

                    {fields.role !== USER_ROLES.ADMIN && <Box mt={2}>
                        <AsyncDropDown

                            defaultVal={
                                fields?.inventory ? {

                                    _id: fields?.inventory?._id,
                                    name: fields?.inventory?.name,
                                }
                                    : null
                            }
                            lazyFun={async (para) => await fetchInventoryMaster({ ...para, allStatus: true })}
                            OptionComponent={({ option, ...rest }) => {
                                return <ListItem {...rest}>{option?.name}</ListItem >
                            }}
                            value={fields?.inventory}
                            onChange={async (changedVal) => {
                                setFields({ ...fields, inventory: changedVal ? changedVal?._id : null });
                            }}

                            titleKey={'name'}
                            valueKey={"_id"}
                            InputComponent={(params) => <CustomInput placeholder={"Select Inventory*"}
                                {...params} margin="none" InputLabelProps={{ shrink: true }}
                            />}
                        />
                    </Box>}

                    <Box mt={2}>
                        <FormControlLabel
                            control={<Checkbox
                                checked={fields?.isDepartmentHead}
                                onChange={(e) => setFields({ ...fields, err: '', isDepartmentHead: e.target.checked })}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />}
                            label="Department Head"
                        />
                    </Box>
                </>}
        </CustomDialog>
    </>
}
export default memo(CreateUserUi)
