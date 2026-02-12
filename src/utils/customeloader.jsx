import { Backdrop, CircularProgress, Stack, Typography } from "@mui/material";

const VersionCheckingLoader = ({ open }) => {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        color: "#fff",
        flexDirection: "column",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress color="inherit" />
        <Typography variant="h6">
          Version Checking...
        </Typography>
      </Stack>
    </Backdrop>
  );
};

export default VersionCheckingLoader;
