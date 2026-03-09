import {
  Box,
  Button,
  Card,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React from "react";
import {
  BUTTON_STATUS_COLOR_TYPE,
  STATUS_COLOR_TYPE,
} from "../../utils/constants";
import { formatNumberCustomPattern } from "../../utils/main";

const ButtonComponentsUi = ({
  count,
  onSubmit,
  Title,
  ButtonGroup,
  colorType,
  STATUSWiseData,
  CountButtonGroup,
  width = "18vw",
  fontSize = "16px",
  ButtonGroupWidth="100%"
}) => {
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("lg"))

  return (
    <>
      {!ButtonGroup ? (
        <Card
          variant="outlined"
          onClick={onSubmit}
          sx={{
            backgroundColor: STATUS_COLOR_TYPE(colorType),
            width: width,
            borderRadius: "8px",
            border: colorType ? "3px solid #1B4381" : "1px solid rgb(129, 166, 222)",
            cursor: "pointer",
          }}
        >
          <Box
            sx={{
              display: "flex",
              height: "15vh",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px",
              flexDirection: "column"
            }}
          >
            <Typography
              variant={isSmallScreen ? "body2" : "h4"}
              sx={{
                fontWeight: "bold",
                color: colorType ? "white" : "#1B4381",
                textTransform: "uppercase",
              }}
            >
              {Title}
            </Typography>

            {(count || count === 0) && <Typography
              variant={isSmallScreen ? "h4" : "h1"}
              sx={{
                fontWeight: "bold",
                color: colorType ? "white" : "#1B4381",
              }}
            >
              {formatNumberCustomPattern(count)}
            </Typography>}
          </Box>
        </Card>

      ) : (
        <Button
          onClick={onSubmit}
          variant={BUTTON_STATUS_COLOR_TYPE(STATUSWiseData)}
          sx={{
            height: "5vh",
            width: ButtonGroupWidth,
            borderRadius: "8px",
            backgroundColor: STATUS_COLOR_TYPE(STATUSWiseData),
            border: STATUSWiseData ? "2px solid #255766" : "1px solid #255766",
            padding: "5px",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontSize: fontSize,
              color: STATUSWiseData ? "#fff" : "#255766",
            }}
          >
            {Title} {CountButtonGroup &&
              <>
                ({formatNumberCustomPattern(CountButtonGroup)})
              </>
            }
          </Typography>

        </Button>
      )}
    </>
  );
};

export default ButtonComponentsUi;
