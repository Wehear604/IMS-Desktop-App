import { Box, CircularProgress, IconButton, ListItem, Typography } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"
import AddIcon from '@mui/icons-material/Add';
import AddItems from "./AddItems"
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop"
import AsyncDropDown from "../../components/inputs/AsyncDropDown"
import { FetchSpecialMarkingApi } from "../../apis/SpecialMarking.api"
import { StyledSearchBar } from "../../components/inputs/SearchBar"
import { useDispatch } from "react-redux"
import { openModal } from "../../store/actions/modalAction"
import CreateControllerSpecialMarking from "../SpecialMarking/CreateControllerSpecialMarking"
import { Add } from "@mui/icons-material"
import AddRawMaterials from "./AddRawMaterials"
import crypto from "crypto-js";

const CreateSemiKnockedDownUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal, handleAreaModalClose }) => {
    const dispatch = useDispatch();

    const onCreateBtnClick = () => {
        dispatch(openModal(
            <CreateControllerSpecialMarking
            />, "sm", false, "Create"))
    }

    const generateSkdCode = (name) => {
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
                id={`${isUpdate ? "update" : "create_Semi_Knocked_Down"}`}
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
                                    skd_Code: prev.manualSkdEdit ? prev.skd_Code : generateSkdCode(newName)
                                }));
                            }}
                            type="text"
                            label={"SKD Name*"}
                        />


                        <CustomInput
                            disabled={loading}
                            value={fields.skd_Code}
                            onChange={(e) =>
                                setFields({
                                    ...fields,
                                    err: "",
                                    skd_Code: e.target.value,
                                    manualSkdEdit: true
                                })
                            }
                            type="text"
                            label={"SKD Code*"}
                        />



                        <Box mt={1} sx={{ display: "flex", width: "100%", height: "auto", border: "1px solid", flexDirection: "column", p: 2, borderRadius: "5px" }}>

                            <Box sx={{ display: "flex", width: "100%", flexDirection: "row" }}>
                                <Box mt={2} width={"100%"} display={"flex"} justifyContent={"flex-start"} alignItems={"center"}>
                                    <Typography >Raw Materials</Typography>
                                </Box>
                            </Box>
                            {<Box >
                                <AddRawMaterials fields={fields} setFields={setFields} />
                                {/* <AddItems fields={fields} setFields={setFields} loading={loading} /> */}
                            </Box>}
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>

                                <IconButton sx={{ width: "9%" }} disabled={loading} size="inherit" onClick={() => {
                                    setFields((data) => {
                                        let arr = [...data.rawMaterials];
                                        arr.push({
                                            rawMaterialId: "",
                                            min_of_quantity: null,
                                            code: "",
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
                    </>
                }
            </CustomDialog>
        }
    </>
}
export default memo(CreateSemiKnockedDownUi)