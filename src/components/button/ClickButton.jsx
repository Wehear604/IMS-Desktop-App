import {
    Button,
    FormControl,
    MenuItem,
    Select,
    Skeleton,
    Typography,
  } from "@mui/material";
  import { center } from "../../assets/css/theme/common";
  const buttonStyle = (theme, hideShadow) => {
    return {
      ...center,
  
      width: "100%",
      height:"15vh",
      marginTop: "20px",
      boxShadow: hideShadow ? "none" : 2,
      border: "2px solid " + theme.palette.grey.main,
      flexDirection: "column",
      overflow: "hidden",
      background: theme.palette.light.main,
  
      h2: {
        transition: "all 0.1s linear",
        color: theme.palette.dark.main,
      },
      ":disabled": {
        cursor: "default",
        ":hover": {
          background: theme.palette.primary.main,
        },
        h4: {
          color: theme.palette.light.main,
        },
        h1: {
          color: theme.palette.primary.main,
        },
      },
      ":hover": {
        background: theme.palette.primary.main,
        color: theme.palette.light.main,
        h3: {
          color: theme.palette.light.main,
        },
        h5: {
          color: theme.palette.light.main,
        },

      },
    };
  };
  
  const skeletonStyle = (theme) => {
    return {
      ...center,
      width: "100%",
      boxShadow: 2,
    };
  };
  
  const activeButtonStyle = (theme) => {
    return {
      ...center,
      width: "100%",
      boxShadow: 2,
      marginTop: "20px",
      flexDirection: "column",
      background: theme.palette.primary.main,
      color: theme.palette.light.main,
      ":hover": {
        background: theme.palette.primary.main,
      },
    };
  };
  
  const dropDownStyle = (theme) => {
    return {
      position: "absolute",
      bottom: "0px",
  
      display: "flex",
      textAlign: "left",
      px: 1,
      flexDirection: "column",
  
      left: 0,
      borderBottomLeftRadius: theme.shape.borderRadius,
      borderBottomRightRadius: theme.shape.borderRadius,
      width: "100%",
      "::before": {
        display: "none !important",
      },
      background: theme.palette.light.main,
      color: theme.palette.dark.main,
    };
  };
  const ClickButton = ({
    loading,
    active,
    title,
    subTitle,
    icon,
    dropDownData,
    dropDownProps,
    ...props
  }) => {
    if (loading) {
      return <Skeleton variant="rounded" sx={skeletonStyle} />;
    }
    return (
      <Button
        {...props}
        fullWidth={true}
        sx={active ? activeButtonStyle : buttonStyle}
        marg
      >
        {icon}
        <Typography variant="h3" color={"#255766"}>{title}</Typography>
        <Typography variant="h5" color={"#808080"}>{subTitle}</Typography>
  
        {dropDownData && Array.isArray(dropDownData) && (
          <FormControl variant="standard" sx={dropDownStyle} fullWidth={true}>
            <Select
              fullWidth={true}
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="select interval"
              sx={{ ":before": { display: "none" } }}
              {...dropDownProps}
            >
              {dropDownData.map((item) => {
                return (
                  <MenuItem key={item.id} value={item.id}>
                    {item.label}
                  </MenuItem>
                );
              })}
              <MenuItem value={" "}>Lifetime</MenuItem>
            </Select>
          </FormControl>
        )}
      </Button>
    );
  };
  export default ClickButton;
  