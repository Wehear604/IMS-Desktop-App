import { Autocomplete, Box, CircularProgress, ListItem } from "@mui/material"
import { memo } from "react"
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { LOG_TYPE } from "../../utils/constants"
import { StyledSearchBar } from "../../components/inputs/SearchBar"
import AsyncDropDown from "../../components/inputs/AsyncDropDown"
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop"
import { fetchProductApi } from "../../apis/product.api";
import { fetchRawMaterialApi } from "../../apis/rawMaterial.api";
import { fetchvendorApi } from "../../apis/vendor.api";
import { fetchDepartments } from "../../apis/department.api";

const InOutRawMaterialStockCreateUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal, index, handleAreaModalClose }) => {

    return <>

        <CustomDialog
            id={`${isUpdate ? "productupdate" : "rawMaterial"}`}
            loading={loading}
            err={fields?.err}
            onSubmit={onSubmit}
            title={`${isUpdate ? "Update" : "Create"} ${title}`}
            closeText="Close"
            confirmText={`${isUpdate ? "Update" : "Create"}`}
        >
            {loading ? <CenteredBox><CircularProgress /></CenteredBox> :
                <>
                    {<Autocomplete
                        disabled={loading}
                        options={[
                            { label: 'Inbound Lead', value: LOG_TYPE.inLog },
                            { label: 'Outbound Lead', value: LOG_TYPE.outLog }
                        ]}
                        getOptionLabel={(option) => option.label}
                        value={
                            fields.logType !== undefined
                                ? [
                                    { label: 'Inbound Lead', value: LOG_TYPE.inLog },
                                    { label: 'Outbound Lead', value: LOG_TYPE.outLog }
                                ].find((option) => option.value === fields.logType) || null
                                : null
                        }
                        onChange={(e, newValue) => {
                            setFields({ ...fields, logType: newValue?.value || '' });
                        }}
                        renderInput={(params) => (
                            <CustomInput
                                {...params}
                                label="Type of Lead"
                                placeholder="Select Type of Lead"
                                sx={{ height: '56px' }}
                            />
                        )}
                    />}




                    {<CustomInput
                        disabled={loading}
                        value={fields?.item_code}
                        onChange={(e) => setFields({ ...fields, err: '', item_code: e.target.value })}
                        type="text"
                        label={"Product Code*"}
                    />}
                    {<CustomInput
                        disabled={loading}
                        value={fields.quantity}
                        onChange={(e) => setFields({ ...fields, err: '', quantity: e.target.value })}
                        type="text"
                        label={"Quantity"}
                        sx={{ height: '56px' }}
                    />}
                    {<PaddingBoxInDesktop mb={2} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                        <AsyncDropDown
                            defaultVal={
                                fields.product_id
                                    ? {

                                        _id: fields.product_id?._id,
                                        name: fields.product?.product_name,
                                    }
                                    : null
                            }
                            lazyFun={async (para) => await fetchProductApi({ ...para, allStatus: true })}

                            OptionComponent={({ option, ...rest }) => {
                                return <ListItem {...rest}>{option.product_name}</ListItem >
                            }}
                            value={fields?.product_id}
                            onChange={async (changedVal) => {
                                setFields({ ...fields, product_id: changedVal ? changedVal._id : null });
                            }}

                            titleKey={'product_name'}
                            valueKey={"_id"}
                            InputComponent={(params) => <StyledSearchBar placeholder={"Select Product*"} {...params} margin="none" />}
                        />
                    </PaddingBoxInDesktop>}

                    {<PaddingBoxInDesktop mb={2} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                        <AsyncDropDown
                            defaultVal={
                                fields.rawMaterialId
                                    ? {

                                        _id: fields.rawMaterialId?._id,
                                        name: fields.rawMaterialId?.name,
                                    }
                                    : null
                            }
                            lazyFun={async (para) => await fetchRawMaterialApi({ ...para, allStatus: true })}

                            OptionComponent={({ option, ...rest }) => {
                                return <ListItem {...rest}>{option.name}</ListItem >
                            }}
                            value={fields?.rawMaterialId}
                            onChange={async (changedVal) => {
                                setFields({ ...fields, rawMaterialId: changedVal ? changedVal._id : null });
                            }}

                            titleKey={'name'}
                            valueKey={"_id"}
                            InputComponent={(params) => <StyledSearchBar placeholder={"Select Raw Material*"} {...params} margin="none" />}
                        />
                    </PaddingBoxInDesktop>}

                    {<PaddingBoxInDesktop mb={2} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                        <AsyncDropDown
                            defaultVal={
                                fields.departmentId ? {

                                    _id: fields.departmentId._id,
                                    name: fields.departmentId.name,
                                }
                                    : null
                            }
                            lazyFun={async (para) => await fetchDepartments({ ...para, allStatus: true })}
                            OptionComponent={({ option, ...rest }) => {
                                return <ListItem {...rest}>{option.name}</ListItem >
                            }}
                            value={fields?.departmentId}
                            onChange={async (changedVal) => {
                                setFields({ ...fields, departmentId: changedVal ? changedVal._id : null });
                            }}

                            titleKey={'name'}
                            valueKey={"_id"}
                            InputComponent={(params) => <StyledSearchBar placeholder={"Select Department*"} {...params} margin="none" />}
                        />
                    </PaddingBoxInDesktop>}

                    {<PaddingBoxInDesktop mb={2} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                        <AsyncDropDown
                            defaultVal={
                                fields.vendor
                                    ? {

                                        _id: fields.vendor?._id,
                                        name: fields.vendor?.name,
                                    }
                                    : null
                            }
                            lazyFun={async (para) => await fetchvendorApi({ ...para, allStatus: true })}
                            OptionComponent={({ option, ...rest }) => {
                                return <ListItem {...rest}>{option.name}</ListItem >
                            }}
                            value={fields?.vendor}
                            onChange={async (changedVal) => {
                                setFields({ ...fields, vendor: changedVal ? changedVal._id : null });
                            }}

                            titleKey={'name'}
                            valueKey={"_id"}
                            InputComponent={(params) => <StyledSearchBar placeholder={"Select Vendor"} {...params} margin="none" />}
                        />
                    </PaddingBoxInDesktop>}
                    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '52%' }}>
                            <CustomInput
                                disabled={loading}
                                value={fields.amount}
                                onChange={(e) => setFields({ ...fields, err: '', amount: e.target.value })}
                                type="text"
                                label={"Product Price"}
                                sx={{ height: '56px' }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <DesktopDatePicker
                                disabled={loading}
                               inputFormat="DD-MM-yyyy"
                                value={moment(fields.date ?? null)}
                                onChange={(changedVal) => {
                                    setFields({ ...fields, err: "", date: changedVal });
                                }}
                                renderInput={(props) => (
                                    <CustomInput
                                        {...props}
                                        sx={{ height: '56px' }}
                                    />
                                )}
                                type="date"
                                label={"Date*"}
                            />
                        </Box>
                    </Box>

                </>
            }
        </CustomDialog>

    </>
}
export default memo(InOutRawMaterialStockCreateUi)