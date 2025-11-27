import React, { useState } from "react";
import { Box, Typography, Card, CardActionArea, Avatar, CircularProgress, Grid, Chip, Divider, Paper } from "@mui/material";
import { styled } from "@mui/system";
import leftDevice from "../../assets/images/bteLeft.svg";
import rightDevice from "../../assets/images/bteRight.svg";
import leftSideLogo from "../../assets/images/leftSideSmall.svg";
import rightSideLogo from "../../assets/images/rightSideSmall.svg";

const Header = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: 600,
    marginBottom: theme.spacing(4),
}));

const CenterArea = styled(Box)(({ theme }) => ({
    maxWidth: 760,
    margin: "0 auto",
    textAlign: "center",
}));

const Instruction = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    color: theme.palette.text.secondary,
}));

const DeviceCard = styled(Card, { shouldForwardProp: (p) => p !== "selected" })(({ selected, theme }) => ({
    width: 165,
    height: 200,
    borderRadius: 8,
    border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
    boxShadow: selected ? "0 6px 18px rgba(0,0,0,0.06)" : "none",
    transition: "transform 160ms ease, box-shadow 160ms ease",
    background: selected ? (theme.palette.mode === "light" ? "#eef8fb" : undefined) : theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1),
}));

const DeviceImage = styled("img")(({ theme }) => ({
    width: 86,
    height: 86,
    objectFit: "contain",
    marginBottom: theme.spacing(1),
}));

const ChipRow = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    justifyContent: "center",
    marginTop: theme.spacing(1),
}));

const DeviceConnectUi = () => {
    const [selected, setSelected] = useState("");

    const devices = [
        { side: "L", label: "BTE" },
        { side: "R", label: "BTE" },
    ];

    return (
        <Box>
            <Header variant="h4">Device Dashboard</Header>

            <CenterArea>
                <Instruction variant="h5">Select device to establish connection</Instruction>

                <Grid container spacing={3} justifyContent="center">
                    {devices.map((item) => (
                        <Grid onClick={() => setSelected(item.side)} item key={item.side}>
                            <DeviceCard selected={selected === item.side}>
                                <CardActionArea
                                    sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <DeviceImage src={item?.side === "L" ? leftDevice : rightDevice} alt={`device-${item.side}`} />
                                        <ChipRow>
                                            <Box gap={2} sx={{ width:"100%", display: "flex", alignItems: "center", justifyContent:"space-around" }}>
                                            <Avatar sx={{ width: 22, height: 22, bgcolor: selected === item.side ? "primary.main" : "grey.200", color: selected === item.side ? "white" : "text.primary", fontSize: 12 }}>
                                                {item?.side === "L" ? <img src={leftSideLogo} alt="L" /> : <img src={rightSideLogo} alt="R" />}
                                            </Avatar>
                                            <Divider  orientation="vertical" variant="middle" flexItem sx={{ color:"#DDD"}} />
                                            <Typography variant="h6" sx={{ ml: 0.5, fontWeight: "bold" }}>{item.label}</Typography>
                                            </Box>
                                        </ChipRow>
                                    </Box>
                                </CardActionArea>
                            </DeviceCard>
                        </Grid>
                    ))}
                </Grid>

                {/* <Box sx={{ mt: 6, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "text.secondary" }}>
          <CircularProgress size={28} thickness={4} />
          <Typography variant="body2" sx={{ mt: 1 }}>Establishing connection...</Typography>
        </Box> */}
            </CenterArea>
        </Box>
    );
}

export default DeviceConnectUi