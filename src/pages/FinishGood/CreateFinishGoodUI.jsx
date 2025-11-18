import { Autocomplete, Box, CircularProgress, IconButton, ListItem, Typography } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"
import AddItems from "./AddItem"
import AddSFG from "./AddSFG"
import AddIcon from '@mui/icons-material/Add';
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop"
import { fetchBrandApi } from "../../apis/productBrand.api"
import AsyncDropDown from "../../components/inputs/AsyncDropDown"
import { StyledSearchBar } from "../../components/inputs/SearchBar"
import { fetchColorApi } from "../../apis/productColor.api"
import { fetchTypeApi } from "../../apis/productType.api"
import FileInput from "../../components/layouts/upload/FileInput"
import { COUNTRY_CATEGORY } from "../../utils/constants"
import { findObjectKeyByValue, titleCase, toTitleCase } from "../../utils/main"
import AddRawMaterials from "./AddRawMaterial"
import { FetchSpecialMarkingApi } from "../../apis/SpecialMarking.api"
import AddSKD from "./AddSKD"
import { useDispatch } from "react-redux"
import CreateControllerSpecialMarking from "../SpecialMarking/CreateControllerSpecialMarking"
import { openModal } from "../../store/actions/modalAction"
import { Add } from "@mui/icons-material"
import crypto from "crypto-js";

const CreateFinishGoodUI = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal }) => {
    const dispatch = useDispatch();

    const onCreateBtnClick = () => {
        dispatch(openModal(
            <CreateControllerSpecialMarking
            />, "sm", false, "Create"))
    }

    const generateFgCode = (name) => {
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
                id={`${isUpdate ? "update" : "create_Finished_Good"}`}
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
                                    fg_Code: prev.manualFgEdit ? prev.fg_Code : generateFgCode(newName)
                                }));
                            }}
                            type="text"
                            label={"FG Name*"}
                        />


                        <CustomInput
                            disabled={loading}
                            value={fields.fg_Code}
                            onChange={(e) =>
                                setFields({
                                    ...fields,
                                    err: "",
                                    fg_Code: e.target.value,
                                    manualFgEdit: true
                                })
                            }
                            type="text"
                            label={"FG Code*"}
                        />

                        {<PaddingBoxInDesktop mt={3} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                            <AsyncDropDown
                                Value={
                                    fields?.product_type?._id && fields?.product_type?.name ? {
                                        _id: fields?.product_type?._id,
                                        name: fields.product_type?.name,
                                    } : fields?.product_type && fields?.product_name ?
                                        {
                                            _id: fields?.product_type,
                                            name: fields?.product_name,
                                        } : null
                                }
                                lazyFun={async (para) => await fetchTypeApi({ ...para, allStatus: true })}
                                OptionComponent={({ option, ...rest }) => {
                                    return <ListItem {...rest}>{option.name}</ListItem >
                                }}
                                value={fields?.product_name}
                                onChange={async (changedVal) => {
                                    setFields({ ...fields, product_type: changedVal ? changedVal?._id : null, product_name: changedVal ? changedVal.name : null, product_brand: changedVal?.brand ? changedVal?.brand : null });
                                }}

                                titleKey={'name'}
                                valueKey={"_id"}
                                InputComponent={(params) => <StyledSearchBar placeholder={"Select Finished Good Type*"} {...params} margin="none" />}
                            />
                        </PaddingBoxInDesktop>}

                        {<PaddingBoxInDesktop mt={3} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                            <AsyncDropDown
                                disabled={true}
                                Value={
                                    fields?.product_brand?._id && fields?.product_brand?.name ? {
                                        _id: fields?.product_brand?._id,
                                        name: fields.product_brand?.name,
                                    } : fields?.product_brand && fields?.product_brand_name ?
                                        {
                                            _id: fields?.product_brand,
                                            name: fields?.product_brand_name,
                                        } : null
                                }
                                lazyFun={async (para) => await fetchBrandApi({ ...para, allStatus: true })}
                                OptionComponent={({ option, ...rest }) => {
                                    return <ListItem {...rest}>{option.name}</ListItem >
                                }}
                                value={fields?.product_brand_name}
                                onChange={async (changedVal) => {
                                    setFields({ ...fields, product_brand: changedVal ? changedVal?._id : null, product_brand_name: changedVal ? changedVal.name : null });
                                }}

                                titleKey={'name'}
                                valueKey={"_id"}
                                InputComponent={(params) => <StyledSearchBar placeholder={"Select Finished Good Brand*"} {...params} margin="none" />}
                            />
                        </PaddingBoxInDesktop>}

                        {<PaddingBoxInDesktop mt={3} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                            <AsyncDropDown
                                defaultVal={
                                    fields.product_color ? {

                                        _id: fields?.product_color?._id ? fields?.product_color?._id : fields?.product_color,
                                        name: fields.product_color.name ? fields.product_color.name : fields.product_color_name,
                                    }
                                        : null
                                }
                                lazyFun={async (para) => await fetchColorApi({ ...para, allStatus: true })}
                                OptionComponent={({ option, ...rest }) => {
                                    return <ListItem {...rest}>{option.name}</ListItem >
                                }}
                                value={fields?.product_color_name}
                                onChange={async (changedVal) => {
                                    setFields({ ...fields, product_color: changedVal ? changedVal?._id : null, product_color_name: changedVal ? changedVal.name : null });
                                }}

                                titleKey={'name'}
                                valueKey={"_id"}
                                InputComponent={(params) => <StyledSearchBar placeholder={"Select Finished Good Color*"} {...params} margin="none" />}
                            />
                        </PaddingBoxInDesktop>}

                        {<CustomInput
                            disabled={loading}
                            value={fields.product_price}
                            onChange={(e) => setFields({ ...fields, err: '', product_price: e.target.value })}
                            type="text"
                            label={"Finished Good Price"}
                        />}
                        <Box mt={1} sx={{ display: "flex", width: "100%", height: "auto", border: "1px solid", flexDirection: "column", p: 2, borderRadius: "5px" }}>

                            <Box sx={{ display: "flex", width: "100%", flexDirection: "row" }}>
                                <Box mt={2} width={"100%"} display={"flex"} justifyContent={"flex-start"} alignItems={"center"}>
                                    <Typography >SFG</Typography>
                                </Box>

                            </Box>

                            {<Box >
                                <AddSFG fields={fields} setFields={setFields} />
                            </Box>}
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>

                                <IconButton sx={{ width: "9%" }} disabled={loading} size="inherit" onClick={() => {
                                    setFields((data) => {
                                        let arr = [...data.sfg];
                                        arr.push({
                                            sfgId: "",
                                            min_of_quantity: null,
                                        });
                                        return { ...data, sfg: arr };
                                    });
                                }}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", borderRadius: "50%", border: "2px solid" }}>
                                        <AddIcon sx={{ width: "100%", height: "4vh" }} />
                                    </Box>
                                </IconButton>
                            </Box>
                        </Box>
                        <Box mt={1} sx={{ display: "flex", width: "100%", height: "auto", border: "1px solid", flexDirection: "column", p: 2, borderRadius: "5px" }}>
                            <Box sx={{ display: "flex", width: "100%", flexDirection: "row" }}>
                                <Box width={"100%"} display={"flex"} justifyContent={"flex-start"} alignItems={"center"}>
                                    <Typography >SKD</Typography>
                                </Box>

                            </Box>
                            {<Box >
                                <AddSKD fields={fields} setFields={setFields} />
                            </Box>}
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>

                                <IconButton sx={{ width: "9%" }} disabled={loading} size="inherit" onClick={() => {
                                    setFields((data) => {
                                        let arr = [...data.skds];
                                        arr.push({
                                            skdId: null,
                                            min_of_quantity: null,
                                        });
                                        return { ...data, skds: arr };
                                    });
                                }}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", borderRadius: "50%", border: "2px solid" }}>
                                        <AddIcon sx={{ width: "100%", height: "4vh" }} />
                                    </Box>
                                </IconButton>
                            </Box>
                        </Box>

                        <Box mt={1} mb={2} sx={{ display: "flex", width: "100%", height: "auto", border: "1px solid", flexDirection: "column", p: 2, borderRadius: "5px" }}>
                            <Box sx={{ display: "flex", width: "100%", flexDirection: "row" }}>
                                <Box width={"100%"} display={"flex"} justifyContent={"flex-start"} alignItems={"center"}>
                                    <Typography >Raw Materials</Typography>
                                </Box>

                            </Box>
                            {<Box >
                                <AddRawMaterials fields={fields} setFields={setFields} />

                            </Box>}
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>

                                <IconButton sx={{ width: "9%" }} disabled={loading} size="inherit" onClick={() => {
                                    setFields((data) => {
                                        let arr = [...data.rawMaterials];
                                        arr.push({
                                            rawMaterialId: null,
                                            min_of_quantity: null,
                                            code: ""
                                        });
                                        return { ...data, rawMaterials: arr };
                                    });
                                }}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", borderRadius: "50%", border: "2px solid" }}>
                                        <AddIcon sx={{ width: "100%", height: "4vh" }} />
                                    </Box>
                                </IconButton>
                            </Box>
                        </Box>
                        {/* <Box mt={1} sx={{ display: "flex", width: "100%", height: "auto", border: "1px solid", flexDirection: "column", p: 2, borderRadius: "5px" }}>
                            <Box sx={{ display: "flex", width: "100%", flexDirection: "row" }}>
                                <Box mt={2} width={"100%"} display={"flex"} justifyContent={"flex-start"} alignItems={"center"}>
                                    <Typography >Items</Typography>
                                </Box>
                            </Box>
                            {<Box >
                                <AddItems fields={fields} setFields={setFields} />
                            </Box>}
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>

                                <IconButton sx={{ width: "9%" }} disabled={loading} size="inherit" onClick={() => {
                                    setFields((data) => {
                                        let arr = [...data.items];
                                        arr.push({
                                            itemId: null,
                                            min_of_quantity: null,
                                        });
                                        return { ...data, items: arr };
                                    });
                                }}>
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", borderRadius: "50%", border: "2px solid" }}>
                                        <AddIcon sx={{ width: "100%", height: "4vh" }} />
                                    </Box>
                                </IconButton>
                            </Box>

                        </Box> */}
                        {/* {<CustomInput
                            disabled={loading}
                            rows={2}
                            multiline
                            value={fields.description}
                            onChange={(e) => setFields({ ...fields, err: '', description: e.target.value })}
                            type="text"
                            label={"Description*"}
                        />} */}

                        {/* <Autocomplete
                            disableClearable
                            options={(Object.keys(COUNTRY_CATEGORY).map((key) => ({ label: titleCase(key), _id: COUNTRY_CATEGORY[key] })))}
                            value={findObjectKeyByValue(fields?.country_category, COUNTRY_CATEGORY)}
                            onChange={(e, newVal) => {
                                console.log('Material type changed:', newVal);
                                setFields({ ...fields, country_category: newVal ? newVal._id : null });
                            }}
                            sx={{
                                width: '100%',
                                display: 'flex',
                                '*': { display: 'flex', justifyContent: 'center' }
                            }}
                            renderInput={(params) => (
                                <CustomInput
                                    placeholder="Select Category Type*"
                                    {...params}
                                    label="Select Category Type*"
                                    margin="dense"
                                />
                            )}
                        /> */}

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
                        <FileInput
                            onlyImage={false}
                            multi={false}
                            onDelete={(filesToDelete) => {
                                setFields({
                                    ...fields,
                                    err: "",
                                    product_image: ""
                                })
                            }}
                            onChange={(files) => {
                                setFields({
                                    ...fields,
                                    err: "",
                                    product_image: files
                                })
                            }}
                            defaults={fields?.product_image ? [fields?.product_image] : []}
                            accept="image/*"
                            title="Upload Photo*"
                            subTitle="Only png,jpeg,jpg,pdf files are allowed! less than 1 MB"
                        />
                    </>
                }
            </CustomDialog >
        }
    </>
}
export default memo(CreateFinishGoodUI)