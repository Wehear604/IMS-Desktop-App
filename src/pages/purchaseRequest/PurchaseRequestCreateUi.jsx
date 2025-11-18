import React from 'react'
import CustomDialog from '../../components/layouts/common/CustomDialog'
import CustomInput from '../../components/inputs/CustomInputs'
import { DesktopDatePicker } from '@mui/x-date-pickers'
import { Autocomplete, Box, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel, ListItem, OutlinedInput } from '@mui/material'
import { LOG_TYPE, MATERIAL_TYPE } from '../../utils/constants'
import { findObjectKeyByValue, titleCase } from '../../utils/main'
import moment from 'moment'
import { fetchRawMaterialApi } from '../../apis/rawMaterial.api'
import AsyncDropDown from '../../components/inputs/AsyncDropDown'
import { StyledSearchBar } from '../../components/inputs/SearchBar'
import { FetchSKDApi } from '../../apis/skd.api'
import { FetchSFGApi } from '../../apis/sfg.api'
import { FetchFGApi } from '../../apis/FG.api'
import { CenteredBox } from '../../components/layouts/OneViewBox'
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop'
import { fetchCategoryApi } from '../../apis/category.api'

const PurchaseRequestCreateUi = ({ id, loading, onSubmit, fields, setFields, isview }) => {
    let materialtype = [...Object.keys(MATERIAL_TYPE)?.map((key) => ({ label: titleCase(key), _id: MATERIAL_TYPE[key] }))]

    return (
        <CustomDialog
            id={"purchase"}
            loading={loading}
            err={fields.err}
            onSubmit={onSubmit}
            title={isview ? "View Material Request" : "Material Request"}
            closeText={"Close"}
            confirmText={isview ? undefined : "Create"}
        >
            {(loading && <CenteredBox><CircularProgress /></CenteredBox>)}

            <Box width={"100%"} gap={2} display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, width: '50%', pt: 2, pb: 2 }}>
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
                </Box>

                <Box mt={1} sx={{ width: '50%' }}>
                    <Autocomplete
                        disableClearable
                        options={materialtype}
                        value={findObjectKeyByValue(fields?.materialType, MATERIAL_TYPE)}
                        onChange={(e, newVal) => {
                            setFields({ ...fields, materialType: newVal ? newVal._id : null, materialId: null, materialName: null })
                        }}
                        sx={{ width: "100%", display: "flex", "*": { display: "flex", justifyContent: "center" } }}
                        renderInput={(params) => <CustomInput placeholder="Select Material Type*" {...params} label="Select Material Type*" margin="dense" disabled={isview} />}
                        disabled={isview}
                    />
                </Box>
            </Box>

            <Box mt={1}>
                {fields?.materialType == 1 && <AsyncDropDown
                    Value={fields?.materialName ? {
                        _id: fields?.materialIds?._id,
                        name: fields?.materialName,
                    } : null}
                    lazyFun={async (para) => await fetchRawMaterialApi({ ...para, allStatus: true })}
                    OptionComponent={({ option, ...rest }) => {
                        return <ListItem {...rest}>{option?.name} {`(${option?.mpn})`}</ListItem >
                    }}
                    onChange={async (changedVal) => {
                        setFields({
                            ...fields,
                            materialId: changedVal ? changedVal?._id : null,
                            materialName: changedVal
                                ? `${changedVal?.name ?? ""} (${changedVal?.mpn ?? ""})`.trim()
                                : null,
                        });
                    }}
                    titleKey={'name'}
                    valueKey={"_id"}
                    InputComponent={(params) => <CustomInput
                        {...params}
                        label="Select Raw Material*"
                        placeholder="Select Raw Material*"
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        disabled={isview}
                    />}
                    disabled={isview}
                />}

                {fields?.materialType === 2 && <AsyncDropDown
                    defaultVal={
                        fields?.materialId ? {
                            _id: fields?.materialId?._id ? fields?.materialId?._id : fields?.materialId,
                            name: fields?.materialId?.name ? fields?.materialId?.name : fields?.materialname,
                        }
                            : null
                    }
                    lazyFun={async (para) => await FetchSKDApi({ ...para, allStatus: true })}
                    OptionComponent={({ option, ...rest }) => {
                        return <ListItem {...rest}>{option?.name}</ListItem >
                    }}
                    value={fields?.materialname}
                    onChange={async (changedVal) => {
                        setFields({ ...fields, materialId: changedVal ? changedVal?._id : null, materialname: changedVal ? changedVal?.name : null });
                    }}
                    titleKey={'name'}
                    valueKey={"_id"}
                    InputComponent={(params) => <CustomInput
                        {...params}
                        label="Select Semi-Knocked Down (SKD)*"
                        placeholder="Select Semi-Knocked Down (SKD)*"
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        disabled={isview}
                    />}
                    disabled={isview}
                />}

                {fields?.materialType === 3 && <AsyncDropDown
                    Value={
                        fields?.materialName ? {
                            _id: fields?.materialId?._id ? fields?.materialId?._id : fields?.materialId,
                            name: fields?.materialName,
                        }
                            : null
                    }
                    lazyFun={async (para) => await FetchSFGApi({ ...para, allStatus: true })}
                    OptionComponent={({ option, ...rest }) => {
                        return <ListItem {...rest}>{option?.name} {`(${option?.mpn})`}</ListItem >
                    }}
                    // value={fields?.materialname}
                    onChange={async (changedVal) => {
                        setFields({
                            ...fields,
                            materialId: changedVal ? changedVal?._id : null,
                            materialName: changedVal
                                ? `${changedVal?.name ?? ""} (${changedVal?.mpn ?? ""})`.trim()
                                : null,
                        });
                    }}
                    titleKey={'name'}
                    valueKey={"_id"}
                    InputComponent={(params) => <CustomInput
                        {...params}
                        label="Select Semi-Finished Goods (SFG)*"
                        placeholder="Select Semi-Finished Goods (SFG)*"
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        disabled={isview}
                    />}
                    disabled={isview}
                />}

                {fields?.materialType === 4 && <AsyncDropDown
                    defaultVal={
                        fields?.materialId ? {
                            _id: fields?.materialId?._id ? fields?.materialId?._id : fields?.materialId,
                            name: fields?.materialId?.name ? fields?.materialId?.name : fields?.materialname,
                        }
                            : null
                    }
                    lazyFun={async (para) => await FetchFGApi({ ...para, allStatus: true })}
                    OptionComponent={({ option, ...rest }) => {
                        return <ListItem {...rest}>{option?.name}</ListItem >
                    }}
                    value={fields?.materialname}
                    onChange={async (changedVal) => {
                        setFields({ ...fields, materialId: changedVal ? changedVal?._id : null, materialname: changedVal ? changedVal?.name : null });
                    }}
                    titleKey={'name'}
                    valueKey={"_id"}
                    InputComponent={(params) => <CustomInput
                        {...params}
                        label="Select Finished Goods (FG)*"
                        placeholder="Select Finished Goods (FG)*"
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        disabled={isview}
                    />}
                    disabled={isview}
                />}
            </Box>

            {
                <CustomInput
                    disabled={loading || isview}
                    value={fields?.quantity}
                    onChange={(e) => setFields({ ...fields, err: '', quantity: e.target.value })}
                    type="text"
                    label={"Quantity*"}
                />
            }
            {
                <CustomInput
                    disabled={loading || isview}
                    value={fields?.reason}
                    onChange={(e) => setFields({ ...fields, err: '', reason: e.target.value })}
                    type="text"
                    label={"Reason*"}
                />
            }

        </CustomDialog >
    )
}

export default PurchaseRequestCreateUi