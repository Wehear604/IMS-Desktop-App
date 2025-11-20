import React from 'react'
import CustomDialog from '../../components/layouts/common/CustomDialog'
import CustomInput from '../../components/inputs/CustomInputs'
import { Box, IconButton, CircularProgress } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { CenteredBox } from '../../components/layouts/OneViewBox';
import { Delete } from '@mui/icons-material';

const CreateUiPurchaseRequest = ({ id, loading, onSubmit, fields, setFields, isview }) => {

    const addMaterial = () => {
        setFields({
            ...fields,
            materials: [...fields.materials, { materialName: "", quantity: "" }],
        });
    };

    const removeMaterial = (index) => {
        const updated = [...fields.materials];
        updated.splice(index, 1);
        setFields({ ...fields, materials: updated });
    };

    const updateMaterialField = (index, key, value) => {
        const updated = [...fields.materials];
        updated[index][key] = value;
        setFields({ ...fields, materials: updated });
    };

    return (
        <CustomDialog
            id={"purchaseRequest"}
            loading={loading}
            err={fields.err}
            onSubmit={onSubmit}
            title={isview ? "View Purchase Request" : "Purchase Request"}
            closeText={"Close"}
            confirmText={isview ? undefined : "Create"}
        >
            {loading && <CenteredBox><CircularProgress /></CenteredBox>}

            {fields.materials.map((material, index) => (
                <Box
                    key={index}
                    width="100%"
                    gap={2}
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                >
                    <Box sx={{ width: "40%" }}>
                        <CustomInput
                            disabled={loading || isview}
                            value={material.materialName}
                            onChange={(e) =>
                                updateMaterialField(index, "materialName", e.target.value)
                            }
                            type="text"
                            label={"Material Name*"}
                        />
                    </Box>

                    <Box sx={{ width: "40%" }}>
                        <CustomInput
                            disabled={loading || isview}
                            value={material.quantity}
                            onChange={(e) =>
                                updateMaterialField(index, "quantity", e.target.value)
                            }
                            type="text"
                            label={"Quantity*"}
                        />
                    </Box>

                    {!isview && (
                        <IconButton
                            disabled={fields.materials.length === 1}
                            onClick={() => removeMaterial(index)}
                        >
                            <Delete color={fields.materials.length === 1 ? "disabled" : "error"} />
                        </IconButton>
                    )}
                </Box>
            ))}

            {!isview && (
                <Box mt={2} sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <IconButton onClick={addMaterial} sx={{ border: "1px solid #CCC", borderRadius: "50%" }}>
                        <AddIcon fontSize='medium' />
                    </IconButton>
                </Box>
            )}
        </CustomDialog>
    );
};

export default CreateUiPurchaseRequest;


{/* <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, width: '50%', pt: 2, pb: 2 }}>
                    <PaddingBoxInDesktop
                        mt={2}
                        sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
                    >
                        <AsyncDropDown
                            defaultVal={
                                fields.categoryId
                                    ? {
                                        _id: fields.categoryId._id,
                                        name: fields.categoryId.name,
                                    }
                                    : null
                            }
                            lazyFun={async (para) =>
                                await fetchCategoryApi({ ...para, allStatus: true })
                            }
                            OptionComponent={({ option, ...rest }) => {
                                return <ListItem {...rest}>{option.name}</ListItem>;
                            }}
                            value={fields?.categoryId}
                            onChange={async (changedVal) => {
                                setFields({
                                    ...fields,
                                    categoryId: changedVal ? changedVal._id : null,
                                });
                            }}
                            titleKey={"name"}
                            valueKey={"_id"}
                            InputComponent={(params) => (
                                <StyledSearchBar
                                    placeholder={"Select Category*"}
                                    {...params}
                                    margin="none"
                                    disabled={isview}
                                />
                            )}
                            disabled={isview}
                        />
                    </PaddingBoxInDesktop>
                </Box> */}