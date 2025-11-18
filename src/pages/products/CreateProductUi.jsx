import { Autocomplete, Box, Button, CircularProgress, ListItem, Typography } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"
import { DAY_WEEK_MONTH } from "../../utils/constants"
import { findNameByRole, titleCase } from "../../utils/main"
import { StyledSearchBar } from "../../components/inputs/SearchBar"
import AsyncDropDown from "../../components/inputs/AsyncDropDown"
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop"
import { fetchDepartments } from "../../apis/department.api"
import AddMaterialUiProduct from "./AddMaterialUiProduct"
import { fetchBrandApi } from "../../apis/productBrand.api"
import { fetchColorApi } from "../../apis/productColor.api"
import { fetchTypeApi } from "../../apis/productType.api"

const CreateProductUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal, index, handleAreaModalClose }) => {
    const allowed = [...Object.keys(DAY_WEEK_MONTH).map((key) => ({ label: titleCase(key), _id: DAY_WEEK_MONTH[key] }))]
    const handleLeadtime = (e) => {

        setFields({
            ...fields,
            err: '',
            lead_time: e.target.value
        })
    }

    return <>

        <CustomDialog
            id={`${isUpdate ? "productupdate" : "product"}`}
            loading={loading}
            err={fields?.err}
            onSubmit={onSubmit}
            title={`${isUpdate ? "Update" : "Create"} ${title}`}
            closeText="Close"
            confirmText={`${isUpdate ? "Update" : "Create"}`}
        >
            {loading ? <CenteredBox><CircularProgress /></CenteredBox> :
                <>
                    {<CustomInput
                        autoFocus={true}
                        disabled={loading}
                        value={fields?.product_name}
                        onChange={(e) => setFields({ ...fields, err: '', product_name: e.target.value })}
                        type="text"
                        label={"Product Name*"}
                    />}
                    {<CustomInput
                        disabled={loading}
                        value={fields?.product_code}
                        onChange={(e) => setFields({ ...fields, err: '', product_code: e.target.value })}
                        type="text"
                        label={"Product Code*"}
                    />}

                    {<Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <Autocomplete
                            disableClearable
                            options={allowed}
                            defaultValue={"Day"}
                            value={findNameByRole(fields?.role)}
                            onChange={(e, newVal) => {
                                setFields({ ...fields, role: newVal ? newVal._id : null, parent_id: null })
                            }}
                            sx={{ width: "49%", display: "flex", "*": { display: "flex", justifyContent: "center" } }}
                            renderInput={(params) => <CustomInput placeholder="Select day/Week*" {...params} label="Select Day Or Week*" margin="dense" />}
                        />
                        <CustomInput
                            disabled={loading}
                            sx={{ width: "49%", display: "flex", "*": { display: "flex", justifyContent: "center" } }}
                            value={fields?.lead_time}
                            onChange={(e) => handleLeadtime(e)}
                            type="text"
                            label={"Assembling Time*"}
                        />

                    </Box>}

                    {<CustomInput
                        disabled={loading}
                        sx={{ width: "100%", display: "flex", "*": { display: "flex", justifyContent: "center" } }}
                        value={fields?.current_stock}
                        onChange={(e) => setFields({ ...fields, err: '', current_stock: e.target.value })}
                        type="text"
                        label={"Current Stock*"}
                    />}

                    {<PaddingBoxInDesktop mt={3} mb={2} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                        <AsyncDropDown
                            defaultVal={
                                fields.department ? {

                                    _id: fields.department._id,
                                    name: fields.department.name,
                                }
                                    : null
                            }
                            lazyFun={async (para) => await fetchDepartments({ ...para, allStatus: true })}
                            OptionComponent={({ option, ...rest }) => {
                                return <ListItem {...rest}>{option.name}</ListItem >
                            }}
                            value={fields?.department}
                            onChange={async (changedVal) => {
                                setFields({ ...fields, department: changedVal ? [changedVal._id] : null });
                            }}

                            titleKey={'name'}
                            valueKey={"_id"}
                            InputComponent={(params) => <StyledSearchBar placeholder={"Select Department*"} {...params} margin="none" />}
                        />
                    </PaddingBoxInDesktop>}

                    {<PaddingBoxInDesktop mt={3} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                        <AsyncDropDown
                            defaultVal={
                                fields.product_type ? {

                                    _id: fields.product_type._id,
                                    name: fields.product_type.name,
                                }
                                    : null
                            }
                            lazyFun={async (para) => await fetchTypeApi({ ...para, allStatus: true })}
                            OptionComponent={({ option, ...rest }) => {
                                return <ListItem {...rest}>{option.name}</ListItem >
                            }}
                            value={fields?.product_type}
                            onChange={async (changedVal) => {
                                setFields({ ...fields, product_type: changedVal ? [changedVal._id] : null });
                            }}

                            titleKey={'name'}
                            valueKey={"_id"}
                            InputComponent={(params) => <StyledSearchBar placeholder={"Select Product Type*"} {...params} margin="none" />}
                        />
                    </PaddingBoxInDesktop>}

                    {<PaddingBoxInDesktop mt={3} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                        <AsyncDropDown
                            defaultVal={
                                fields.product_color ? {

                                    _id: fields.product_color._id,
                                    name: fields.product_color.name,
                                }
                                    : null
                            }
                            lazyFun={async (para) => await fetchColorApi({ ...para, allStatus: true })}
                            OptionComponent={({ option, ...rest }) => {
                                return <ListItem {...rest}>{option.name}</ListItem >
                            }}
                            value={fields?.product_color}
                            onChange={async (changedVal) => {
                                setFields({ ...fields, product_color: changedVal ? [changedVal._id] : null });
                            }}

                            titleKey={'name'}
                            valueKey={"_id"}
                            InputComponent={(params) => <StyledSearchBar placeholder={"Select Product Color*"} {...params} margin="none" />}
                        />
                    </PaddingBoxInDesktop>}

                    {<PaddingBoxInDesktop mt={3} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                        <AsyncDropDown
                            defaultVal={
                                fields.product_brand ? {

                                    _id: fields.product_brand._id,
                                    name: fields.product_brand.name,
                                }
                                    : null
                            }
                            lazyFun={async (para) => await fetchBrandApi({ ...para, allStatus: true })}
                            OptionComponent={({ option, ...rest }) => {
                                return <ListItem {...rest}>{option.name}</ListItem >
                            }}
                            value={fields?.product_brand}
                            onChange={async (changedVal) => {
                                setFields({ ...fields, product_brand: changedVal ? [changedVal._id] : null });
                            }}

                            titleKey={'name'}
                            valueKey={"_id"}
                            InputComponent={(params) => <StyledSearchBar placeholder={"Select Product Brand*"} {...params} margin="none" />}
                        />
                    </PaddingBoxInDesktop>}

                    {<CustomInput
                        disabled={loading}
                        value={fields.product_price}
                        onChange={(e) => setFields({ ...fields, err: '', product_price: e.target.value })}
                        type="text"
                        label={"Product Price*"}
                    />}

                    {<Box >
                        <AddMaterialUiProduct fields={fields} setFields={setFields} index={index} />
                    </Box>}

                    {<Box mt={2} width={"100%"} display={"flex"} justifyContent={"center"}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setFields((data) => {
                                    let arr = [...data.requiredRawMaterials];
                                    arr.push({
                                        rawMaterialId: "",
                                        rawMaterialName: "",
                                        quantity: null
                                    });
                                    return { ...data, requiredRawMaterials: arr };
                                });
                            }}

                        >
                            <Typography variant="h6">Add More Materials</Typography>
                        </Button>
                    </Box>}
                </>
            }
        </CustomDialog>

    </>
}
export default memo(CreateProductUi)