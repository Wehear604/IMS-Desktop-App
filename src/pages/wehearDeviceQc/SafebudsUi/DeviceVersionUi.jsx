import React from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
} from "@mui/material";
import bluetoothIcon from "../../../assets/images/bluetoothIcon.svg";
import { useSelector } from "react-redux";
import { cleanValue, findObjectKeyByValue } from "../../../utils/main";
import { DEVICES_NAME, LISTENING_SIDE } from "../../../utils/constants";

const DeviceVersionUi = () => {
  const { device } = useSelector((state) => state);

  const currentVersion = cleanValue(device?.version);
  const latestVersion = cleanValue(device?.latestVersion);

  const isUpdated = currentVersion === latestVersion;

  const items = [
    {
      title: "Device Version",
      value: currentVersion,
      color: isUpdated ? "#16A34A" : "#DC2626",
      bg: "linear-gradient(135deg, #ffffff, #f8fafc)",
      status: isUpdated ? "Up-to-date" : "Update Required",
    },
    {
      title: "Latest / Required Version",
      value: latestVersion,
      color: "#045169",
      bg: "linear-gradient(135deg, #E0F7FA, #F0FDFF)",
      status: "Latest",
    },
  ];

    const sideLabel =
      findObjectKeyByValue(device?.device_side, LISTENING_SIDE) ?? "";
    const deviceTitle = DEVICES_NAME[device?.device_type] ?? "Unknown Device";

  return (
    <Box
      sx={{
        width: "100%",
        mt: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Heading */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          // mb: 5,
          background: "linear-gradient(90deg, #045169, #0E7490)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Device Version Information
      </Typography>

              <Box mb={4} textAlign="center">
                <Typography variant="h4" fontWeight={700}>
                  Device Connected{" "}
                  <img
                    src={bluetoothIcon}
                    alt="Bluetooth"
                    style={{ marginLeft: 6 }}
                  />
                </Typography>
                <Typography variant="h5" sx={{ color: "#DDD" }}>
                  {deviceTitle}
                </Typography>
                <Typography variant="h6">{device?.mac}</Typography>
              </Box>

      {/* Centered Container */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1000,
        }}
      >
        <Grid
          container
          spacing={4}
          justifyContent="center"
        >
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  borderRadius: 4,
                  p: 4,
                  height: 160,
                  background: item.bg,
                  boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0px 18px 40px rgba(0,0,0,0.12)",
                  },
                }}
              >
                {/* Top Content */}
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#64748B",
                      mb: 2,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      color: item.color,
                      letterSpacing: 1,
                    }}
                  >
                    {item.value || "—"}
                  </Typography>
                </Box>

                {/* Status Chip */}
                <Chip
                  label={item.status}
                  sx={{
                    alignSelf: "flex-start",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    fontSize: 14,
                    backgroundColor: item.color,
                    color: "#fff",
                    borderRadius: 2,
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DeviceVersionUi;
