import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useState } from "react";
import { getDateFiltersTime } from "../../../utils/main";
import CustomInput from "../../inputs/CustomInputs";
import SubmitButton from "../../button/SubmitButton";
import { DATE_TIME_FILTERS } from "../../../utils/constants";
import { StyledSearchBar } from "../../inputs/SearchBar";

const TimeRangeSelector = ({
  value,
  onChange,
  defaultVal,
  placeHolder = "Select Time Duration",
}) => {
  const [customDate, setCustomDate] = useState({
    startDate: moment(),
    endDate: moment().add(1, "days"),
  });
  const handleClose = () => {
    setDateModal(false);
  };
  const [dateModal, setDateModal] = useState(false);
  const onChangeDate = (e, newVal) => {
    if (newVal._id == "custom") {
      setDateModal(true);
    } else {
      onChange(getDateFiltersTime(newVal ? newVal._id : null));
    }
  };
  return (
    <>
      <Dialog
        open={dateModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { minHeight: '300px', display: 'flex', flexDirection: 'column' },
        }}
      >
        <DialogTitle>
          <Typography variant="h4">Select Range</Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Box display="flex" flexDirection="column" gap={3} width="100%">
            <DatePicker
              inputFormat="DD/MM/YYYY"
              label="From*"
              value={customDate.startDate}
              renderInput={(props) => <CustomInput {...props} />}
              onChange={async (changedVal) => {
                const newVal = changedVal;
                setCustomDate({
                  ...customDate,
                  startDate: changedVal.startOf('date'),
                  endDate: moment(newVal).add(1, "month"),
                });
              }}
            />

            <DatePicker
              inputFormat="DD/MM/YYYY"
              label="To*"
              minDate={customDate.startDate}
              value={customDate.endDate}
              renderInput={(props) => <CustomInput {...props} />}
              onChange={async (changedVal) => {
                setCustomDate({
                  ...customDate,
                  endDate: changedVal.endOf('date'),
                });
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <SubmitButton
            title="Submit"
            onClick={() => {
              onChange({
                startDate: customDate.startDate.valueOf(),
                endDate: customDate.endDate.valueOf(),
              });
              handleClose();
            }}
          />
        </DialogActions>
      </Dialog>

      <Autocomplete
        disableClearable
        defaultValue={defaultVal ?? null}
        onChange={onChangeDate}
        options={[
          { label: "All", _id: null },
          ...Object.keys(DATE_TIME_FILTERS).map((key) => ({
            label: DATE_TIME_FILTERS[key],
            _id: key,
          })),
          { label: "Custom", _id: "custom" },
        ]}
        sx={{
          width: "100%",
          display: "flex",
          "*": { display: "flex", justifyContent: "center" },
        }}
        renderInput={(params) => (
          <StyledSearchBar placeholder={placeHolder} {...params} size="small" />
        )}
      />
    </>
  );
};
export default TimeRangeSelector;
