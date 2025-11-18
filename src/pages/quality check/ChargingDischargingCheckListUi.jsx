import { Box, Typography, useMediaQuery } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { TimePicker } from '@mui/x-date-pickers'
import { useSelector } from 'react-redux'
import CustomInput from '../../components/inputs/CustomInputs'
import moment from 'moment'


const ChargingDischargingCheckListUi = ({ fields, setFields, loading, onClick }) => {
    const { holiday } = useSelector((state) => state)
    const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down(1250))
    const [ric, setRic] = useState({
        day1: {
            right: {
                minutes: null
            },
            left: {
                minutes: null
            }
        },
        day2: {
            right: {
                minutes: null
            },
            left: {
                minutes: null
            }
        }
    })


    const calculateDuration = () => {

        if (fields.charging_discharging.charging_duration.case.to
            || fields.charging_discharging.charging_duration.case.from) {
            const { from, to } = fields.charging_discharging.charging_duration.case;

            if (from && to) {
                const startTime = moment(from);
                const endTime = moment(to);
                const diff = moment.duration(endTime.diff(startTime));
                setFields({
                    ...fields, err: '', charging_discharging: {
                        ...fields.charging_discharging,
                        charging_duration: {
                            ...fields.charging_discharging.charging_duration,
                            case: {
                                ...fields.charging_discharging.charging_duration.case,
                                total_hours: diff.hours(),
                                total_minutes: diff.minutes(),
                            }
                        }
                    }
                })
            }
        }
    };
    useEffect(() => {
        calculateDuration();
    }, [fields.charging_discharging.charging_duration.case.to, fields.charging_discharging.charging_duration.case.from]);



    const RICRightTotal = fields?.charging_discharging?.discharging_duration?.ric?.day_1?.right.to && fields?.charging_discharging?.discharging_duration?.ric?.day_1?.right.from && fields?.charging_discharging?.discharging_duration?.ric?.day_2?.right.to && fields?.charging_discharging?.discharging_duration?.ric?.day_2?.right.from
    const RICLeftTotal =  fields?.charging_discharging?.discharging_duration?.ric?.day_1?.left.to && fields?.charging_discharging?.discharging_duration?.ric?.day_1?.left.from && fields?.charging_discharging?.discharging_duration?.ric?.day_2?.left.to && fields?.charging_discharging?.discharging_duration?.ric?.day_2?.left.from

    const day2_left_from = fields?.charging_discharging?.discharging_duration?.ric?.day_2?.left.from
    const day2_left_to = fields?.charging_discharging?.discharging_duration?.ric?.day_2?.left.to

    const day1_right_from = fields?.charging_discharging?.discharging_duration?.ric?.day_1?.right.from
    const day1_right_to = fields?.charging_discharging?.discharging_duration?.ric?.day_1?.right.to

    const day2_right_to = fields?.charging_discharging?.discharging_duration?.ric?.day_2?.right.to
    const day2_right_from = fields?.charging_discharging?.discharging_duration?.ric?.day_2?.right.from

    const day1_left_to = fields?.charging_discharging?.discharging_duration?.ric?.day_1?.left.to
    const day1_left_from = fields?.charging_discharging?.discharging_duration?.ric?.day_1?.left.from

    const calculateDurationRICRight = () => {

        if (day1_right_to || day1_right_from) {
            const { from, to } = fields?.charging_discharging?.discharging_duration?.ric?.day_1?.right
            if (from && to) {
                const startTime = moment(from);
                const endTime = moment(to);
                const diff = endTime.diff(startTime, "minutes");
                setRic(prevRic => ({
                    ...prevRic,
                    day1: {
                        ...prevRic.day1,
                        right: {
                            ...prevRic.day1.right,
                            minutes: diff,
                        }
                    }
                }));
            } else {
                console.log("fields");
            }
        } else {
            console.log("fields");
        }

    }

    const calculateDurationRICLeft = () => {
        if (day1_left_to || day1_left_from) {
            const { from, to } = fields?.charging_discharging?.discharging_duration?.ric?.day_1?.left
            console.log("object", from, to);
            if (from && to) {
                const startTime = moment(from);
                const endTime = moment(to);
                const diff = endTime.diff(startTime, "minutes");
                console.log("object diff", diff);
                setRic(prevRic => ({
                    ...prevRic,
                    day1: {
                        ...prevRic.day1,
                        left: {
                            ...prevRic.day1.left,
                            minutes: diff,
                        }
                    }
                }));
            } else {
                console.log("calculateDurationRICLeft right error");
            }
        } else {
            console.log("calculateDurationRICLeft right error");
        }

    }

    const ric_day2_right_from = () => {

        if (day2_right_to || day2_right_from) {
            const { from, to } = fields?.charging_discharging?.discharging_duration?.ric?.day_2?.right

            if (from && to) {
                const startTime = moment(from);
                const endTime = moment(to);

                const diff = endTime.diff(startTime, "minutes");


                setRic(prevRic => ({
                    ...prevRic,
                    day2: {
                        ...prevRic.day2,
                        right: {
                            ...prevRic.day2.right,
                            minutes: diff,
                        }
                    }
                }));
            } else {
                console.log("fields");
            }
        } else {
            console.log("fields");
        }
    }

    const ric_day2_left_from = () => {
        if (day2_left_to
            || day2_left_from
        ) {
            const { from, to } = fields?.charging_discharging?.discharging_duration?.ric?.day_2?.left
            if (from && to) {
                const startTime = moment(from);
                const endTime = moment(to);
                const diff = endTime.diff(startTime, "minutes");

                setRic(prevRic => ({
                    ...prevRic,
                    day2: {
                        ...prevRic.day2,
                        left: {
                            ...prevRic.day2.left,
                            minutes: diff,
                        }
                    }
                }));
            } else {
                console.log("calculateDurationRICLeft right error");
            }
        } else {
            console.log("calculateDurationRICLeft right error");
        }
    }

    const calculateDurationRightRICTotal = () => {
        if (RICRightTotal) {
       
            setFields({
                ...fields,
                err: '',
                charging_discharging: {
                    ...fields.charging_discharging,
                    discharging_duration: {
                        ...fields.charging_discharging.discharging_duration,
                        total_duration: {
                            ...fields.charging_discharging.discharging_duration.total_duration,
                            right: {
                                ...fields.charging_discharging.discharging_duration.total_duration.right,
                                total_hours: Math.floor((ric.day1.right.minutes + ric.day2.right.minutes) / 60),
                                total_minutes: parseFloat(ric.day1.right.minutes + ric.day2.right.minutes) % 60,

                            },

                        },
                    },
                },

            });
        } else {
            console.log("calculateDurationRICTotal right error");
        }
    }


    const calculateDurationLeftRICTotal = () => {
        if (RICLeftTotal) {
            setFields({
                ...fields,
                err: '',
                charging_discharging: {
                    ...fields.charging_discharging,
                    discharging_duration: {
                        ...fields.charging_discharging.discharging_duration,
                        total_duration: {
                            ...fields.charging_discharging.discharging_duration.total_duration,
                            left: {
                                ...fields.charging_discharging.discharging_duration.total_duration.left,
                                total_hours: Math.floor((ric.day1.left.minutes + ric.day2.left.minutes) / 60),
                                total_minutes: parseFloat(ric.day1.left.minutes + ric.day2.left.minutes) % 60,
                            },

                        },
                    },
                },
            });

        } else {
            console.log("calculateDurationRICTotal left error");
        }

    }

    useEffect(() => {
        ric_day2_right_from();
    }, [day2_right_to, day2_right_from])

    useEffect(() => {
        ric_day2_left_from();
    }, [day2_left_to, day2_left_from])

    useEffect(() => {
        calculateDurationRICLeft();
    }, [day1_left_to, day1_left_from]);

    useEffect(() => {
        calculateDurationRICRight();
    }, [day1_right_to, day1_right_from]);



    useEffect(() => {
        calculateDurationRightRICTotal();
    }, [ ric.day1.right.minutes, ric.day2.right.minutes]);

    useEffect(() => {
        calculateDurationLeftRICTotal();
    }, [ric.day1.left.minutes, ric.day2.left.minutes  ]);

    return (

        <>
            <Box p={4} mt={6} sx={{ border: "1px solid black", borderRadius: "10px" }}>

                <Box>
                    <Typography variant='h3' color={"primary"} sx={{ display: "flex", justifyContent: "center" }}>Charging/Discharging Check List </Typography>
                </Box>

                <Box mt={4} display={"flex"} flexDirection={"column"} >

                    <Box p={2} mt={2} sx={{ borderTop: "1px solid black", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                        <Box width={"20vw"}>
                            <Typography variant='h4' color={"primary"} >
                                Charging Duration Case&nbsp;:
                            </Typography>
                        </Box>


                        <Box gap={1} width={"100%"} display={"flex"} flexDirection={"row"} justifyContent={"space-evenly"}>

                            <Box width={"15vw"}>
                                <TimePicker
                                    label={"From*"}
                                    renderInput={(props) => {
                                        return <CustomInput {...props} sx={{ width: '100%' }} />
                                    }}
                                    value={moment(fields?.charging_discharging.charging_duration.case.from)}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields, err: '', charging_discharging: {
                                                ...fields.charging_discharging,
                                                charging_duration: {
                                                    ...fields.charging_discharging.charging_duration,
                                                    case: {
                                                        ...fields.charging_discharging.charging_duration.case,
                                                        from: e.toISOString(),
                                                    }

                                                }
                                            }
                                        })
                                    }
                                    type="Start Time"
                                />
                            </Box>

                            <Box width={"15vw"}>
                                <TimePicker
                                    label={"To*"}
                                    renderInput={(props) => {
                                        return <CustomInput {...props} sx={{ width: '100%' }} />
                                    }}
                                    value={moment(fields?.charging_discharging.charging_duration.case.to)}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields, err: '', charging_discharging: {
                                                ...fields.charging_discharging,
                                                charging_duration: {
                                                    ...fields.charging_discharging.charging_duration,
                                                    case: {
                                                        ...fields.charging_discharging.charging_duration.case,
                                                        to: e.toISOString(),
                                                    }

                                                }
                                            }
                                        })
                                    }
                                    type="End Time"
                                />
                            </Box>

                            <Box width={"15vw"} >
                                {<CustomInput
                                    disabled={true}
                                    value={
                                        `${fields?.charging_discharging?.charging_duration.case?.total_hours}H ` +
                                        `${fields?.charging_discharging?.charging_duration.case?.total_minutes}Min.`
                                    }
                                    type="text"
                                    label={"Total"}
                                />
                                }
                            </Box>
                        </Box>
                    </Box>


                    <Box p={2} mt={2} sx={{ display: "flex", flexDirection: "row", alignItems: "center", }}>
                        <Box width={"30vw"}>
                            <Typography variant='h4' color={"primary"} >
                                Charging On Duration RIC :
                            </Typography>
                        </Box>

                        <Box gap={2} width={"100%"} display={"flex"} flexDirection={isSmallScreen ? "column" : "row"} justifyContent={"space-between"}>
                            <Box width={"100%"} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", width: "30vw" }}>
                                <Box display={"flex"} justifyContent={"flex-start"}>
                                    <Typography variant='h5' color={"primary"}>Right&nbsp;:</Typography>
                                </Box>

                                <Box gap={2} display={"flex"}>
                                    <Box ml={2} sx={{ width: '100%' }}>
                                        <TimePicker
                                            label={"From*"}
                                            renderInput={(props) => {
                                                return <CustomInput {...props} sx={{ width: isSmallScreen ? "15vw" : '100%' }} />
                                            }}
                                            value={moment(fields?.charging_discharging?.charging_duration?.ric?.right?.from)}
                                            onChange={(e) =>
                                                setFields({
                                                    ...fields, err: '', charging_discharging: {
                                                        ...fields.charging_discharging,
                                                        charging_duration: {
                                                            ...fields.charging_discharging.charging_duration,
                                                            ric: {
                                                                ...fields.charging_discharging.charging_duration.ric,
                                                                right: {
                                                                    ...fields?.charging_discharging?.charging_duration.ric?.right,
                                                                    from: e.toISOString(),
                                                                }

                                                            }
                                                        }
                                                    }
                                                })
                                            }
                                            type="Start Time"
                                        />
                                    </Box>
                                    <Box sx={{ width: '100%' }}>
                                        <TimePicker
                                            label={"To*"}
                                            renderInput={(props) => {
                                                return <CustomInput {...props} sx={{ width: isSmallScreen ? "15vw" : '100%' }} />
                                            }}
                                            value={moment(fields?.charging_discharging?.charging_duration?.ric?.right?.to)}
                                            onChange={(e) =>
                                                setFields({
                                                    ...fields, err: '', charging_discharging: {
                                                        ...fields.charging_discharging,
                                                        charging_duration: {
                                                            ...fields.charging_discharging.charging_duration,
                                                            ric: {
                                                                ...fields.charging_discharging.charging_duration.ric,
                                                                right: {
                                                                    ...fields?.charging_discharging?.charging_duration?.ric?.right,
                                                                    to: e.toISOString(),
                                                                }

                                                            }
                                                        }
                                                    }
                                                })
                                            }
                                            type="End Time"
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <Box width={"100%"} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", width: "30vw" }}>
                                <Box display={"flex"} justifyContent={"flex-start"}>
                                    <Typography variant='h5' color={"primary"}>Left&nbsp;:</Typography>
                                </Box>

                                <Box gap={2} display={"flex"}>
                                    <Box ml={2} sx={{ width: '100%' }}>
                                        <TimePicker
                                            label={"From*"}
                                            renderInput={(props) => {
                                                return <CustomInput {...props} sx={{ width: isSmallScreen ? "15vw" : '100%' }} />
                                            }}
                                            value={moment(fields?.charging_discharging?.charging_duration.ric?.left?.from)}
                                            onChange={(e) =>
                                                setFields({
                                                    ...fields, err: '', charging_discharging: {
                                                        ...fields.charging_discharging,
                                                        charging_duration: {
                                                            ...fields.charging_discharging.charging_duration,
                                                            ric: {
                                                                ...fields.charging_discharging.charging_duration.ric,
                                                                left: {
                                                                    ...fields.charging_discharging.charging_duration.ric.left,
                                                                    from: e.toISOString(),
                                                                }

                                                            }
                                                        }
                                                    }
                                                })
                                            }
                                            type="Start Time"
                                        />
                                    </Box>
                                    <Box sx={{ width: '100%' }}>
                                        <TimePicker
                                            label={"To*"}
                                            renderInput={(props) => {
                                                return <CustomInput {...props} sx={{ width: isSmallScreen ? "15vw" : '100%' }} />
                                            }}
                                            value={moment(fields?.charging_discharging?.charging_duration.ric?.left?.to)}
                                            onChange={(e) =>
                                                setFields({
                                                    ...fields, err: '', charging_discharging: {
                                                        ...fields.charging_discharging,
                                                        charging_duration: {
                                                            ...fields.charging_discharging.charging_duration,
                                                            ric: {
                                                                ...fields.charging_discharging.charging_duration.ric,
                                                                left: {
                                                                    ...fields.charging_discharging.charging_duration.ric.left,
                                                                    to: e.toISOString(),
                                                                }

                                                            }
                                                        }
                                                    }
                                                })
                                            }
                                            type="End Time"
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>


                    <Box p={2} gap={4} mt={2} display={"flex"} alignItems={"center"} >
                        <Box>
                            <Typography variant='h4' color={"primary"} >
                                Number Of Charging Cycles With Case :
                            </Typography>
                        </Box>

                        <Box>
                            {<CustomInput
                                disabled={loading}
                                value={fields.charging_discharging.cycles_with_case}
                                onChange={(e) => setFields({
                                    ...fields, err: '', charging_discharging: {
                                        ...fields.charging_discharging,
                                        cycles_with_case: e.target.value
                                    }
                                })}
                                type="text"
                                label={"Cycles*"}

                            />}
                        </Box>
                    </Box>


                    <Box p={2} mt={2}>
                        <Box>

                            <Box display={"flex"} alignItems={"center"}>
                                <Box width={"20vw"}>
                                    <Typography variant='h4' color={"primary"} >Discharge Duration RIC :  </Typography>
                                </Box>

                                <Box gap={4} width={"100%"} display={"flex"} justifyContent={"space-around"} >
                                    <Box>
                                        <Typography variant='h4' color={"primary"}>RIGHT</Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant='h4' color={"primary"}>LEFT</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box display={"flex"} alignItems={"center"}>
                                <Box width={"20vw"}>
                                    <Typography variant='h5' color={"primary"}  >Day 1&nbsp;:  </Typography>
                                </Box>

                                <Box gap={4} width={"100%"} display={"flex"} justifyContent={"space-around"} >

                                    {/* Day 1 Right from to */}
                                    <Box gap={2} display={"flex"}>
                                        <Box>
                                            <TimePicker
                                                label={"From*"}
                                                renderInput={(props) => {
                                                    return <CustomInput {...props} sx={{ width: "10vw" }} />
                                                }}
                                                value={moment(fields?.charging_discharging?.discharging_duration?.ric?.day_1?.right?.from)}
                                                onChange={(e) =>
                                                    setFields({
                                                        ...fields, err: '', charging_discharging: {
                                                            ...fields.charging_discharging,
                                                            discharging_duration: {
                                                                ...fields.charging_discharging.discharging_duration,
                                                                ric: {
                                                                    ...fields.charging_discharging.discharging_duration.ric,
                                                                    day_1: {
                                                                        ...fields.charging_discharging.discharging_duration.ric.day_1,
                                                                        right: {
                                                                            ...fields.charging_discharging.discharging_duration.ric.day_1.right,
                                                                            from: e.toISOString(),
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    })
                                                }
                                                type="Start Time"
                                            />
                                        </Box>
                                        <Box>

                                            <TimePicker
                                                label={"To*"}
                                                renderInput={(props) => {
                                                    return <CustomInput {...props} sx={{ width: "10vw" }} />
                                                }}
                                                value={moment(fields?.charging_discharging?.discharging_duration?.ric?.day_1?.right?.to)}
                                                onChange={(e) =>
                                                    setFields({
                                                        ...fields, err: '', charging_discharging: {
                                                            ...fields.charging_discharging,
                                                            discharging_duration: {
                                                                ...fields.charging_discharging.discharging_duration,
                                                                ric: {
                                                                    ...fields.charging_discharging.discharging_duration.ric,
                                                                    day_1: {
                                                                        ...fields.charging_discharging.discharging_duration.ric.day_1,
                                                                        right: {
                                                                            ...fields.charging_discharging.discharging_duration.ric.day_1.right,
                                                                            to: e.toISOString(),
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    })
                                                }
                                                type="End Time"
                                            />
                                        </Box>
                                    </Box>


                                    {/* Day 1 Left from to */}
                                    <Box gap={2} display={"flex"}>
                                        <Box>
                                            <TimePicker
                                                label={"From*"}
                                                renderInput={(props) => {
                                                    return <CustomInput {...props} sx={{ width: "10vw" }} />
                                                }}
                                                value={moment(fields?.charging_discharging?.discharging_duration?.ric?.day_1?.left?.from)}
                                                onChange={(e) =>
                                                    setFields({
                                                        ...fields, err: '', charging_discharging: {
                                                            ...fields.charging_discharging,
                                                            discharging_duration: {
                                                                ...fields.charging_discharging.discharging_duration,
                                                                ric: {
                                                                    ...fields.charging_discharging.discharging_duration.ric,
                                                                    day_1: {
                                                                        ...fields.charging_discharging.discharging_duration.ric.day_1,
                                                                        left: {
                                                                            ...fields.charging_discharging.discharging_duration.ric.day_1.left,
                                                                            from: e.toISOString(),
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    })
                                                }
                                                type="Start Time"
                                            />
                                        </Box>
                                        <Box>

                                            <TimePicker
                                                label={"To*"}
                                                renderInput={(props) => {
                                                    return <CustomInput {...props} sx={{ width: "10vw" }} />
                                                }}
                                                value={moment(fields?.charging_discharging?.discharging_duration?.ric?.day_1?.left?.to)}
                                                onChange={(e) =>
                                                    setFields({
                                                        ...fields, err: '', charging_discharging: {
                                                            ...fields.charging_discharging,
                                                            discharging_duration: {
                                                                ...fields.charging_discharging.discharging_duration,
                                                                ric: {
                                                                    ...fields.charging_discharging.discharging_duration.ric,
                                                                    day_1: {
                                                                        ...fields.charging_discharging.discharging_duration.ric.day_1,
                                                                        left: {
                                                                            ...fields.charging_discharging.discharging_duration.ric.day_1.left,
                                                                            to: e.toISOString(),
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    })
                                                }
                                                type="End Time"
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            <Box display={"flex"} alignItems={"center"}>
                                <Box width={"20vw"}>
                                    <Typography variant='h5' color={"primary"}  >Day 2&nbsp;:  </Typography>
                                </Box>

                                <Box gap={4} width={"100%"} display={"flex"} justifyContent={"space-around"} >
                                    <Box gap={2} display={"flex"}>
                                        <Box>
                                            <TimePicker
                                                label={"From*"}
                                                renderInput={(props) => {
                                                    return <CustomInput {...props} sx={{ width: "10vw" }} />
                                                }}
                                                value={moment(fields?.charging_discharging?.discharging_duration?.ric?.day_2?.right?.from)}
                                                onChange={(e) =>
                                                    setFields({
                                                        ...fields, err: '', charging_discharging: {
                                                            ...fields.charging_discharging,
                                                            discharging_duration: {
                                                                ...fields.charging_discharging.discharging_duration,
                                                                ric: {
                                                                    ...fields.charging_discharging.discharging_duration.ric,
                                                                    day_2: {
                                                                        ...fields.charging_discharging.discharging_duration.ric.day_2,
                                                                        right: {
                                                                            ...fields.charging_discharging.discharging_duration.ric.day_2.right,
                                                                            from: e.toISOString(),
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    })
                                                }
                                                type="Start Time"
                                            />
                                        </Box>
                                        <Box>

                                            <TimePicker
                                                label={"To*"}
                                                renderInput={(props) => {
                                                    return <CustomInput {...props} sx={{ width: "10vw" }} />
                                                }}
                                                value={moment(fields?.charging_discharging?.discharging_duration?.ric?.day_2?.right?.to)}
                                                onChange={(e) =>
                                                    setFields({
                                                        ...fields, err: '', charging_discharging: {
                                                            ...fields.charging_discharging,
                                                            discharging_duration: {
                                                                ...fields.charging_discharging.discharging_duration,
                                                                ric: {
                                                                    ...fields.charging_discharging.discharging_duration.ric,
                                                                    day_2: {
                                                                        ...fields.charging_discharging.discharging_duration.ric.day_2,
                                                                        right: {
                                                                            ...fields.charging_discharging.discharging_duration.ric.day_2.right,
                                                                            to: e.toISOString(),
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    })
                                                }
                                                type="End Time"
                                            />
                                        </Box>
                                    </Box>

                                    <Box gap={2} display={"flex"}>
                                        <Box>
                                            <TimePicker
                                                label={"From*"}
                                                renderInput={(props) => {
                                                    return <CustomInput {...props} sx={{ width: "10vw" }} />
                                                }}
                                                value={moment(fields?.charging_discharging?.discharging_duration?.ric?.day_2?.left?.from)}
                                                onChange={(e) =>
                                                    setFields({
                                                        ...fields, err: '', charging_discharging: {
                                                            ...fields.charging_discharging,
                                                            discharging_duration: {
                                                                ...fields.charging_discharging.discharging_duration,
                                                                ric: {
                                                                    ...fields.charging_discharging.discharging_duration.ric,
                                                                    day_2: {
                                                                        ...fields.charging_discharging.discharging_duration.ric.day_2,
                                                                        left: {
                                                                            ...fields.charging_discharging.discharging_duration.ric.day_2.left,
                                                                            from: e.toISOString(),
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    })
                                                }
                                                type="Start Time"
                                            />
                                        </Box>
                                        <Box>

                                            <TimePicker
                                                label={"To*"}
                                                renderInput={(props) => {
                                                    return <CustomInput {...props} sx={{ width: "10vw" }} />
                                                }}
                                                value={moment(fields?.charging_discharging?.discharging_duration?.ric?.day_2?.left?.to)}
                                                onChange={(e) =>
                                                    setFields({
                                                        ...fields, err: '', charging_discharging: {
                                                            ...fields.charging_discharging,
                                                            discharging_duration: {
                                                                ...fields.charging_discharging.discharging_duration,
                                                                ric: {
                                                                    ...fields.charging_discharging.discharging_duration.ric,
                                                                    day_2: {
                                                                        ...fields.charging_discharging.discharging_duration.ric.day_2,
                                                                        left: {
                                                                            ...fields.charging_discharging.discharging_duration.ric.day_2.left,
                                                                            to: e.toISOString(),
                                                                        }
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    })
                                                }
                                                type="End Time"
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>



                            <Box display={"flex"} alignItems={"center"}>
                                <Box width={"20vw"}>
                                    <Typography variant='h5' color={"primary"}  >Total Duration&nbsp;:  </Typography>
                                </Box>

                                <Box gap={4} width={"100%"} display={"flex"} justifyContent={"space-around"} >
                                    <Box gap={2} display={"flex"}>
                                        <Box width={"20.5vw"}>
                                            {<CustomInput
                                                disabled={loading}
                                                value={`${fields.charging_discharging.discharging_duration.total_duration.right.total_hours}H ` +
                                                    `${fields.charging_discharging.discharging_duration.total_duration.right.total_minutes}Min.`
                                                }
                                                // onChange={(e) => setFields({ ...fields, err: '', name: e.target.value })}
                                                type="text"
                                                label={"Total*"}

                                            />}
                                        </Box>

                                    </Box>

                                    <Box gap={2} display={"flex"}>
                                        <Box width={"20.5vw"}>
                                            {<CustomInput
                                                disabled={loading}
                                                value={
                                                    `${fields.charging_discharging.discharging_duration.total_duration.left.total_hours}H ` +
                                                    `${fields.charging_discharging.discharging_duration.total_duration.left.total_minutes}Min.`
                                                }
                                                // onChange={(e) => setFields({ ...fields, err: '', name: e.target.value })}
                                                type="text"
                                                label={"Total*"}

                                            />}
                                        </Box>

                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                    </Box>

                </Box>

            </Box >
        </>
    )
}

export default ChargingDischargingCheckListUi