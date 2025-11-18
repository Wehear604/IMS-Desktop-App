import React from 'react';
import CustomDialog from '../../components/layouts/common/CustomDialog';
import CustomInput from '../../components/inputs/CustomInputs';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { Autocomplete, Box, ListItem } from '@mui/material';
import { LOG_TYPE, MATERIAL_TYPE } from '../../utils/constants';
import { findObjectKeyByValue, titleCase } from '../../utils/main';
import moment from 'moment';
import { fetchRawMaterialApi } from '../../apis/rawMaterial.api';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import { StyledSearchBar } from '../../components/inputs/SearchBar';
import { FetchSKDApi } from '../../apis/skd.api';
import { FetchSFGApi } from '../../apis/sfg.api';
import { FetchFGApi, getFGItemCodeByIdApi } from '../../apis/FG.api';
import { fetchvendorApi } from '../../apis/vendor.api';
import QRCode from 'react-qr-code';


const GenerateQrCodeUi = ({ loading, qrRef, onSubmit, fields, setFields, qrCodeImage, QRCodes }) => {

    const materialtype = Object.keys(MATERIAL_TYPE)?.map((key) => ({
        label: titleCase(key),
        _id: MATERIAL_TYPE[key]
    }));
    const logType = Object.keys(LOG_TYPE)?.map((key) => ({
        label: titleCase(key),
        _id: LOG_TYPE[key]
    }));

    console.log('Render GenerateQrCodeUi with fields:', fields);

    const fetchMaterialDetailsById = async (id) => {
        try {
            const response = await getFGItemCodeByIdApi({ id });
            return response.data;
        } catch (error) {
            console.error("Error fetching material details:", error);
            return {};
        }
    };

    return (
        <CustomDialog
            id={'qrCode'}
            loading={loading}
            err={fields.err}
            onSubmit={onSubmit}
            title={'Generate QR Code'}
            closeText={'Close'}
            confirmText={QRCodes ? "Download" : 'Generate'}
        >
            {QRCodes ? (
                <Box p={2} ref={qrRef} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>

                    <QRCode
                        size={90}
                        style={{ height: "auto", width: "50%" }}
                        value={fields?._id ?? ""}
                        viewBox={`0 0 100 100`}
                    />
                </Box>) : (
                <>
                    <Box
                        width={'100%'}
                        gap={2}
                        display={'flex'}
                        flexDirection={'row'}
                        justifyContent={'space-between'}
                        alignItems={'center'}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, width: '50%' }}>
                            <DesktopDatePicker
                                disabled={loading}
                                inputFormat="DD-MM-yyyy"
                                value={moment(fields?.date ?? null)}
                                onChange={(changedVal) => {
                                    console.log('Date changed:', changedVal);
                                    setFields({ ...fields, err: '', date: changedVal });
                                }}
                                renderInput={(props) => <CustomInput {...props} sx={{ height: '56px' }} />}
                                type="date"
                                label={'Date*'}
                            />
                        </Box>

                        <Box mt={1} sx={{ width: '50%' }}>
                            <Autocomplete
                                disableClearable
                                options={materialtype}
                                value={findObjectKeyByValue(fields?.materialType, MATERIAL_TYPE)}
                                onChange={(e, newVal) => {
                                    console.log('Material type changed:', newVal);
                                    setFields({ ...fields, materialType: newVal ? newVal._id : null });
                                }}
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    '*': { display: 'flex', justifyContent: 'center' }
                                }}
                                renderInput={(params) => (
                                    <CustomInput
                                        placeholder="Select Material Type*"
                                        {...params}
                                        label="Select Material Type*"
                                        margin="dense"
                                    />
                                )}
                            />
                        </Box>
                    </Box>

                    <Box mt={1}>
                        {fields?.materialType === 1 && (
                            <AsyncDropDown
                                defaultVal={
                                    fields?.materialId
                                        ? { _id: fields?.materialId?._id, name: fields?.materialId?.name }
                                        : null
                                }
                                lazyFun={async (para) => {
                                    console.log('Fetching Raw Material options with:', para);
                                    return await fetchRawMaterialApi({ ...para, allStatus: true });
                                }}
                                OptionComponent={({ option, ...rest }) => <ListItem {...rest}>{option?.name}</ListItem>}
                                value={fields?.materialId}
                                onChange={async (changedVal) => {
                                    if (changedVal) {
                                        try {
                                            const materialDetails = await fetchMaterialDetailsById(changedVal._id);
                                            const pricePerUnit = materialDetails?.price_per_unit;
                                            const quantity = Number(fields?.quantity) || 0;
                                            setFields((prevFields) => ({
                                                ...prevFields,
                                                materialId: changedVal._id,
                                                itemCode: materialDetails?.code || "",
                                                pricePerUnits: pricePerUnit,
                                                amount: pricePerUnit * quantity,
                                            }));
                                        } catch (error) {
                                            console.error("Error fetching material details:", error);
                                        }
                                    } else {
                                        setFields((prevFields) => ({
                                            ...prevFields,
                                            materialId: null,
                                            itemCode: "",
                                            pricePerUnits: 0,
                                            amount: 0,
                                        }));
                                    }
                                }}
                                titleKey={'name'}
                                valueKey={'_id'}
                                InputComponent={(params) => (
                                    <CustomInput
                                        {...params}
                                        label="Select RawMaterial*"
                                        placeholder="Select RawMaterial*"
                                        margin="dense"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        )}

                        {fields?.materialType === 2 && (
                            <AsyncDropDown
                                defaultVal={
                                    fields?.materialId
                                        ? { _id: fields?.materialId?._id, name: fields?.materialId?.name }
                                        : null
                                }
                                lazyFun={async (para) => {
                                    console.log('Fetching SKD options with:', para);
                                    return await FetchSKDApi({ ...para, allStatus: true });
                                }}
                                OptionComponent={({ option, ...rest }) => <ListItem {...rest}>{option?.name}</ListItem>}
                                value={fields?.materialId}
                                onChange={async (changedVal) => {
                                    if (changedVal) {
                                        try {
                                            const materialDetails = await fetchMaterialDetailsById(changedVal._id);
                                            setFields((prevFields) => ({
                                                ...prevFields,
                                                materialId: changedVal._id,
                                                itemCode: materialDetails?.code || "",
                                                // pricePerUnits: pricePerUnit,
                                                // amount: pricePerUnit * quantity,
                                            }));
                                        } catch (error) {
                                            console.error("Error fetching material details:", error);
                                        }
                                    } else {
                                        setFields((prevFields) => ({
                                            ...prevFields,
                                            materialId: null,
                                            itemCode: "",
                                            // pricePerUnits: 0,
                                            // amount: 0,
                                        }));
                                    }
                                }}
                                titleKey={'name'}
                                valueKey={'_id'}
                                InputComponent={(params) => (
                                    <CustomInput
                                        {...params}
                                        label="Select Semi Knocked Down (SKD)*"
                                        placeholder="Select Semi Knocked Down (SKD)*"
                                        margin="dense"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        )}

                        {fields?.materialType === 3 && (
                            <AsyncDropDown
                                defaultVal={
                                    fields?.materialId
                                        ? { _id: fields?.materialId?._id, name: fields?.materialId?.name }
                                        : null
                                }
                                lazyFun={async (para) => {
                                    console.log('Fetching SFG options with:', para);
                                    return await FetchSFGApi({ ...para, allStatus: true });
                                }}
                                OptionComponent={({ option, ...rest }) => <ListItem {...rest}>{option?.name}</ListItem>}
                                value={fields?.materialId}
                                onChange={async (changedVal) => {
                                    if (changedVal) {
                                        try {
                                            const materialDetails = await fetchMaterialDetailsById(changedVal._id);
                                            setFields((prevFields) => ({
                                                ...prevFields,
                                                materialId: changedVal._id,
                                                itemCode: materialDetails?.code || "",
                                                // pricePerUnits: pricePerUnit,
                                                // amount: pricePerUnit * quantity,
                                            }));
                                        } catch (error) {
                                            console.error("Error fetching material details:", error);
                                        }
                                    } else {
                                        setFields((prevFields) => ({
                                            ...prevFields,
                                            materialId: null,
                                            itemCode: "",
                                            // pricePerUnits: 0,
                                            // amount: 0,
                                        }));
                                    }
                                }}
                                titleKey={'name'}
                                valueKey={'_id'}
                                InputComponent={(params) => (
                                    <CustomInput
                                        {...params}
                                        label="Select Semi-Finished Goods (SFG)*"
                                        placeholder="Select Semi-Finished Goods (SFG)*"
                                        margin="dense"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        )}

                        {fields?.materialType === 4 && (
                            <AsyncDropDown
                                defaultVal={
                                    fields?.materialId
                                        ? { _id: fields?.materialId?._id, name: fields?.materialId?.name }
                                        : null
                                }
                                lazyFun={async (para) => {
                                    console.log('Fetching FG options with:', para);
                                    return await FetchFGApi({ ...para, allStatus: true });
                                }}
                                OptionComponent={({ option, ...rest }) => <ListItem {...rest}>{option?.name}</ListItem>}
                                value={fields?.materialId}
                                onChange={async (changedVal) => {
                                    if (changedVal) {
                                        try {
                                            const materialDetails = await fetchMaterialDetailsById(changedVal._id);
                                            const pricePerUnit = materialDetails?.price_per_unit;
                                            const quantity = Number(fields?.quantity) || 0;
                                            setFields((prevFields) => ({
                                                ...prevFields,
                                                materialId: changedVal._id,
                                                itemCode: materialDetails?.code || "",
                                                pricePerUnits: pricePerUnit,
                                                amount: pricePerUnit * quantity,
                                            }));
                                        } catch (error) {
                                            console.error("Error fetching material details:", error);
                                        }
                                    } else {
                                        setFields((prevFields) => ({
                                            ...prevFields,
                                            materialId: null,
                                            itemCode: "",
                                            pricePerUnits: 0,
                                            amount: 0,
                                        }));
                                    }
                                }}
                                titleKey={'name'}
                                valueKey={'_id'}
                                InputComponent={(params) => (
                                    <CustomInput
                                        {...params}
                                        label="Select Finished Goods (FG)*"
                                        placeholder="Select Finished Goods (FG)*"
                                        margin="dense"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        )}
                    </Box>

                    <Box mt={1}>
                        <Autocomplete
                            disableClearable
                            disabled={true}
                            options={logType}
                            value={findObjectKeyByValue(fields.logType, LOG_TYPE)}
                            onChange={(e, newVal) => {
                                console.log('Log Type changed:', newVal);
                                setFields({ ...fields, logType: newVal ? newVal._id : null });
                            }}
                            sx={{ width: '100%', display: 'flex', '*': { display: 'flex', justifyContent: 'center' } }}
                            renderInput={(params) => (
                                <CustomInput
                                    placeholder="Select Log Type*"
                                    {...params}
                                    label="Select Log Type*"
                                    margin="dense"
                                />
                            )}
                        />
                    </Box>

                    <Box mt={1}>
                        <CustomInput
                            disabled={loading}
                            value={fields.quantity}
                            onChange={(e) => {
                                console.log('Quantity changed:', e.target.value);
                                setFields({ ...fields, err: '', quantity: e.target.value });
                            }}
                            type="text"
                            label={'Quantity*'}
                        />
                    </Box>

                    <Box mt={1}>
                        <CustomInput
                            disabled={loading}
                            value={fields.amount}
                            onChange={(e) => {
                                console.log('Amount changed:', e.target.value);
                                setFields({ ...fields, err: '', amount: e.target.value });
                            }}
                            type="text"
                            label={'Amount'}
                        />
                    </Box>

                    <Box mt={1}>
                        <CustomInput
                            disabled={loading}
                            value={fields.itemCode}
                            onChange={(e) => {
                                console.log('Item Code changed:', e.target.value);
                                setFields({ ...fields, err: '', itemCode: e.target.value });
                            }}
                            type="text"
                            label={'Item Code*'}
                        />
                    </Box>

                    {(fields?.materialType === 1 && fields.logType === LOG_TYPE.In) && <Box mt={1}>
                        <AsyncDropDown
                            defaultVal={
                                fields.vendorId
                                    ? { _id: fields.vendorId?._id, name: fields.vendorId?.name }
                                    : null
                            }
                            lazyFun={async (para) => {
                                console.log('Fetching vendor options with:', para);
                                return await fetchvendorApi({ ...para, allStatus: true });
                            }}
                            OptionComponent={({ option, ...rest }) => <ListItem {...rest}>{option.name}</ListItem>}
                            value={fields?.vendorId}
                            onChange={async (changedVal) => {
                                console.log('Vendor selected:', changedVal);
                                setFields({ ...fields, vendorId: changedVal ? changedVal._id : null });
                            }}
                            titleKey={'name'}
                            valueKey={'_id'}
                            InputComponent={(params) => (
                                <CustomInput
                                    {...params}
                                    label="Select Vendor"
                                    placeholder="Select Vendor"
                                    margin="dense"
                                    InputLabelProps={{ shrink: true }}
                                />
                            )}
                        />
                    </Box>}
                </>)}
        </CustomDialog>
    );
};

export default GenerateQrCodeUi;
