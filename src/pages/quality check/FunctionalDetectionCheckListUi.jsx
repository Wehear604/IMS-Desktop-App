import { Box, Button, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, Typography } from '@mui/material'
import React from 'react'
import { YES_NO } from '../../utils/constants'

const FunctionalDetectionCheckListUi = ({ fields, setFields, loading, onClick }) => {
    console.log("object functionDetection", fields);


    return (
        <>

            <Box>


                <Box mt={6} sx={{ border: "1px solid black", borderRadius: "10px" }}>

                    <Grid p={4} md={12} sm={12} xs={12} container >

                        <Grid p={2} md={12} sm={12} xs={12} display={"flex"} flexDirection={"row"} sx={{ borderBottom: "1px solid black" }}>
                            <Grid md={8} sm={8} xs={8} >
                                <Box display={"flex"} justifyContent={"center"}>
                                    <Typography variant='h4' color={"primary"} >Functional Detection Check List</Typography>
                                </Box>
                            </Grid>

                            <Grid md={4} sm={4} xs={4} >
                                <Box display={"flex"} ml={4} justifyContent={"center"}>
                                    <Typography variant='h4' color={"primary"}>Mark Please</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid mt={4} md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>No Sound. </Typography>
                        </Grid>

                        <Grid mt={4} md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", justifyContent: "center" }}>
                                <RadioGroup
                                    row

                                    value={fields?.functional_detection_checklist?.no_sound}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            functional_detection_checklist: {
                                                ...fields?.functional_detection_checklist,
                                                no_sound: JSON.parse(e.target.value),
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


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Small Sound/Noise/ Howling. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px" }}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.functional_detection_checklist?.small_sound_noise_howling}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            functional_detection_checklist: {
                                                ...fields?.functional_detection_checklist,
                                                small_sound_noise_howling: JSON.parse(e.target.value),
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
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>The volume Adjustment Function Is Normal, The Knob/Buttons Feels good and there is no scratch.</Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.functional_detection_checklist?.volume_adjustment_function}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            functional_detection_checklist: {
                                                ...fields?.functional_detection_checklist,
                                                volume_adjustment_function: JSON.parse(e.target.value),
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


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>The switch Function is Normal And Working Well. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px" }}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.functional_detection_checklist?.switch_function_normal}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            functional_detection_checklist: {
                                                ...fields?.functional_detection_checklist,
                                                switch_function_normal: JSON.parse(e.target.value),
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
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>The Product Has No Abnormal Sound. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.functional_detection_checklist?.product_no_abnormal_sound}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            functional_detection_checklist: {
                                                ...fields?.functional_detection_checklist,
                                                product_no_abnormal_sound: JSON.parse(e.target.value),
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


                        <Grid md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black", backgroundColor: "#E5E5E5", padding: "1px" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>The Indicator Lights Are Working Fine And Birghtness Is Normal. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px" }}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.functional_detection_checklist?.indicator_lights_working}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            functional_detection_checklist: {
                                                ...fields?.functional_detection_checklist,
                                                indicator_lights_working: JSON.parse(e.target.value),
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
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>No Explosion, No charging, Unsaturated Charging etc. (Any Abnormal Activity In CHG/DHG). </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.functional_detection_checklist?.no_explosion_abnormal_charging}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            functional_detection_checklist: {
                                                ...fields?.functional_detection_checklist,
                                                no_explosion_abnormal_charging: JSON.parse(e.target.value),
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

export default FunctionalDetectionCheckListUi