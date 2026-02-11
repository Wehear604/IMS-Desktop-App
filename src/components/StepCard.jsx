import {
  Box,
  Card,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import disabledChecked from "../assets/images/checkIconDisabled.svg";
import enabledChecked from "../assets/images/checkIconEnabled.svg";

const StepCard = ({
  isChecked,
  checked,
  title,
  subtitle,
  action,
  checkBox,
}) => {
  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 2,
        boxShadow: 0,
        border: "1px solid #e6e6e6",
        mb: 2,
      }}
    >
      <List>
        <ListItem
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display={"flex"} gap={4} alignItems="center">
            {isChecked ? (
              <img
                src={checked ? enabledChecked : disabledChecked}
                alt="check"
              />
            ) : (
              checkBox && <Box>{checkBox}</Box>
            )}
            <ListItemText
              primary={<Typography variant="h5">{title}</Typography>}
              secondary={
                subtitle ? (
                  <Typography variant="h6">{subtitle}</Typography>
                ) : null
              }
            />
          </Box>
          {action && <Box>{action}</Box>}
        </ListItem>
      </List>
    </Card>
  );
};

export default StepCard;
