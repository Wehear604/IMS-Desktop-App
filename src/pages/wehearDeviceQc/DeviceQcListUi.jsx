import { Box, Grid,  Typography } from '@mui/material'
import React, { useState } from 'react'
import { DEVICES, DEVICES_NAME, LISTENING_SIDE, DOM_TYPE } from '../../utils/constants';
import AccordionDetailsUi from '../../components/layouts/common/AccordionDetailsUi';
import neckbandBlack from "../../assets/images/neckband.svg";
import itePrimeWhite from "../../assets/images/ITE_PRIME_WHITE.svg";
import iteOptimaBlack from "../../assets/images/ITE_OPTIMA_BLACK.svg";
import METALIC_RIC_OPTIMA from "../../assets/images/metalic_ric.svg";
import ric8WithoutDome from "../../assets/images/WITHOUT DOME.svg";
import BTE from "../../assets/images/bteOptima.svg";
import wehearox from "../../assets/images/wehearox.svg";
import SAFE_BUDS from "../../assets/images/safebuds.svg";
import wehear_2_0 from "../../assets/images/wehear 2 0.svg";
import AsyncSearchBar from '../../components/inputs/AsyncSearchBar';
import { useDispatch, useSelector } from 'react-redux';
import { DeviceSelectAction } from '../../store/actions/deviceDataAction';

const DeviceQcListUi = ({fields, setFields, filters, setFilters }) => {
    const deviceData = useSelector((state) => state.device);
    const [device, setDevice] = useState(deviceData?.device_type);
    const dispatch = useDispatch()
    const SuggestedProductData = (productType) => {
        const updateSuggestedProduct = (selectedDevice) => {
            setDevice(selectedDevice);
            setFields((prev) => ({
                ...prev,
                device: selectedDevice,
            }));
            dispatch(DeviceSelectAction(selectedDevice))
        };

        const baseConfig = {
            border: device === productType,
            backgroundColor: device === productType,
        };

        switch (productType) {
            case DEVICES.BTE_OPTIMA:
                return {
                    ...baseConfig,
                    src: BTE,
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.BTE_OPTIMA),
                };

            case DEVICES.BTE_PRIME:
                return {
                    ...baseConfig,
                    src: BTE,
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.BTE_PRIME),
                };

            case DEVICES.RIC_OPTIMA_8:
                return {
                    ...baseConfig,
                    src: ric8WithoutDome,
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.RIC_OPTIMA_8),
                };

            case DEVICES.RIC_OPTIMA:
                return {
                    ...baseConfig,
                    src: METALIC_RIC_OPTIMA,
                    sideColor: {
                        METALIC: "#C6C1C5",
                        BLACK: "#000000",
                        BEIGE: "#D6B19F",
                    },
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.RIC_OPTIMA),
                };

            case DEVICES.RIC_32:
                return {
                    ...baseConfig,
                    src: METALIC_RIC_OPTIMA,
                    sideColor: {
                        METALIC: "#C6C1C5",
                        BLACK: "#000000",
                        BEIGE: "#D6B19F",
                    },
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.RIC_32),
                };

            case DEVICES.ITE_OPTIMA:
                return {
                    ...baseConfig,
                    src: iteOptimaBlack,
                    sideColor: { BLACK: "#000000", WHITE: "#FFFFFF" },
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.ITE_OPTIMA),
                };

            case DEVICES.WEHEAR_OX:
                return {
                    ...baseConfig,
                    src: wehearox,
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.WEHEAR_OX),
                };
            case DEVICES.SAFE_BUDS:
                return {
                    ...baseConfig,
                    src: SAFE_BUDS,
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.SAFE_BUDS),
                };
            case DEVICES.WEHEAR_2_0:
                return {
                    ...baseConfig,
                    src: wehear_2_0,
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.WEHEAR_2_0),
                };
            case DEVICES.ITE_PRIME:
                return {
                    ...baseConfig,
                    src: itePrimeWhite,
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.ITE_PRIME),
                };

            case DEVICES.NECKBAND:
                return {
                    ...baseConfig,
                    src: neckbandBlack,
                    IsOnlyBoth: "OnlyBoth",
                    OnClickCenter: () => updateSuggestedProduct(DEVICES.NECKBAND),
                };

            default:
                return {};
        }
    };

    const deviceEntries = Object.entries(DEVICES).filter(([key, value]) => {
        const search = (filters.search || "").trim().toLowerCase();
        if (!search) return true;
        const name = (DEVICES_NAME[value] || "").toString().toLowerCase();
        const valStr = value.toString().toLowerCase();
        const keyStr = key.toString().toLowerCase();
        return name.includes(search) || valStr.includes(search) || keyStr.includes(search);
    });

    return (
        <Box mb={1} p={4} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h3" color={"primary"} fontWeight="bold">
                    Select Device for QC Test
                </Typography>

                <Box sx={{ width: "20vw" }}>
                    <AsyncSearchBar
                        fullWidth
                        title="Search for any Device"
                        size="small"
                        placeholder={"Search for any Device"}
                        defaultValue={filters.search}
                        onChange={(changedVal) => {
                            setFilters({
                                ...filters,
                                pageNo: 1,
                                pageSize: 10,
                                search: changedVal,
                            });
                        }}
                    />
                </Box>
            </Box>

            { <Box sx={{ flexGrow: 1, p: 2 }}>
                <Grid container spacing={2}>
                    {deviceEntries.map(([key, value], idx) => {
                        const data = SuggestedProductData(value);
                        return (
                            <Grid item xs={4} sm={3} md={2} key={`${value}-${idx}`}>
                                <AccordionDetailsUi
                                    side={data?.IsOnlyBoth ? data?.IsOnlyBoth : data?.side}
                                    setDevice={setDevice}
                                    Title={DEVICES_NAME[value]}
                                    setFields={setFields}
                                    sideColor={data?.sideColor}
                                    isBorder={data?.border}
                                    isBackgroundColor={data?.backgroundColor}
                                    img_src={data?.src}
                                    OnClickCenter={data?.OnClickCenter}
                                    device={value}
                                />
                            </Grid>
                        );
                    })}
                </Grid>

            </Box>}
        </Box>
    );
};

export default DeviceQcListUi
