import { Box, ListItem } from '@mui/material';
import React from 'react'
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import CustomInput from '../../components/inputs/CustomInputs';
import { StyledSearchBar } from '../../components/inputs/SearchBar';
import { fetchRawMaterialApi } from '../../apis/rawMaterial.api';

const AddMaterialUiProduct = ({ fields, setFields, index, loading }) => {
    return (
        <Box mt={2}>
            {fields?.requiredRawMaterials?.length > 0 && fields.requiredRawMaterials.map((val, inx) => {
                if (!fields.requiredRawMaterials[inx]) return null;

                return (
                    <Box key={inx}>
                        
                        <PaddingBoxInDesktop mb={2} sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}  >
                            <AsyncDropDown
                            defaultVal={
                                fields.requiredRawMaterials
                                    ? {
                                        
                                        rawMaterialId: fields.requiredRawMaterials[inx].rawMaterialId,
                                        name: fields.requiredRawMaterials[inx].rawMaterialName,
                                    }
                                    : []
                            }
                                lazyFun={async (para) => await fetchRawMaterialApi({ ...para, allStatus: true })}
                                OptionComponent={({ option, ...rest }) => {
                                    return <ListItem {...rest}>{option.name}</ListItem >
                                }}
                                onChange={async (changedVal) => {
                                    const updatedrequiredRawMaterials = [...fields.requiredRawMaterials];
                                    updatedrequiredRawMaterials[inx] = {
                                        ...updatedrequiredRawMaterials[inx],
                                        rawMaterialId: changedVal ? changedVal._id : null,
                                        rawMaterialName:changedVal ? changedVal.name : null,
                                    };
                                    setFields({ ...fields, requiredRawMaterials: updatedrequiredRawMaterials });
                                }}

                                titleKey={'name'}
                                valueKey={"_id"}
                                InputComponent={(params) => <StyledSearchBar placeholder={"Select Material"} {...params} margin="none" />}
                            />
                        </PaddingBoxInDesktop>
                        <CustomInput
                            disabled={loading}
                            value={fields?.requiredRawMaterials[inx]?.quantity}
                            onChange={(e) => {
                                const updatedrequiredRawMaterials = [...fields.requiredRawMaterials];
                                updatedrequiredRawMaterials[inx] = {
                                    ...updatedrequiredRawMaterials[inx],
                                    quantity: e.target.value,
                                };
                                setFields({ ...fields, err: "", requiredRawMaterials: updatedrequiredRawMaterials });
                            }}
                            type="text"
                            label={"Quantity Required*"}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};


export default AddMaterialUiProduct