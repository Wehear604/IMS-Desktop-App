import { Box, Button, ButtonGroup, Grid, styled, Typography } from '@mui/material'
import React, { useState } from 'react'
import { DEVICES, DEVICES_NAME, LISTENING_SIDE, DOM_TYPE } from '../../utils/constants';
import AccordionDetailsUi from '../../components/layouts/common/AccordionDetailsUi';
import neckbandBlack from "../../assets/images/neckband.svg";
import itePrimeWhite from "../../assets/images/ITE_PRIME_WHITE.svg";
import iteOptimaBlack from "../../assets/images/ITE_OPTIMA_BLACK.svg";
import METALIC_RIC_OPTIMA from "../../assets/images/metalic_ric.svg";
import ric8WithoutDome from "../../assets/images/WITHOUT DOME.svg";
import BTE from "../../assets/images/bte.png";
import wehearox from "../../assets/images/wehearox.svg";
import SAFE_BUDS from "../../assets/images/safebuds.svg";
import wehear_2_0 from "../../assets/images/wehear 2 0.svg";
import LEFT from "../../assets/images/Frame 34481 (1).png";
import RIGHT from "../../assets/images/Frame 34483 (1).png";
import { useLocation } from 'react-router-dom';
import CoonectDeviceModule from '../../components/bluetooth/CoonectDeviceModule';
import { useDispatch } from 'react-redux';
import SubmitButton from '../../components/button/SubmitButton';
import { connectDevice, disconnectDevice } from '../../store/actions/commonAction';

const Header = styled(Box)(({ theme }) => ({
    border: "1px solid " + theme.palette.primary.main,
    padding: theme.spacing(2),
    background: theme.palette.secondary.main,
    borderTopLeftRadius: theme.shape.borderRadius * 2,
    borderBottom: "0px",
    borderTopRightRadius: theme.shape.borderRadius * 2,
    width: "100%",
}));
const Body = styled(Box)(({ theme }) => ({
    border: "1px solid " + theme.palette.primary.main,
    padding: theme.spacing(2),

    marginBottom: theme.spacing(2),

    borderBottomLeftRadius: theme.shape.borderRadius * 2,
    borderBottomRightRadius: theme.shape.borderRadius * 2,
    width: "100%",
}));

const ConnectButton = ({ connected, onClick, disconnect }) => {

    return (
        <SubmitButton
            // loading={loading}
            // disabled={loading}
            variant="outlined"
            onClick={onClick}
            title={"Connect"}
            style={{ backgroundColor: "white" }}
        />
    );

};

const DeviceQcListUi = ({ data, fields, setFields }) => {
    const { state } = useLocation();
    const dispatch = useDispatch();
    const [isConnecting, setIsConnecting] = useState(false);
    const [suggestedProduct, setSuggestedProduct] = useState([]);
    // const [device, setDevice] = useState(fields?.device);
    const [selectButton, setselectButton] = useState("All_Devices");
    const [hasLoss, setHasLoss] = useState();
    const [value, setValue] = useState(0);
    const [values, setValues] = useState(0);
    const [values1, setValues1] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [hovered1, setHovered1] = useState(false);
    const [hovered2, setHovered2] = useState(false);
    const [hovered3, setHovered3] = useState(false);
    const [hovered4, setHovered4] = useState(false);
    const [hovered5, setHovered5] = useState(false);
    const [hovered6, setHovered6] = useState(false);
    const [hovered7, setHovered7] = useState(false);
    const [hovered8, setHovered8] = useState(false);
    const [hovered9, setHovered9] = useState(false);
    const [hovered10, setHovered10] = useState(false);
    const [hovered11, setHovered11] = useState(false);
    const [hovered12, setHovered12] = useState(false);
    // const [expanded, setExpanded] = useState(
    //     fields.left_fitted_device.selected
    //         ? SELECTED_DEVICE_PANEL[fields.left_fitted_device.device_type]
    //         : SELECTED_DEVICE_PANEL[fields.right_fitted_device.device_type]
    // );

    const [selectedTube, setSelectedTube] = useState(
        fields?.right_fitted_device?.device_tube
    );
    const [selectedDome, setSelectedDome] = useState(
        fields?.right_fitted_device?.dom_type
    );
    const [selectedTubeLeft, setSelectedTubeLeft] = useState(
        fields?.left_fitted_device?.device_tube
    );
    const [selectedDomeLeft, setSelectedDomeLeft] = useState(
        fields?.left_fitted_device?.dom_type
    );

    const [selectDevice, setSelectDevice] = useState(state ? state : null);
    // useEffect(() => {
    //     if (!expanded && suggestedProduct?.length === 0) {
    //         setExpanded("panel1");
    //     } else {
    //         setExpanded(expanded);
    //     }
    // }, [suggestedProduct])

    // React.useEffect(() => {
    //     setSelectedSide(selectDevice);
    // }, [selectDevice]);

    const [device, setDevice] = useState(
        state
            ? state === LISTENING_SIDE.LEFT
                ? fields?.left_fitted_device?.device_type
                    ? fields?.left_fitted_device?.device_type
                    : // : fields.left_fitted_device.selected
                    // ? DEVICES.BTE_PRIME
                    null
                : fields?.right_fitted_device?.device_type
                    ? fields?.right_fitted_device?.device_type
                    : // : fields.right_fitted_device.selected
                    // ? DEVICES.BTE_PRIME
                    null
            : null
    );

    const [suggestedDom, setSuggestedDom] = useState({
        leftdom: "",
        rightdom: "",
        lefttude: "",
        righttude: "",
        device: "",
        rightdevice: null,
        leftdevice: null,
        selectButton: selectButton,
        Manually: {
            is_Left_Dome_Manually: false,
            is_Left_Dome_Device: null,

            is_Righ_Dome_Manually: false,
            is_Righ_Dome_Device: null,

            is_Left_Tube_Manually: false,
            is_Left_Tube_Device: null,

            is_Right_Tube_Manually: false,
            is_Right_Tube_Device: null,
        }
    });



    const handleMouseOver = () => {
        setHovered(true);
    };

    const handleMouseOut = () => {
        setHovered(false);
    };

    const handleMouseOver1 = () => {
        setHovered1(true);
    };

    const handleMouseOut1 = () => {
        setHovered1(false);
    };



    const handleMouseOver4 = () => {
        setHovered4(true);
    };

    const handleMouseOut4 = () => {
        setHovered4(false);
    };

    const handleMouseOver5 = () => {
        setHovered5(true);
    };

    const handleMouseOut5 = () => {
        setHovered5(false);
    };

    const handleMouseOver6 = () => {
        setHovered6(true);
    };

    const handleMouseOut6 = () => {
        setHovered6(false);
    };

    const handleMouseOver7 = () => {
        setHovered7(true);
    };

    const handleMouseOut7 = () => {
        setHovered7(false);
    };

    const handleMouseOver8 = () => {
        setHovered8(true);
    };

    const handleMouseOut8 = () => {
        setHovered8(false);
    };

    const handleMouseOver9 = () => {
        setHovered9(true);
    };

    const handleMouseOut9 = () => {
        setHovered9(false);
    };

    const handleMouseOver10 = () => {
        setHovered10(true);
    };

    const handleMouseOut10 = () => {
        setHovered10(false);
    };

    const handleMouseOver11 = () => {
        setHovered11(true);
    };

    const handleMouseOut11 = () => {
        setHovered11(false);
    };

    const handleMouseOver12 = () => {
        setHovered12(true);
    };

    const handleMouseOut12 = () => {
        setHovered12(false);
    };

    // const SuggestedProductData = (productType) => {
    //     const updateSuggestedProduct = (selectedDevice) => {
    //         setDevice(selectedDevice);
    //         setFields((prev) => ({
    //             ...prev,
    //             device: selectedDevice,
    //             suggestedProduct: selectButton === "Suggested_Devices" ? suggestedProduct.map((item) => item?.product) : [selectedDevice],
    //             has_hearing_loss: hasLoss
    //         }));
    //     };

    //     const baseConfig = {
    //         border: device === productType,
    //         backgroundColor: device === productType,
    //     };

    //     switch (productType) {
    //         case DEVICES.BTE_OPTIMA:
    //             return {
    //                 ...baseConfig,
    //                 src: BTE,
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.BTE_OPTIMA),
    //             };

    //         case DEVICES.BTE_PRIME:
    //             return {
    //                 ...baseConfig,
    //                 src: BTE,
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.BTE_PRIME),
    //             };

    //         case DEVICES.RIC_OPTIMA_8:
    //             return {
    //                 ...baseConfig,
    //                 src: ric8WithoutDome,
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.RIC_OPTIMA_8),
    //             };

    //         case DEVICES.RIC_OPTIMA:
    //             return {
    //                 ...baseConfig,
    //                 src: METALIC_RIC_OPTIMA,
    //                 sideColor: {
    //                     METALIC: "#C6C1C5",
    //                     BLACK: "#000000",
    //                     BEIGE: "#D6B19F",
    //                 },
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.RIC_OPTIMA),
    //             };

    //         case DEVICES.RIC_32:
    //             return {
    //                 ...baseConfig,
    //                 src: METALIC_RIC_OPTIMA,
    //                 sideColor: {
    //                     METALIC: "#C6C1C5",
    //                     BLACK: "#000000",
    //                     BEIGE: "#D6B19F",
    //                 },
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.RIC_32),
    //             };

    //         case DEVICES.ITE_OPTIMA:
    //             return {
    //                 ...baseConfig,
    //                 src: iteOptimaBlack,
    //                 sideColor: { BLACK: "#000000", WHITE: "#FFFFFF" },
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.ITE_OPTIMA),
    //             };

    //         case DEVICES.WEHEAR_OX:
    //             return {
    //                 ...baseConfig,
    //                 src: wehearox,
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.WEHEAR_OX),
    //             };
    //         case DEVICES.SAFE_BUDS:
    //             return {
    //                 ...baseConfig,
    //                 src: SAFE_BUDS,
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.SAFE_BUDS),
    //             };
    //         case DEVICES.WEHEAR_2_0:
    //             return {
    //                 ...baseConfig,
    //                 src: wehear_2_0,
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.WEHEAR_2_0),
    //             };
    //         case DEVICES.ITE_PRIME:
    //             return {
    //                 ...baseConfig,
    //                 src: itePrimeWhite,
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.ITE_PRIME),
    //             };

    //         case DEVICES.NECKBAND:
    //             return {
    //                 ...baseConfig,
    //                 src: neckbandBlack,
    //                 IsOnlyBoth: "OnlyBoth",
    //                 OnClickCenter: () => updateSuggestedProduct(DEVICES.NECKBAND),
    //             };

    //         default:
    //             return {};
    //     }
    // };

    const SuggestedProductData = (productType) => {
        switch (productType) {
            case DEVICES.BTE_OPTIMA:
                return {
                    border: device === DEVICES.BTE_OPTIMA,
                    backgroundColor: device === DEVICES.BTE_OPTIMA,
                    onMouseOver: handleMouseOver,
                    onMouseOut: handleMouseOut,
                    src: BTE,
                    hovered: hovered,
                    OnClickRight: () => {
                        setSelectDevice(LISTENING_SIDE.RIGHT);
                        setDevice(DEVICES.BTE_OPTIMA);
                        setSelectedDome(
                            selectedDome === DOM_TYPE.VENTED ||
                                selectedDome === DOM_TYPE.TULIP
                                ? null
                                : selectedDome
                        );
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.BTE_OPTIMA,
                                dom_type:
                                    selectedDome === DOM_TYPE.VENTED ||
                                        selectedDome === DOM_TYPE.TULIP
                                        ? null
                                        : selectedDome,
                            },
                        });
                    },

                    OnClickCenter: () => {
                        setSelectDevice(LISTENING_SIDE.BOTH);
                        setDevice(DEVICES.BTE_OPTIMA);
                        setSelectedDome(
                            selectedDome === DOM_TYPE.VENTED ||
                                selectedDome === DOM_TYPE.TULIP
                                ? null
                                : selectedDome
                        );
                        setSelectedDomeLeft(
                            selectedDomeLeft === DOM_TYPE.VENTED ||
                                selectedDomeLeft === DOM_TYPE.TULIP
                                ? null
                                : selectedDomeLeft
                        );
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.BTE_OPTIMA,
                                dom_type:
                                    selectedDome === DOM_TYPE.VENTED ||
                                        selectedDome === DOM_TYPE.TULIP
                                        ? null
                                        : selectedDome,
                            },
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.BTE_OPTIMA,
                                dom_type:
                                    selectedDomeLeft === DOM_TYPE.VENTED ||
                                        selectedDomeLeft === DOM_TYPE.TULIP
                                        ? null
                                        : selectedDomeLeft,
                            },
                        });
                    },

                    OnClickLeft: () => {
                        setSelectDevice(LISTENING_SIDE.LEFT);
                        setDevice(DEVICES.BTE_OPTIMA);
                        setSelectedDomeLeft(
                            selectedDomeLeft === DOM_TYPE.VENTED ||
                                selectedDomeLeft === DOM_TYPE.TULIP
                                ? null
                                : selectedDomeLeft
                        );
                        setFields({
                            ...fields,
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.BTE_OPTIMA,
                                dom_type:
                                    selectedDomeLeft === DOM_TYPE.VENTED ||
                                        selectedDomeLeft === DOM_TYPE.TULIP
                                        ? null
                                        : selectedDomeLeft,
                            },
                        });
                    },
                };

            case DEVICES.BTE_PRIME:
                return {
                    border: device === DEVICES.BTE_PRIME,
                    backgroundColor: device === DEVICES.BTE_PRIME,
                    onMouseOver: handleMouseOver1,
                    onMouseOut: handleMouseOut1,
                    src: BTE,
                    hovered: hovered1,

                    OnClickRight: () => {
                        setSelectDevice(LISTENING_SIDE.RIGHT);
                        setDevice(DEVICES.BTE_PRIME);
                        setSelectedDome(
                            selectedDome == DOM_TYPE.VENTED || selectedDome == DOM_TYPE.TULIP
                                ? null
                                : selectedDome
                        );
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.BTE_PRIME,
                                dom_type:
                                    selectedDome == DOM_TYPE.VENTED ||
                                        selectedDome == DOM_TYPE.TULIP
                                        ? null
                                        : selectedDome,
                            },
                        });
                    },

                    OnClickCenter: () => {
                        setSelectDevice(LISTENING_SIDE.BOTH);
                        setDevice(DEVICES.BTE_PRIME);
                        setSelectedDome(
                            selectedDome == DOM_TYPE.VENTED || selectedDome == DOM_TYPE.TULIP
                                ? null
                                : selectedDome
                        );
                        setSelectedDomeLeft(
                            selectedDome == DOM_TYPE.VENTED || selectedDome == DOM_TYPE.TULIP
                                ? null
                                : selectedDome
                        );
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.BTE_PRIME,
                                dom_type:
                                    selectedDome == DOM_TYPE.VENTED ||
                                        selectedDome == DOM_TYPE.TULIP
                                        ? null
                                        : selectedDome,
                            },
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.BTE_PRIME,
                                dom_type:
                                    selectedDome == DOM_TYPE.VENTED ||
                                        selectedDome == DOM_TYPE.TULIP
                                        ? null
                                        : selectedDome,
                            },
                        });
                    },

                    OnClickLeft: () => {
                        setSelectDevice(LISTENING_SIDE.LEFT);
                        setDevice(DEVICES.BTE_PRIME);
                        setSelectedDomeLeft(
                            selectedDomeLeft == DOM_TYPE.VENTED ||
                                selectedDomeLeft == DOM_TYPE.TULIP
                                ? null
                                : selectedDomeLeft
                        );
                        setFields({
                            ...fields,
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.BTE_PRIME,
                                dom_type:
                                    selectedDomeLeft == DOM_TYPE.VENTED ||
                                        selectedDomeLeft == DOM_TYPE.TULIP
                                        ? null
                                        : selectedDomeLeft,
                            },
                        });
                    },
                };

            case DEVICES.RIC_OPTIMA_8:
                return {
                    border: device === DEVICES.RIC_OPTIMA_8,
                    backgroundColor: device === DEVICES.RIC_OPTIMA_8,
                    onMouseOver: handleMouseOver4,
                    onMouseOut: handleMouseOut4,
                    src: ric8WithoutDome,
                    hovered: hovered4,

                    OnClickRight: () => {
                        setSelectDevice(LISTENING_SIDE.RIGHT);
                        setDevice(DEVICES.RIC_OPTIMA_8);
                        setSelectedDome(
                            selectedDome == DOM_TYPE.EAR_MOLD ||
                                selectedDome == DOM_TYPE.TULIP
                                ? null
                                : selectedDome
                        );
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.RIC_OPTIMA_8,
                                device_dome:
                                    selectedDome == DOM_TYPE.EAR_MOLD ||
                                        selectedDome == DOM_TYPE.TULIP
                                        ? null
                                        : selectedDome,
                            },
                        });
                    },

                    OnClickCenter: () => {
                        setSelectDevice(LISTENING_SIDE.BOTH);
                        setDevice(DEVICES.RIC_OPTIMA_8);
                        setSelectedDome(
                            selectedDome == DOM_TYPE.EAR_MOLD ||
                                selectedDome == DOM_TYPE.TULIP
                                ? null
                                : selectedDome
                        );
                        setSelectedDomeLeft(
                            selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                selectedDomeLeft == DOM_TYPE.TULIP
                                ? null
                                : selectedDomeLeft
                        );
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.RIC_OPTIMA_8,
                                device_dome:
                                    selectedDome == DOM_TYPE.EAR_MOLD ||
                                        selectedDome == DOM_TYPE.TULIP
                                        ? null
                                        : selectedDome,
                            },
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.RIC_OPTIMA_8,
                                device_dome:
                                    selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                        selectedDomeLeft == DOM_TYPE.TULIP
                                        ? null
                                        : selectedDomeLeft,
                            },
                        });
                    },

                    OnClickLeft: () => {
                        setSelectDevice(LISTENING_SIDE.LEFT);
                        setDevice(DEVICES.RIC_OPTIMA_8);
                        setSelectedDomeLeft(
                            selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                selectedDomeLeft == DOM_TYPE.TULIP
                                ? null
                                : selectedDomeLeft
                        );
                        setFields({
                            ...fields,
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.RIC_OPTIMA_8,
                                device_dome:
                                    selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                        selectedDomeLeft == DOM_TYPE.TULIP
                                        ? null
                                        : selectedDomeLeft,
                            },
                        });
                    },
                };

            case DEVICES.RIC_OPTIMA:
                return {
                    sideColor: {
                        METALIC: "#C6C1C5",
                        BLACK: "#000000",
                        BEIGE: "#D6B19F",
                    },
                    border: device === DEVICES.RIC_OPTIMA,
                    backgroundColor: device === DEVICES.RIC_OPTIMA,
                    onMouseOver: handleMouseOver6,
                    onMouseOut: handleMouseOut6,
                    src: METALIC_RIC_OPTIMA,
                    hovered: hovered6,

                    OnClickRight: () => {
                        setSelectDevice(LISTENING_SIDE.RIGHT);
                        setDevice(DEVICES.RIC_OPTIMA);
                        // setSelectedColorOptima(
                        //     selectedColorOptima == DEVICE_COLORS.WHITE
                        //         ? DEVICE_COLORS.METALIC
                        //         : selectedColorOptima
                        // );
                        setSelectedDome(
                            selectedDome == DOM_TYPE.EAR_MOLD ||
                                selectedDome == DOM_TYPE.VENTED
                                ? null
                                : selectedDome
                        );
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.RIC_OPTIMA,
                                // device_color:
                                //     selectedColorOptima == DEVICE_COLORS.WHITE
                                //         ? DEVICE_COLORS.METALIC
                                //         : selectedColorOptima,
                                device_dome:
                                    selectedDome == DOM_TYPE.EAR_MOLD ||
                                        selectedDome == DOM_TYPE.VENTED
                                        ? null
                                        : selectedDome,
                            },
                        });
                    },

                    OnClickCenter: () => {
                        setSelectDevice(LISTENING_SIDE.BOTH);
                        setDevice(DEVICES.RIC_OPTIMA);
                        // setSelectedColorOptima(
                        //     selectedColorOptima == DEVICE_COLORS.WHITE
                        //         ? DEVICE_COLORS.METALIC
                        //         : selectedColorOptima
                        // );
                        setSelectedDome(
                            selectedDome == DOM_TYPE.EAR_MOLD ||
                                selectedDome == DOM_TYPE.VENTED
                                ? null
                                : selectedDome
                        );
                        setSelectedDomeLeft(
                            selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                selectedDomeLeft == DOM_TYPE.VENTED
                                ? null
                                : selectedDomeLeft
                        );

                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.RIC_OPTIMA,
                                // device_color:
                                //     selectedColorOptima == DEVICE_COLORS.WHITE
                                //         ? DEVICE_COLORS.METALIC
                                //         : selectedColorOptima,
                                device_dome:
                                    selectedDome == DOM_TYPE.EAR_MOLD ||
                                        selectedDome == DOM_TYPE.VENTED
                                        ? null
                                        : selectedDome,
                            },
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.RIC_OPTIMA,
                                // device_color:
                                //     selectedColorOptima == DEVICE_COLORS.WHITE
                                //         ? DEVICE_COLORS.METALIC
                                //         : selectedColorOptima,
                                device_dome:
                                    selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                        selectedDomeLeft == DOM_TYPE.VENTED
                                        ? null
                                        : selectedDomeLeft,
                            },
                        });
                    },

                    OnClickLeft: () => {
                        setSelectDevice(LISTENING_SIDE.LEFT);
                        setDevice(DEVICES.RIC_OPTIMA);
                        // setSelectedColorOptima(
                        //     selectedColorOptima == DEVICE_COLORS.WHITE
                        //         ? DEVICE_COLORS.METALIC
                        //         : selectedColorOptima
                        // );
                        setSelectedDomeLeft(
                            selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                selectedDomeLeft == DOM_TYPE.VENTED
                                ? null
                                : selectedDomeLeft
                        );
                        setFields({
                            ...fields,
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.RIC_OPTIMA,
                                // device_color:
                                //     selectedColorOptima == DEVICE_COLORS.WHITE
                                //         ? DEVICE_COLORS.METALIC
                                //         : selectedColorOptima,
                                device_dome:
                                    selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                        selectedDomeLeft == DOM_TYPE.VENTED
                                        ? null
                                        : selectedDomeLeft,
                            },
                        });
                    },
                };

            case DEVICES.RIC_32:
                return {
                    sideColor: {
                        METALIC: "#C6C1C5",
                        BLACK: "#000000",
                        BEIGE: "#D6B19F",
                    },
                    border: device === DEVICES.RIC_32,
                    backgroundColor: device === DEVICES.RIC_32,
                    onMouseOver: handleMouseOver5,
                    onMouseOut: handleMouseOut5,
                    src: METALIC_RIC_OPTIMA,
                    hovered: hovered5,

                    OnClickRight: () => {
                        setSelectDevice(LISTENING_SIDE.RIGHT);
                        setDevice(DEVICES.RIC_32);
                        // setSelectedColorOptima(
                        //     selectedColorOptima == DEVICE_COLORS.WHITE
                        //         ? DEVICE_COLORS.METALIC
                        //         : selectedColorOptima
                        // );
                        setSelectedDome(
                            selectedDome == DOM_TYPE.EAR_MOLD ||
                                selectedDome == DOM_TYPE.VENTED
                                ? null
                                : selectedDome
                        );
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.RIC_32,
                                // device_color:
                                //     selectedColorOptima == DEVICE_COLORS.WHITE
                                //         ? DEVICE_COLORS.METALIC
                                //         : selectedColorOptima,
                                device_dome:
                                    selectedDome == DOM_TYPE.EAR_MOLD ||
                                        selectedDome == DOM_TYPE.VENTED
                                        ? null
                                        : selectedDome,
                            },
                        });
                    },

                    OnClickCenter: () => {
                        setSelectDevice(LISTENING_SIDE.BOTH);
                        setDevice(DEVICES.RIC_32);
                        // setSelectedColorOptima(
                        //     selectedColorOptima == DEVICE_COLORS.WHITE
                        //         ? DEVICE_COLORS.METALIC
                        //         : selectedColorOptima
                        // );
                        setSelectedDome(
                            selectedDome == DOM_TYPE.EAR_MOLD ||
                                selectedDome == DOM_TYPE.VENTED
                                ? null
                                : selectedDome
                        );
                        setSelectedDomeLeft(
                            selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                selectedDomeLeft == DOM_TYPE.VENTED
                                ? null
                                : selectedDomeLeft
                        );

                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.RIC_32,
                                // device_color:
                                //     selectedColorOptima == DEVICE_COLORS.WHITE
                                //         ? DEVICE_COLORS.METALIC
                                //         : selectedColorOptima,
                                device_dome:
                                    selectedDome == DOM_TYPE.EAR_MOLD ||
                                        selectedDome == DOM_TYPE.VENTED
                                        ? null
                                        : selectedDome,
                            },
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.RIC_32,
                                // device_color:
                                //     selectedColorOptima == DEVICE_COLORS.WHITE
                                //         ? DEVICE_COLORS.METALIC
                                //         : selectedColorOptima,
                                device_dome:
                                    selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                        selectedDomeLeft == DOM_TYPE.VENTED
                                        ? null
                                        : selectedDomeLeft,
                            },
                        });
                    },

                    OnClickLeft: () => {
                        setSelectDevice(LISTENING_SIDE.LEFT);
                        setDevice(DEVICES.RIC_32);
                        // setSelectedColorOptima(
                        //     selectedColorOptima == DEVICE_COLORS.WHITE
                        //         ? DEVICE_COLORS.METALIC
                        //         : selectedColorOptima
                        // );
                        setSelectedDomeLeft(
                            selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                selectedDomeLeft == DOM_TYPE.VENTED
                                ? null
                                : selectedDomeLeft
                        );
                        setFields({
                            ...fields,
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.RIC_32,
                                // device_color:
                                //     selectedColorOptima == DEVICE_COLORS.WHITE
                                //         ? DEVICE_COLORS.METALIC
                                //         : selectedColorOptima,
                                device_dome:
                                    selectedDomeLeft == DOM_TYPE.EAR_MOLD ||
                                        selectedDomeLeft == DOM_TYPE.VENTED
                                        ? null
                                        : selectedDomeLeft,
                            },
                        });
                    },
                };

            case DEVICES.ITE_OPTIMA:
                return {
                    sideColor: {
                        BLACK: "#000000",
                        WHITE: "#FFFFFF",
                    },
                    border: device === DEVICES.ITE_OPTIMA,
                    backgroundColor: device === DEVICES.ITE_OPTIMA,
                    onMouseOver: handleMouseOver7,
                    onMouseOut: handleMouseOut7,
                    src: iteOptimaBlack,
                    hovered: hovered7,

                    OnClickRight: () => {
                        setSelectDevice(LISTENING_SIDE.RIGHT);
                        setDevice(DEVICES.ITE_OPTIMA);
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.ITE_OPTIMA,
                            },
                        });
                    },

                    OnClickCenter: () => {
                        setSelectDevice(LISTENING_SIDE.BOTH);
                        setDevice(DEVICES.ITE_OPTIMA);
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.ITE_OPTIMA,
                            },
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.ITE_OPTIMA,
                            },
                        });
                    },

                    OnClickLeft: () => {
                        setSelectDevice(LISTENING_SIDE.LEFT);
                        setDevice(DEVICES.ITE_OPTIMA);
                        setFields({
                            ...fields,
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.ITE_OPTIMA,
                            },
                        });
                    },
                };

            case DEVICES.ITE_PRIME:
                return {
                    border: device === DEVICES.ITE_PRIME,
                    backgroundColor: device === DEVICES.ITE_PRIME,
                    onMouseOver: handleMouseOver8,
                    onMouseOut: handleMouseOut8,
                    src: itePrimeWhite,
                    hovered: hovered8,

                    OnClickRight: () => {
                        setSelectDevice(LISTENING_SIDE.RIGHT);
                        setDevice(DEVICES.ITE_PRIME);
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.ITE_PRIME,
                            },
                        });
                    },

                    OnClickCenter: () => {
                        setSelectDevice(LISTENING_SIDE.BOTH);
                        setDevice(DEVICES.ITE_PRIME);
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.ITE_PRIME,
                            },
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.ITE_PRIME,
                            },
                        });
                    },

                    OnClickLeft: () => {
                        setSelectDevice(LISTENING_SIDE.LEFT);
                        setDevice(DEVICES.ITE_PRIME);
                        setFields({
                            ...fields,
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.ITE_PRIME,
                            },
                        });
                    },
                };

            case DEVICES.NECKBAND:
                return {
                    IsOnlyBoth: "OnlyBoth",
                    border: device === DEVICES.NECKBAND,
                    backgroundColor: device === DEVICES.NECKBAND,
                    onMouseOver: handleMouseOver9,
                    onMouseOut: handleMouseOut9,
                    src: neckbandBlack,
                    hovered: hovered9,

                    OnClickCenter: () => {
                        setSelectDevice(LISTENING_SIDE.BOTH);
                        setDevice(DEVICES.NECKBAND);
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.NECKBAND,
                            },
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.NECKBAND,
                            },
                        });
                    },
                };

            case DEVICES.WEHEAR_2_0:
                return {
                    IsOnlyBoth: "OnlyBoth",
                    border: device === DEVICES.WEHEAR_2_0,
                    backgroundColor: device === DEVICES.WEHEAR_2_0,
                    onMouseOver: handleMouseOver10,
                    onMouseOut: handleMouseOut10,
                    src: wehear_2_0,
                    hovered: hovered10,

                    OnClickCenter: () => {
                        setSelectDevice(LISTENING_SIDE.BOTH);
                        setDevice(DEVICES.WEHEAR_2_0);
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.WEHEAR_2_0,
                            },
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.WEHEAR_2_0,
                            },
                        });
                    },
                };

            case DEVICES.WEHEAR_OX:
                return {
                    IsOnlyBoth: "OnlyBoth",
                    border: device === DEVICES.WEHEAR_OX,
                    backgroundColor: device === DEVICES.WEHEAR_OX,
                    onMouseOver: handleMouseOver11,
                    onMouseOut: handleMouseOut11,
                    src: wehearox,
                    hovered: hovered11,

                    OnClickCenter: () => {
                        setSelectDevice(LISTENING_SIDE.BOTH);
                        setDevice(DEVICES.WEHEAR_OX);
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.WEHEAR_OX,
                            },
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.WEHEAR_OX,
                            },
                        });
                    },
                };

            case DEVICES.SAFE_BUDS:
                return {
                    // IsOnlyBoth: "OnlyBoth",
                    border: device === DEVICES.SAFE_BUDS,
                    backgroundColor: device === DEVICES.SAFE_BUDS,
                    onMouseOver: handleMouseOver12,
                    onMouseOut: handleMouseOut12,
                    src: SAFE_BUDS,
                    hovered: hovered12,

                    OnClickRight: () => {
                        setSelectDevice(LISTENING_SIDE.RIGHT);
                        setDevice(DEVICES.SAFE_BUDS);
                        setFields({
                            ...fields,
                            right_fitted_device: {
                                ...fields.right_fitted_device,
                                device_type: DEVICES.SAFE_BUDS,
                            },
                        });
                    },

                    // OnClickCenter: () => {
                    //     setSelectDevice(LISTENING_SIDE.BOTH);
                    //     setDevice(DEVICES.ITE_PRIME);
                    //     setFields({
                    //         ...fields,
                    //         right_fitted_device: {
                    //             ...fields.right_fitted_device,
                    //             device_type: DEVICES.ITE_PRIME,
                    //         },
                    //         left_fitted_device: {
                    //             ...fields.left_fitted_device,
                    //             device_type: DEVICES.ITE_PRIME,
                    //         },
                    //     });
                    // },

                    OnClickLeft: () => {
                        setSelectDevice(LISTENING_SIDE.LEFT);
                        setDevice(DEVICES.SAFE_BUDS);
                        setFields({
                            ...fields,
                            left_fitted_device: {
                                ...fields.left_fitted_device,
                                device_type: DEVICES.SAFE_BUDS,
                            },
                        });
                    },
                };

            default:
                return;
        }
    };
    // console.log("object selectDevice", selectDevice);
    return (
        <Box mb={1}>
            {/* <ButtonGroup sx={{ display: "flex", width: "100%", mb: 3, mt: 1 }}>
                <Button sx={{
                    fontFamily: "League spartan",
                    width: "50%",
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor:
                        selectButton === "Suggested_Devices"
                            ? "#EDF0F7"
                            : "white",
                    border:
                        selectButton === "Suggested_Devices"
                            ? "1px solid #2D3B67"
                            : ""
                }}
                    onClick={() => {
                        setselectButton("Suggested_Devices");
                    }}>
                    <Typography
                        fontWeight={700}
                        fontSize={"16px"}
                        sx={{ color: "#2D3B67" }}
                    >
                        Suggested Devices
                    </Typography>
                </Button>
                <Button sx={{
                    fontFamily: "League spartan",
                    width: "50%",
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor:
                        selectButton === "All_Devices"
                            ? "#EDF0F7"
                            : "white",
                    border:
                        selectButton === "All_Devices"
                            ? "1px solid #2D3B67"
                            : ""
                }}
                    onClick={() => {
                        setselectButton("All_Devices");
                    }}>
                    <Typography
                        fontWeight={700}
                        fontSize={"16px"}
                        sx={{ color: "#2D3B67" }}
                    >
                        All Devices
                    </Typography>
                </Button>
            </ButtonGroup> */}
            {/* {selectButton === "Suggested_Devices" && <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    {suggestedProduct.map((item, idx) => {
                        const data = SuggestedProductData(item.product);
                        return (
                            <Grid item xs={12} sm={6} md={2} key={`${item.product}-${idx}`}>
                                <AccordionDetailsUi
                                    side={data?.IsOnlyBoth ? data?.IsOnlyBoth : item.side}
                                    setDevice={setDevice}
                                    Title={DEVICES_NAME[item.product]}
                                    setFields={setFields}
                                    sideColor={data?.sideColor}
                                    // Right_src={RIGHT}
                                    // Center_src={CENTER}
                                    // Left_src={LEFT}
                                    isBorder={data?.border}
                                    isBackgroundColor={data?.backgroundColor}
                                    img_src={data?.src}
                                    OnClickCenter={data?.OnClickCenter}
                                    device={item.product}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>} */}
            {selectButton === "All_Devices" && <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    {Object.entries(DEVICES).map(([key, value], idx) => {
                        const data = SuggestedProductData(value);
                        return (
                            <Grid item xs={12} sm={6} md={2} key={`${value}-${idx}`}>
                                <AccordionDetailsUi
                                    setDevice={setDevice}
                                    Title={DEVICES_NAME[value]}
                                    // selectedColorOptima={selectedColorOptima}
                                    setFields={setFields}
                                    // setSelectedColorOptima={setSelectedColorOptima}
                                    sideColor={data?.sideColor}
                                    Right_src={RIGHT}
                                    // Center_src={CENTER}
                                    Left_src={LEFT}
                                    isBorder={data?.border}
                                    isBackgroundColor={data?.backgroundColor}
                                    handleMouseOver={data?.onMouseOver}
                                    handleMouseOut={data?.onMouseOut}
                                    img_src={data?.src}
                                    hovered={data?.hovered}
                                    OnClickRight={data?.OnClickRight}
                                    OnClickCenter={data?.OnClickCenter}
                                    OnClickLeft={data?.OnClickLeft}
                                    device={value}
                                />
                            </Grid>
                        );
                    })}

                </Grid>

            </Box>}

            <Box mt={6}>
                <CoonectDeviceModule
                    setIsConnecting={setIsConnecting}
                    onConnectWithDevice={(data, deviceInfo, disconnectFun) => {
                        dispatch(
                            connectDevice(
                                data,
                                deviceInfo,
                                disconnectFun,
                                // fitting.device_side
                            )
                        );
                    }}
                    Component={ConnectButton}
                    // onLoadingChange={(loader, message) => {
                    //     dispatch(
                    //         changeLoadinfMessages(
                    //             loader,
                    //             message,
                    //             fitting.device_side
                    //         )
                    //     );
                    // }}
                    // onEnableChange={(val) =>
                    //     dispatch(
                    //         changeDeviceCompatiblity(val, fitting.device_side)
                    //     )
                    // }
                    // onWriteFunctionEnabled={(fun) =>
                    //     dispatch(onWriteFunctionChange(fun, fitting.device_side))
                    // }
                    onDisconnect={() =>
                        dispatch(disconnectDevice())
                    }
                // fitting={fitting}
                />
            </Box>
        </Box>
    );
};

export default DeviceQcListUi