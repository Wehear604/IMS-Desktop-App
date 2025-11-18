import { CircularProgress, ListItem } from "@mui/material"
import { CenteredBox } from "../../components/layouts/OneViewBox"
import CustomDialog from "../../components/layouts/common/CustomDialog"
import CustomInput from "../../components/inputs/CustomInputs"
import { memo } from "react"
import { fetchBrandApi } from "../../apis/productBrand.api"
import { StyledSearchBar } from "../../components/inputs/SearchBar"
import AsyncDropDown from "../../components/inputs/AsyncDropDown"
import PaddingBoxInDesktop from "../../components/layouts/PaddingBoxDesktop"

const ProductTypeCreateUi = ({ title, isUpdate, fields, setFields, loading, onSubmit, isModal, handleAreaModalClose }) => {
    return <>
        <CustomDialog
            id={`${isUpdate ? "delete" : "department"}`}
            loading={loading}
            err={fields.err}
            onSubmit={onSubmit}
            title={`${isUpdate ? "Update" : "Create"} ${title}`}
            closeText="Close"
            confirmText={`${isUpdate ? "Update" : "Create"}`}
        >
            {loading ? <CenteredBox><CircularProgress /></CenteredBox> :
                <>
                    <PaddingBoxInDesktop
                        mt={2}
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <AsyncDropDown
                            Value={
                                fields.brand._id
                                    ? {
                                        itemId: fields.brand._id,
                                        name: fields.brand.name,
                                    }
                                    : null
                            }
                            lazyFun={async (para) =>
                                await fetchBrandApi({ ...para, allStatus: true })
                            }
                            OptionComponent={({ option, ...rest }) => (
                                <ListItem {...rest}>{option.name}</ListItem>
                            )}
                            onChange={async (changedVal) => {
                                setFields({ ...fields, err: "", brand: changedVal ? changedVal._id : "" });
                            }}
                            titleKey={"name"}
                            valueKey={"_id"}
                            InputComponent={(params) => (
                                <StyledSearchBar
                                    placeholder={"Select Brand"}
                                    {...params}
                                    margin="none"
                                />
                            )}
                        />
                    </PaddingBoxInDesktop>
                    {<CustomInput
                        autoFocus={true}
                        disabled={loading}
                        value={fields.name}
                        onChange={(e) => setFields({ ...fields, err: '', name: e.target.value })}
                        type="text"
                        label={"Product Type*"}

                    />}
                </>
            }
        </CustomDialog>
    </>
}
export default memo(ProductTypeCreateUi)