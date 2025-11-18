import { Box, CircularProgress, IconButton, ListItem, Typography } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"
import AddRawMaterials from "./AddRawMaterial"
import AddItem from "./AddItem"
import AddIcon from '@mui/icons-material/Add';
import AsyncDropDown from "../../components/inputs/AsyncDropDown"
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop"
import { FetchSpecialMarkingApi } from "../../apis/SpecialMarking.api"
import { StyledSearchBar } from "../../components/inputs/SearchBar"
import AddSKD from "./AddSKD"
import { Add } from "@mui/icons-material"
import { useDispatch } from "react-redux"
import { openModal } from "../../store/actions/modalAction"
import CreateControllerSpecialMarking from "../SpecialMarking/CreateControllerSpecialMarking"
import FileInput from "../../components/layouts/upload/FileInput"
import crypto from "crypto-js";

const CreateSemiFinishedGoodUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal, handleAreaModalClose }) => {
    const dispatch = useDispatch();

    const onCreateBtnClick = () => {
        dispatch(openModal(
            <CreateControllerSpecialMarking
            />, "sm", false, "Create"))
    }
    const generateSfgCode = (name) => {
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
                id={`${isUpdate ? "update" : "create_Semi_Finished_Good"}`}
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
                                    sfg_Code: prev.manualSfgEdit ? prev.sfg_Code : generateSfgCode(newName)
                                }));
                            }}
                            type="text"
                            label={"SFG Name*"}
                        />


                        <CustomInput
                            disabled={loading}
                            value={fields.sfg_Code}
                            onChange={(e) =>
                                setFields({
                                    ...fields,
                                    err: "",
                                    sfg_Code: e.target.value,
                                    manualSfgEdit: true
                                })
                            }
                            type="text"
                            label={"SFG Code*"}
                        />
                        {<CustomInput
                            disabled={loading}
                            value={fields.description}
                            onChange={(e) => setFields({ ...fields, err: '', description: e.target.value })}
                            type="text"
                            label={"Description"}
                        />}
                        {/* {<CustomInput
                            disabled={loading}
                            value={fields.designator}
                            onChange={(e) => setFields({ ...fields, err: '', designator: e.target.value })}
                            type="text"
                            label={"Designator"}
                        />} */}
                        {<CustomInput
                            disabled={loading}
                            value={fields.mpn}
                            onChange={(e) => setFields({ ...fields, err: '', mpn: e.target.value })}
                            type="text"
                            label={"MPN"}
                        />}

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
                        <Box mt={1} sx={{ display: "flex", width: "100%", height: "auto", border: "1px solid", flexDirection: "column", p: 2, borderRadius: "5px" }}>
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
                                <AddItem fields={fields} setFields={setFields} />
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
                                    sfg_image: ""
                                })
                            }}
                            onChange={(files) => {
                                setFields({
                                    ...fields,
                                    err: "",
                                    sfg_image: files
                                })
                            }}
                            defaults={fields?.sfg_image ? [fields?.sfg_image] : []}
                            accept="image/"
                            title="Upload Photo"
                            subTitle="Only png,jpeg,jpg,pdf files are allowed! less than 1 MB"
                        />
                    </>
                }
            </CustomDialog>
        }
    </>
}
export default memo(CreateSemiFinishedGoodUi)