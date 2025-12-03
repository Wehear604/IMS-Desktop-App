import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Checkbox,
    Divider,
    Stack,
    Container,
} from "@mui/material";

// Static version of the Product Details UI
const ProductDetailsQcUi = () => {
    const [state, setState] = useState({
        volume1: false,
        volume2: false,
        mode1: false,
        mode2: false,
        mode3: false,
        body1: false,
        body2: false,
        charging: false,
        mic: false,
    });

    const toggle = (key) => () => {
        setState((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <>
            {/* <Container maxWidth="md" sx={{ py: 4 }}> */}
            {/* <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #e0e0e0" }}> */}

            <Box sx={{ p: 3, width: "100%" }}>
                <Stack spacing={3}>
                    {/* VOLUME */}
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#6b6b6b", mb: 1 }}>
                            VOLUME
                        </Typography>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 1.25,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                                borderColor: "#efefef"
                            }}
                        >
                            {/* Row 1 */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Checkbox checked={state.volume1} onChange={toggle("volume1")} />
                                <Typography variant="body2">Volume level Increased</Typography>
                            </Box>

                            {/* Row 2 */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Checkbox checked={state.volume2} onChange={toggle("volume2")} />
                                <Typography variant="body2">Volume level Decreased</Typography>
                            </Box>
                        </Paper>

                    </Box>

                    {/* MODE */}
                    {/* <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#6b6b6b", mb: 1 }}>
                MODE
              </Typography>
              <Stack spacing={1}>
                <Paper variant="outlined" sx={{ p: 1.25, display: "flex", alignItems: "center", gap: 2 }}>
                  <Checkbox checked={state.mode1} onChange={toggle("mode1")} />
                  <Typography variant="body2">First mode has been tested</Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 1.25, display: "flex", alignItems: "center", gap: 2 }}>
                  <Checkbox checked={state.mode2} onChange={toggle("mode2")} />
                  <Typography variant="body2">Second mode has been tested</Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 1.25, display: "flex", alignItems: "center", gap: 2 }}>
                  <Checkbox checked={state.mode3} onChange={toggle("mode3")} />
                  <Typography variant="body2">Third mode has been tested</Typography>
                </Paper>
              </Stack>
            </Box> */}

                    {/* BODY */}
                    {/* <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#6b6b6b", mb: 1 }}>
                BODY
              </Typography>
              <Stack spacing={1}>
                <Paper variant="outlined" sx={{ p: 1.25, display: "flex", alignItems: "center", gap: 2 }}>
                  <Checkbox checked={state.body1} onChange={toggle("body1")} />
                  <Typography variant="body2">Device checked for damage</Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 1.25, display: "flex", alignItems: "center", gap: 2 }}>
                  <Checkbox checked={state.body2} onChange={toggle("body2")} />
                  <Typography variant="body2">Body checked for scratches</Typography>
                </Paper>
              </Stack>
            </Box> */}

                    {/* CHARGING */}
                    {/* <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#6b6b6b", mb: 1 }}>
                CHARGING
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.25, display: "flex", alignItems: "center", gap: 2 }}>
                <Checkbox checked={state.charging} onChange={toggle("charging")} />
                <Typography variant="body2">Charging function has been verified</Typography>
              </Paper>
            </Box> */}

                    {/* MIC */}
                    {/* <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#6b6b6b", mb: 1 }}>
                MIC
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.25, display: "flex", alignItems: "center", gap: 2 }}>
                <Checkbox checked={state.mic} onChange={toggle("mic")} />
                <Typography variant="body2">Microphone has been tested</Typography>
              </Paper>
            </Box> */}
                </Stack>
            </Box>
            {/* </Paper> */}
            {/* </Container> */}
        </>
    );
}

export default ProductDetailsQcUi;