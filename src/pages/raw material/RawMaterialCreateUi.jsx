import { Autocomplete, Box, CircularProgress, IconButton, FormControl, InputLabel, ListItem, MenuItem, Select } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"
import { DAY_WEEK_MONTH, UNITS } from "../../utils/constants"
import { findNameByRole, titleCase } from "../../utils/main"
import AsyncDropDown from "../../components/inputs/AsyncDropDown"
import { StyledSearchBar } from "../../components/inputs/SearchBar"
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop"
import { fetchitemTypeApi } from "../../apis/itemType.api"
import { FetchSpecialMarkingApi } from "../../apis/SpecialMarking.api"
import { Add } from "@mui/icons-material"
import { openModal } from "../../store/actions/modalAction"
import CreateControllerSpecialMarking from "../SpecialMarking/CreateControllerSpecialMarking"
import { useDispatch } from "react-redux"
import crypto from "crypto-js";

const RawMaterialCreateUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal }) => {
    const allowed = [...Object.keys(DAY_WEEK_MONTH).map((key) => ({ label: titleCase(key), _id: DAY_WEEK_MONTH[key] }))]
    const dispatch = useDispatch();

    const onCreateBtnClick = () => {
        dispatch(openModal(
            <CreateControllerSpecialMarking
            />, "sm", false, "Create"))
    }

    const generateMaterialCode = (name) => {
        if (!name) return "";

        const words = name.trim().split(/\s+/);
        let prefix;
        if (words.length >= 2) {
            prefix = (words[0][0] + words[words.length - 1][0]).toUpperCase();
        } else {
            prefix = name.slice(0, 2).toUpperCase();
        }

        const md5 = crypto.MD5(name).toString().toUpperCase();
        const hashPart = md5.replace(/[^A-Z0-9]/g, "").slice(0, 3);

        const sum = name
            .toUpperCase()
            .split("")
            .reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const checkChar = chars[sum % 36];

        return prefix + hashPart + checkChar;
    };

    return <>
        {!isModal &&
            <CustomDialog
                id={`${isUpdate ? "update" : "rawMaterial"}`}
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
                            onChange={(e) => {
                                const newName = e.target.value;
                                setFields((prev) => ({
                                    ...prev,
                                    err: '',
                                    name: newName,
                                    rawMaterial_code: prev.manualCodeEdit ? prev.rawMaterial_code : generateMaterialCode(newName)
                                }));
                            }}
                            type="text"
                            label={"Raw Material Name*"}
                        />


                        <CustomInput
                            disabled={loading}
                            value={fields.rawMaterial_code}
                            onChange={(e) =>
                                setFields({
                                    ...fields,
                                    err: "",
                                    rawMaterial_code: e.target.value,
                                    manualCodeEdit: true
                                })
                            }
                            type="text"
                            label={"Item Code*"}
                        />




                        <Box display={"flex"} justifyContent={"space-between"} flexDirection={"row"} gap={2} >
                            <Box sx={{ width: "49%" }}>
                                <Autocomplete
                                    disabled={true}
                                    options={allowed}
                                    defaultValue={"Day"}
                                    value={findNameByRole(fields?.role)}
                                    onChange={(e, newVal) => {
                                        setFields({ ...fields, role: newVal ? newVal._id : null, parent_id: null })
                                    }}
                                    renderInput={(params) => <CustomInput placeholder="Select day/Week" {...params} label="Select Day Or Week" />}
                                />
                            </Box>
                            <Box sx={{ width: "50%" }}>
                                <CustomInput
                                    disabled={loading}
                                    value={fields?.lead_time}
                                    onChange={(e) => {
                                        setFields({
                                            ...fields,
                                            lead_time: e.target.value,
                                            err: "",
                                        });
                                    }}
                                    type="text"
                                    label={"Lead Time*"}
                                />
                            </Box>
                        </Box>

                        {<CustomInput
                            disabled={loading}
                            value={fields.location}
                            onChange={(e) => setFields({ ...fields, err: '', location: e.target.value })}
                            type="text"
                            label={"Storage Location*"}
                        />}
                        {<CustomInput
                            disabled={loading}
                            value={fields?.mpn}
                            onChange={(e) => setFields({ ...fields, err: '', mpn: e.target.value })}
                            type="text"
                            label={"MPN*"}
                        />}
                        {<PaddingBoxInDesktop mt={2} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                            <AsyncDropDown
                                defaultVal={
                                    fields.itemType ? {

                                        _id: fields.itemType._id,
                                        name: fields.itemType.name,
                                    }
                                        : null
                                }
                                lazyFun={async (para) => await fetchitemTypeApi({ ...para, allStatus: true })}
                                OptionComponent={({ option, ...rest }) => {
                                    return <ListItem {...rest}>{option.name}</ListItem >
                                }}
                                value={fields?.itemType}
                                onChange={async (changedVal) => {
                                    setFields({ ...fields, itemType: changedVal ? changedVal._id : null });
                                }}
                                titleKey={'name'}
                                valueKey={"_id"}
                                InputComponent={(params) => <StyledSearchBar placeholder={"Select Raw Material Type*"} {...params} margin="none" />}
                            />
                        </PaddingBoxInDesktop>}
                        {<CustomInput
                            disabled={loading}
                            value={fields.price_per_unit}
                            onChange={(e) => setFields({ ...fields, err: '', price_per_unit: e.target.value })}
                            type="text"
                            label={"Price per Unit*"}
                        />}

                        <Box sx={{ display: "flex", flexDirection: "row", }}>
                            <PaddingBoxInDesktop mt={2} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                                <AsyncDropDown
                                    defaultVal={
                                        fields?.specialMarking?._id ? {
                                            _id: fields?.specialMarking?._id,
                                            name: fields?.specialMarking?.name,
                                        }
                                            : null
                                    }
                                    lazyFun={async (para) => await FetchSpecialMarkingApi({ ...para, allStatus: true })}
                                    OptionComponent={({ option, ...rest }) => {
                                        return <ListItem {...rest}>{option.name}</ListItem >
                                    }}
                                    value={fields?.specialMarking}
                                    onChange={async (changedVal) => {
                                        setFields({ ...fields, specialMarking: changedVal ? changedVal._id : null });
                                    }}
                                    titleKey={'name'}
                                    valueKey={"_id"}
                                    InputComponent={(params) => <StyledSearchBar placeholder={"Storage Condition"} {...params} margin="none" />}
                                />
                            </PaddingBoxInDesktop>
                            <Box onClick={onCreateBtnClick} sx={{ cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", width: "10%", border: "1px solid", mt: 2, ml: 2, borderRadius: "4px" }}>
                                <Add />
                            </Box>
                        </Box>
                        <FormControl fullWidth sx={{ mt: 2 }} >
                            <InputLabel >Measurement Unit</InputLabel>
                            <Select
                                value={fields.unit}
                                label="Measurement Unit*"
                                onChange={(e) => setFields({ ...fields, err: '', unit: e.target.value })}

                            >
                                {Object.keys(UNITS).map((key) => (
                                    <MenuItem key={key} value={UNITS[key]}>{titleCase(key)}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
                }
            </CustomDialog>
        }
    </>
}
export default memo(RawMaterialCreateUi)