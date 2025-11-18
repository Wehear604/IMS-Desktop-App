import { Box, Button, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, Typography } from '@mui/material'
import React from 'react'
import { YES_NO } from '../../utils/constants'

const TechnicalParameterCheckListUi = ({ fields, setFields, loading, onClick }) => {
    console.log("object TechnicalParameter", fields);


    return (
        <>

            <Box>


                <Box mt={6} sx={{ border: "1px solid black", borderRadius: "10px" }}>

                    <Grid p={4} md={12} sm={12} xs={12} container >

                        <Grid p={2} md={12} sm={12} xs={12} display={"flex"} flexDirection={"row"} sx={{ borderBottom: "1px solid black" }}>
                            <Grid md={8} sm={8} xs={8} >
                                <Box display={"flex"} justifyContent={"center"}>
                                    <Typography variant='h4' color={"primary"} >Technical Parameter Check List</Typography>
                                </Box>
                            </Grid>

                            <Grid md={4} sm={4} xs={4} >
                                <Box display={"flex"} ml={4} justifyContent={"center"}>
                                    <Typography variant='h4' color={"primary"}>Mark Please</Typography>

                                </Box>
                            </Grid>
                        </Grid>

                        <Grid mt={4} md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }} display={"flex"} flexDirection={"row"}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>Max OSPL90. : </Typography>
                            <Typography variant='h6' color={"primary"} fontWeight={"bold"} sx={{ p: 2, backgroundColor: "#fff" }} >120dB + 3dB. </Typography>

                        </Grid>

                        <Grid mt={4} md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.technical_parameter_checklist?.max_ospl90}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            technical_parameter_checklist: {
                                                ...fields?.technical_parameter_checklist,
                                                max_ospl90: JSON.parse(e.target.value),
                                            }
                                        }
                                        )}
                                >
                                    {Object.keys(YES_NO).map((item) => (
                                        <FormControlLabel
                                            disabled={loading}
                                            key={item}
                                            value={YES_NO[item]}
                                            control={<Radio size="small" sx={{ marginLeft: "40px" }} />}
                                            label={<Typography variant='h6'>{item}</Typography>}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }} display={"flex"} flexDirection={"row"}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Average. : </Typography>
                            <Typography variant='h6' color={"primary"} fontWeight={"bold"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>117dB + 4dB. </Typography>

                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px" }}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.technical_parameter_checklist?.average}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            technical_parameter_checklist: {
                                                ...fields?.technical_parameter_checklist,
                                                average: JSON.parse(e.target.value),
                                            }
                                        })
                                    }
                                >
                                    {Object.keys(YES_NO).map((item) => (
                                        <FormControlLabel
                                            disabled={loading}
                                            key={item}
                                            value={YES_NO[item]}
                                            control={<Radio size="small" sx={{ marginLeft: "40px" }} />}
                                            label={<Typography variant='h6'>{item}</Typography>}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#fff", padding: "1px" }} display={"flex"} flexDirection={"row"}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>Average Sound Gain. : </Typography>
                            <Typography variant='h6' color={"primary"} fontWeight={"bold"} sx={{ p: 2, backgroundColor: "#fff" }}>55dB + 5dB. </Typography>

                        </Grid>

                        <Grid md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.technical_parameter_checklist?.average_sound_gain}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            technical_parameter_checklist: {
                                                ...fields?.technical_parameter_checklist,
                                                average_sound_gain: JSON.parse(e.target.value),
                                            }
                                        })
                                    }
                                >
                                    {Object.keys(YES_NO).map((item) => (
                                        <FormControlLabel
                                            disabled={loading}
                                            key={item}
                                            value={YES_NO[item]}
                                            control={<Radio size="small" sx={{ marginLeft: "40px" }} />}
                                            label={<Typography variant='h6'>{item}</Typography>}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }} display={"flex"} flexDirection={"row"}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Equivalent Input Noise. : </Typography>
                            <Typography variant='h6' color={"primary"} fontWeight={"bold"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>&le; 20dB + 3dB. </Typography>

                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px" }}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.technical_parameter_checklist?.equivalent_input_noise}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            technical_parameter_checklist: {
                                                ...fields?.technical_parameter_checklist,
                                                equivalent_input_noise: JSON.parse(e.target.value),
                                            }
                                        }
                                        )}
                                >
                                    {Object.keys(YES_NO).map((item) => (
                                        <FormControlLabel
                                            disabled={loading}
                                            key={item}
                                            value={YES_NO[item]}
                                            control={<Radio size="small" sx={{ marginLeft: "40px" }} />}
                                            label={<Typography variant='h6'>{item}</Typography>}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#fff", padding: "1px" }} display={"flex"} flexDirection={"row"}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>Total Harmonic Distortion. : </Typography>
                            <Typography variant='h6' color={"primary"} fontWeight={"bold"} sx={{ p: 2, backgroundColor: "#fff" }}> &le; 3%. </Typography>

                        </Grid>

                        <Grid md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.technical_parameter_checklist?.total_harmonic_distortion}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            technical_parameter_checklist: {
                                                ...fields?.technical_parameter_checklist,
                                                total_harmonic_distortion: JSON.parse(e.target.value),
                                            }
                                        }
                                        )}
                                >
                                    {Object.keys(YES_NO).map((item) => (
                                        <FormControlLabel
                                            disabled={loading}
                                            key={item}
                                            value={YES_NO[item]}
                                            control={<Radio size="small" sx={{ marginLeft: "40px" }} />}
                                            label={<Typography variant='h6'>{item}</Typography>}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Grid>


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }} display={"flex"} flexDirection={"row"}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Frequency Response. : </Typography>
                            <Typography variant='h6' color={"primary"} fontWeight={"bold"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>200` 6000Hz. </Typography>

                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px" }}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.technical_parameter_checklist?.frequency_response}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            technical_parameter_checklist: {
                                                ...fields?.technical_parameter_checklist,
                                                frequency_response: JSON.parse(e.target.value),
                                            }
                                        }
                                        )}
                                >
                                    {Object.keys(YES_NO).map((item) => (
                                        <FormControlLabel
                                            disabled={loading}
                                            key={item}
                                            value={YES_NO[item]}
                                            control={<Radio size="small" sx={{ marginLeft: "40px" }} />}
                                            label={<Typography variant='h6'>{item}</Typography>}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#fff", padding: "1px" }} display={"flex"} flexDirection={"row"}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>Rated Supply Current Consumption. : </Typography>
                            <Typography variant='h6' color={"primary"} fontWeight={"bold"} sx={{ p: 2, backgroundColor: "#fff" }}>&le; 3mA. </Typography>

                        </Grid>

                        <Grid md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.technical_parameter_checklist?.rated_supply_current_consumption}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            technical_parameter_checklist: {
                                                ...fields?.technical_parameter_checklist,
                                                rated_supply_current_consumption: JSON.parse(e.target.value),
                                            }
                                        }
                                        )}
                                >
                                    {Object.keys(YES_NO).map((item) => (
                                        <FormControlLabel
                                            disabled={loading}
                                            key={item}
                                            value={YES_NO[item]}
                                            control={<Radio size="small" sx={{ marginLeft: "40px" }} />}
                                            label={<Typography variant='h6'>{item}</Typography>}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                        </Grid>
                    </Grid>


                </Box>
            </Box >

        </>
    )
}

export default TechnicalParameterCheckListUi