import { Box, FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography } from '@mui/material'
import React from 'react'
import { YES_NO } from '../../utils/constants'

const AppearanceChecklistUi = ({ fields, setFields, loading, onClick }) => {


    return (
        <>

            <Box>


                <Box mt={6} sx={{ border: "1px solid black", borderRadius: "10px" }}>

                    <Grid p={4} md={12} sm={12} xs={12} container >

                        <Grid p={2} md={12} sm={12} xs={12} display={"flex"} flexDirection={"row"} sx={{ borderBottom: "1px solid black" }}>
                            <Grid md={8} sm={8} xs={8} >
                                <Box display={"flex"} justifyContent={"center"}>
                                    <Typography variant='h4' color={"primary"} >Appearance Check List</Typography>
                                </Box>
                            </Grid>

                            <Grid md={4} sm={4} xs={4} >
                                <Box display={"flex"} ml={4} justifyContent={"center"}>
                                    <Typography variant='h4' color={"primary"}>Mark Please</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid mt={4} md={8} sm={8} xs={8} sx={{ borderRight: "1px solid black" }}>
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>All Parts Should Be Fully Assembled And Fixed Reliably. </Typography>
                        </Grid>

                        <Grid mt={4} md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.appearance_checklist?.all_parts_fixed}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            appearance_checklist: {
                                                ...fields?.appearance_checklist,
                                                all_parts_fixed: JSON.parse(e.target.value),
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
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>Words Symbols Or Marks Should Be Clear, Correct And Firm. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px" }}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.appearance_checklist?.symbols_clear}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            appearance_checklist: {
                                                ...fields?.appearance_checklist,
                                                symbols_clear: JSON.parse(e.target.value),
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
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>The Surface Should Be Free Of Burrs: Flashes, Dents, Scratches And Other Defects.</Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.appearance_checklist?.surface_free_of_defects}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            appearance_checklist: {
                                                ...fields?.appearance_checklist,
                                                surface_free_of_defects: JSON.parse(e.target.value),
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
                            <Typography variant='h6' color={"primary"} >Ear Hook, Sound Guide Tube, earplugs, Battery Positive And Negative Connection Should Be Reliable And Effective. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px" }}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.appearance_checklist?.ear_hook_and_connections_reliable}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            appearance_checklist: {
                                                ...fields?.appearance_checklist,
                                                ear_hook_and_connections_reliable: JSON.parse(e.target.value),
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
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#fff" }}>The Operation Of Adjustment Buttons Switches, Battery Doors And Other Mechanisms Should Be Flexible And Effective. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.appearance_checklist?.operation_of_switches_and_battery}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            appearance_checklist: {
                                                ...fields?.appearance_checklist,
                                                operation_of_switches_and_battery: JSON.parse(e.target.value),
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
                            <Typography variant='h6' color={"primary"} sx={{ p: 2, backgroundColor: "#E5E5E5" }}>The Appearance Of The Whole HA & Case Has No Defects Such As Scratches, Indentations And Heterochromatic Spots. </Typography>
                        </Grid>

                        <Grid md={4} sm={4} xs={4} sx={{ backgroundColor: "#E5E5E5", padding: "1px" }}>

                            <FormControl sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <RadioGroup
                                    row
                                    value={fields?.appearance_checklist?.overall_appearance_no_defects}
                                    onChange={(e) =>
                                        setFields({
                                            ...fields,
                                            err: "",
                                            appearance_checklist: {
                                                ...fields?.appearance_checklist,
                                                overall_appearance_no_defects: JSON.parse(e.target.value),
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

export default AppearanceChecklistUi