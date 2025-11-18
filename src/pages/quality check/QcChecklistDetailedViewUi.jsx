import { Box, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CustomDialog from '../../components/layouts/common/CustomDialog'
import { useParams } from 'react-router-dom'
import { callApiAction } from '../../store/actions/commonAction'
import { QcFetchBySerialNoCheckListApi } from '../../apis/qc.api'
import { useDispatch } from 'react-redux'
import moment from 'moment'
import { findObjectKeyByValue } from '../../utils/main'
import { YES_NO } from '../../utils/constants'

const QcChecklistDetailedViewUi = ({ title, modalId, params }) => {
    const [loading, setLoading] = useState(false)
    const [fields, setFields] = useState({
        err: "",
        appearance_checklist: {
            all_parts_fixed: null,
            symbols_clear: null,
            surface_free_of_defects: null,
            ear_hook_and_connections_reliable: null,
            operation_of_switches_and_battery: null,
            overall_appearance_no_defects: null,
        },

        functional_detection_checklist: {
            no_sound: null,
            small_sound_noise_howling: null,
            volume_adjustment_function: null,
            switch_function_normal: null,
            product_no_abnormal_sound: null,
            indicator_lights_working: null,
            no_explosion_abnormal_charging: null,

        },

        technical_parameter_checklist: {
            max_ospl90: null,
            average: null,
            average_sound_gain: null,
            equivalent_input_noise: null,
            total_harmonic_distortion: null,
            frequency_response: null,
            rated_supply_current_consumption: null,

        },

        charging_discharging: {
            charging_duration: {
                case: {
                    from: moment().toISOString(),
                    to: moment().toISOString(),
                    total_hours: "",
                    total_minutes: "",
                },
                ric: {
                    right: {
                        from: moment().toISOString(),
                        to: moment().toISOString(),
                    },
                    left: {
                        from: moment().toISOString(),
                        to: moment().toISOString(),
                    }
                },
            },


            cycles_with_case: "",


            discharging_duration: {
                ric: {
                    day_1: {
                        right: {
                            from: null,
                            to: null,
                        },
                        left: {
                            from: null,
                            to: null,
                        },
                    },
                    day_2: {
                        right: {
                            from: null,
                            to: null,
                        },
                        left: {
                            from: null,
                            to: null,
                        },
                    },
                },
                total_duration: {
                    right: {
                        total_hours: null,
                        total_minutes: null,
                    },
                    left: {
                        total_hours: null,
                        total_minutes: null,
                    },
                },
            },

        },

    });
    const dispatch = useDispatch()
    console.log("objectfieldsfields", fields);
    const fetchById = (serial_no) => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await QcFetchBySerialNoCheckListApi({ serial_no }),
                async (response) => {
                    setFields({ ...response });

                    setLoading(false);
                },
                (err) => {
                    setFields({ ...fields, err });
                    setLoading(false);
                }
            )     
        );
    };

    useEffect(() => {
        if (params) fetchById(params);
    }, [params]);

    return (
        <>
            <CustomDialog
                id={"masking"}
                loading={loading}
                title={title}
                closeText="Close"
            >

                {/* Appearance Checklist Detailed view */}
                <Box sx={{ border: "1px solid black", borderRadius: "10px" }}>
                    <Grid p={4} md={12} sm={12} xs={12} container >

                        <Grid p={2} md={12} sm={12} xs={12} display={"flex"} flexDirection={"row"} sx={{ borderBottom: "1px solid black", backgroundColor: "#255766" }}>
                            <Grid md={8} sm={8} xs={8} >
                                <Box display={"flex"} justifyContent={"center"}>
                                    <Typography variant='h4' color={"white"} >Appearance Check List</Typography>
                                </Box>
                            </Grid>

                            <Grid md={4} sm={4} xs={4} >
                                <Box display={"flex"} ml={4} justifyContent={"center"}>
                                    <Typography variant='h4' color={"white"}>Mark</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid mt={4} md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>All Parts Should Be Fully Assembled And Fixed Reliably. </Typography>
                        </Grid>

                        <Grid mt={4} md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.appearance_checklist.all_parts_fixed, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Words Symbols Or Marks Should Be Clear, Correct And Firm. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.appearance_checklist.symbols_clear, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>The Surface Should Be Free Of Burrs: Flashes, Dents, Scratches And Other Defects.</Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.appearance_checklist.surface_free_of_defects, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Ear Hook, Sound Guide Tube, earplugs, Battery Positive And Negative Connection Should Be Reliable And Effective. </Typography>
                        </Grid>


                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.appearance_checklist.ear_hook_and_connections_reliable, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>The Operation Of Adjustment Buttons Switches, Battery Doors And Other Mechanisms Should Be Flexible And Effective. </Typography>
                        </Grid>

                        <Grid mt={4} md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.appearance_checklist.operation_of_switches_and_battery, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>The Appearance Of The Whole HA & Case Has No Defects Such As Scratches, Indentations And Heterochromatic Spots. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.appearance_checklist.overall_appearance_no_defects, YES_NO)}</Typography>
                        </Grid>

                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                        </Grid>
                    </Grid>
                </Box>


                {/* Functional Detection Check List Detailed View */}
                <Box mt={6} sx={{ border: "1px solid black", borderRadius: "10px" }}>
                    <Grid p={4} md={12} sm={12} xs={12} container >

                        <Grid p={2} md={12} sm={12} xs={12} display={"flex"} flexDirection={"row"} sx={{ borderBottom: "1px solid black", backgroundColor: "#255766" }}>
                            <Grid md={8} sm={8} xs={8} >
                                <Box display={"flex"} justifyContent={"center"}>
                                    <Typography variant='h4' color={"white"} >Functional Detection Check List</Typography>
                                </Box>
                            </Grid>

                            <Grid md={4} sm={4} xs={4} >
                                <Box display={"flex"} ml={4} justifyContent={"center"}>
                                    <Typography variant='h4' color={"white"}>Mark</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid mt={4} md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>No Sound.. </Typography>
                        </Grid>

                        <Grid mt={4} md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.functional_detection_checklist.no_sound, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Small Sound/Noise/ Howling. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.functional_detection_checklist.small_sound_noise_howling, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>The volume Adjustment Function Is Normal, The Knob/Buttons Feels good and there is no scratch.</Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.functional_detection_checklist?.volume_adjustment_function, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>The switch Function is Normal And Working Well. </Typography>
                        </Grid>


                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.functional_detection_checklist?.switch_function_normal, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>The Product Has No Abnormal Sound. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.functional_detection_checklist.product_no_abnormal_sound, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>The Indicator Lights Are Working Fine And Birghtness Is Normal. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.functional_detection_checklist.indicator_lights_working, YES_NO)}</Typography>
                        </Grid>

                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>No Explosion, No charging, Unsaturated Charging etc. (Any Abnormal Activity In CHG/DHG). </Typography>
                        </Grid>

                        <Grid mt={4} md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.functional_detection_checklist.no_explosion_abnormal_charging, YES_NO)}</Typography>
                        </Grid>

                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                        </Grid>
                    </Grid>
                </Box>


                {/* Technical Parameter Check List Detailed View */}
                <Box mt={6} sx={{ border: "1px solid black", borderRadius: "10px" }}>
                    <Grid p={4} md={12} sm={12} xs={12} container >

                        <Grid p={2} md={12} sm={12} xs={12} display={"flex"} flexDirection={"row"} sx={{ borderBottom: "1px solid black", backgroundColor: "#255766" }}>
                            <Grid md={8} sm={8} xs={8} >
                                <Box display={"flex"} justifyContent={"center"}>
                                    <Typography variant='h4' color={"white"} >Technical Parameter Check List</Typography>
                                </Box>
                            </Grid>

                            <Grid md={4} sm={4} xs={4} >
                                <Box display={"flex"} ml={4} justifyContent={"center"}>
                                    <Typography variant='h4' color={"white"}>Mark</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid mt={4} md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>Max OSPL90.: 120dB + 3dB. </Typography>
                        </Grid>

                        <Grid mt={4} md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.technical_parameter_checklist.max_ospl90, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Average. : 117dB + 4dB. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.technical_parameter_checklist?.average, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>Average Sound Gain. : 55dB + 5dB.</Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.technical_parameter_checklist?.average_sound_gain, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Equivalent Input Noise. : &le; 20dB + 3dB. </Typography>
                        </Grid>


                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.technical_parameter_checklist?.equivalent_input_noise, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>Total Harmonic Distortion. : &le; 3%.</Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.technical_parameter_checklist.total_harmonic_distortion, YES_NO)}</Typography>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Frequency Response. : 200` 6000Hz. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.technical_parameter_checklist.frequency_response, YES_NO)}</Typography>
                        </Grid>

                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>Rated Supply Current Consumption. : &le; 3mA. </Typography>
                        </Grid>

                        <Grid mt={4} md={4} sm={4} xs={4} display={"flex"} justifyContent={"center"}>
                            <Typography color={"#255766"} variant='body1'>{findObjectKeyByValue(fields.technical_parameter_checklist.rated_supply_current_consumption, YES_NO)}</Typography>
                        </Grid>

                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                        </Grid>
                    </Grid>
                </Box>


                {/* Charging/Discharging Duration Detailed view */}
                <Box mt={6} sx={{ border: "1px solid black", borderRadius: "10px" }}>
                    <Grid p={4} md={12} sm={12} xs={12} container>
                        <Grid p={2} md={12} sm={12} xs={12} display={"flex"} flexDirection={"row"} sx={{ borderBottom: "1px solid black", backgroundColor: "#255766" }}>
                            <Box display={"flex"} justifyContent={"center"}>
                                <Typography variant='h4' color={"white"} >Charging/Discharging Check List</Typography>
                            </Box>
                        </Grid>

                        <Grid mt={3} p={2} md={4} sm={4} xs={4} >
                            <Typography variant='body1' color={"primary"} >
                                Total Charging Duration Case&nbsp;:
                            </Typography>
                        </Grid>

                        <Grid mt={3} p={2} md={8} sm={8} xs={8} >
                            <Typography variant='body1' color={"#255766"} >
                                {`${fields?.charging_discharging?.charging_duration.case?.total_hours}H ` +
                                    `${fields?.charging_discharging?.charging_duration.case?.total_minutes}Min.`}
                            </Typography>
                        </Grid>


                        <Grid p={2} md={3} sm={3} xs={3} display={"flex"} alignItems={"center"} sx={{ backgroundColor: "#E5E5E5" }}>
                            <Typography variant='body1' color={"primary"} >
                                Charging On Duration RIC:
                            </Typography>
                        </Grid>

                        <Grid p={2} md={9} sm={9} xs={9} display={"flex"} flexDirection={"row"} sx={{ backgroundColor: "#E5E5E5" }}>
                            <Box width={"100%"} display={"flex"} justifyContent={"space-evenly"} flexDirection={"column"}>
                                <Typography mr={4} variant='h5' color={"#255766"} fontWeight={"bold"} display={"flex"} justifyContent={"center"}>
                                    Right
                                </Typography>
                                <Typography variant='body1' color={"#255766"} >
                                    From:&nbsp;{moment(fields?.charging_discharging?.charging_duration.ric?.right?.from).format("h:mm:ss A.")}&nbsp;-
                                    To:&nbsp;{moment(fields?.charging_discharging?.charging_duration.ric?.right?.to).format("h:mm:ss A.")}
                                </Typography>
                            </Box>

                            <Box borderRight={"1px solid black"} />

                            <Box width={"100%"} display={"flex"} justifyContent={"space-evenly"} flexDirection={"column"}>
                                <Typography variant='h5' color={"#255766"} fontWeight={"bold"} display={"flex"} justifyContent={"center"}>
                                    Left
                                </Typography>
                                <Typography variant='body1' color={"#255766"} display={"flex"} justifyContent={"center"} >
                                    From:&nbsp;{moment(fields?.charging_discharging?.charging_duration.ric?.left?.from).format("h:mm:ss A.")}&nbsp;-
                                    To:&nbsp;{moment(fields?.charging_discharging?.charging_duration.ric?.left?.to).format("h:mm:ss A.")}
                                </Typography>
                            </Box>
                        </Grid>


                        <Grid p={2} md={4.5} sm={4.5} xs={4.5} >
                            <Typography variant='body1' color={"primary"} >
                                Number Of Charging Cycles With Case :
                            </Typography>
                        </Grid>

                        <Grid p={2} md={7.5} sm={7.5} xs={7.5} >
                            <Typography variant='body1' color={"#255766"} >
                                {fields.charging_discharging.cycles_with_case}
                            </Typography>
                        </Grid>



                        <Grid p={2} md={5} sm={5} xs={5} sx={{ backgroundColor: "#E5E5E5", display: "flex", alignItems: "center" }}>
                            <Typography variant='body1' color={"primary"} >
                                Total Discharge Duration RIC (Day-1 & Day-2)
                            </Typography>
                        </Grid>

                        <Grid p={2} md={7} sm={7} xs={7} display={"flex"} flexDirection={"row"} sx={{ backgroundColor: "#E5E5E5" }}>
                            <Box width={"100%"} display={"flex"} justifyContent={"space-evenly"} flexDirection={"column"}>
                                <Typography variant='h5' color={"#255766"} fontWeight={"bold"} display={"flex"} justifyContent={"center"}>
                                    Right
                                </Typography>
                                <Typography variant='body1' color={"#255766"} display={"flex"} justifyContent={"center"} >
                                    {
                                        `${fields.charging_discharging.discharging_duration.total_duration.right.total_hours}H ` +
                                        `${fields.charging_discharging.discharging_duration.total_duration.right.total_minutes}Min.`
                                    }
                                </Typography>
                            </Box>

                            <Box borderRight={"1px solid black"} />

                            <Box width={"100%"} display={"flex"} justifyContent={"space-evenly"} flexDirection={"column"}>
                                <Typography variant='h5' color={"#255766"} fontWeight={"bold"} display={"flex"} justifyContent={"center"}>
                                    Left
                                </Typography>
                                <Typography variant='body1' color={"#255766"} display={"flex"} justifyContent={"center"} >
                                    {
                                        `${fields.charging_discharging.discharging_duration.total_duration.left.total_hours}H ` +
                                        `${fields.charging_discharging.discharging_duration.total_duration.left.total_minutes}Min.`
                                    }
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                </Box>

            </CustomDialog>
        </>
    )
}

export default QcChecklistDetailedViewUi