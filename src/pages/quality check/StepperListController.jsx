import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import AppearanceChecklistUi from './AppearanceChecklistUi';
import { Paper, StepLabel } from '@mui/material';
import FunctionalDetectionCheckListUi from './FunctionalDetectionCheckListUi';
import TechnicalParameterCheckListUi from './TechnicalParameterCheckListUi';
import ChargingDischargingCheckListUi from './ChargingDischargingCheckListUi';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { QcFetchBySerialNoCheckListApi, updateQcCheckListApi } from '../../apis/qc.api';
import useValidate from '../../store/hooks/useValidator';
import { closeModal } from '../../store/actions/modalAction';
import { callSnackBar } from '../../store/actions/snackbarAction';
import { SNACK_BAR_VARIETNS } from '../../utils/constants';
import { useDispatch } from 'react-redux';
import { callApiAction } from '../../store/actions/commonAction';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import moment from 'moment';

const steps = ['Appearance Check List', 'Functional Detection Check List', 'Technical Parameter Check List', 'Charging Discharging Check List'];

const StepperListController = ({ callBack = () => { }, id, isModal, handleAreaModalClose }) => {
  const [activeStep, setActiveStep] = useState(3);
  const [completed, setCompleted] = useState({});
  const params = useParams();
  const validate = useValidate();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [originalDocument, setOriginalDocument] = useState({})
  const dispatch = useDispatch()
  const currentPath = location.pathname;

  const { product_id, batch_no } = useParams();
  const newPath = `/quality-check/batch-list/${product_id}/${batch_no}`;
  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };


  const handleComplete = () => {
    setCompleted({
      ...completed,
      [activeStep]: true,
    });
    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };


  const [fields, setFields] = useState({
    err: "",
    appearance_checklist: {
      all_parts_fixed: null,
      symbols_clear: null,
      surface_free_of_defects: null,
      ear_hook_and_connections_reliable: null,
      operation_of_switches_and_battery: null,
      overall_appearance_no_defects: null,
    },

    functional_detection_checklist: {
      no_sound: null,
      small_sound_noise_howling: null,
      volume_adjustment_function: null,
      switch_function_normal: null,
      product_no_abnormal_sound: null,
      indicator_lights_working: null,
      no_explosion_abnormal_charging: null,

    },

    technical_parameter_checklist: {
      max_ospl90: null,
      average: null,
      average_sound_gain: null,
      equivalent_input_noise: null,
      total_harmonic_distortion: null,
      frequency_response: null,
      rated_supply_current_consumption: null,

    },

    charging_discharging: {
      charging_duration: {
        case: {
          from: moment().toISOString(),
          to: moment().toISOString(),
          total_hours: "",
          total_minutes: "",
        },
        
        ric: {
          right: {
            from: moment().toISOString(),
            to: moment().toISOString(),
          },
          left: {
            from: moment().toISOString(),
            to: moment().toISOString(),
          }
        },
      },


      cycles_with_case: "",


      discharging_duration: {
        ric: {
          day_1: {
            right: {
              from: null,
              to: null,
            },
            left: {
              from: null,
              to: null,
            },
          },
          day_2: {
            right: {
              from: null,
              to: null,
            },
            left: {
              from: null,
              to: null,
            },
          },
        },
        total_duration: {
          right: {
            total_hours: null,
            total_minutes: null,
          },
          left: {
            total_hours: null,
            total_minutes: null,
          },
        },
      },

    },

  });


  const validationSchemaForUpdate = useMemo(
    () =>
      [
        {
          required: activeStep == 0,
          value: fields.appearance_checklist.all_parts_fixed == null ? false : true,
          field: "all parts fixed",
        },
        {
          required: activeStep == 0,
          value: fields.appearance_checklist.symbols_clear == null ? false : true,
          field: "symbols clear",
        },
        {
          required: activeStep == 0,
          value: fields?.appearance_checklist.surface_free_of_defects == null ? false : true,
          field: "surface free of defects",
        },
        {
          required: activeStep == 0,
          value: fields?.appearance_checklist.ear_hook_and_connections_reliable == null ? false : true,
          field: "ear hook and connections reliable",
        },

        {
          required: activeStep == 0,
          value: fields?.appearance_checklist.operation_of_switches_and_battery == null ? false : true,
          field: "operation of switches and battery",
        },
        {
          required: activeStep == 0,
          value: fields?.appearance_checklist.overall_appearance_no_defects == null ? false : true,
          field: "overall appearance no defects",
        },

        {
          required: activeStep == 1,
          value: fields?.functional_detection_checklist.no_sound == null ? false : true,
          field: "no_sound",
        },
        {
          required: activeStep == 1,
          value: fields?.functional_detection_checklist.small_sound_noise_howling == null ? false : true,
          field: "small sound noise howling",
        },
        {
          required: activeStep == 1,
          value: fields?.functional_detection_checklist.volume_adjustment_function == null ? false : true,
          field: "volume adjustment function",
        },
        {
          required: activeStep == 1,
          value: fields?.functional_detection_checklist.switch_function_normal == null ? false : true,
          field: "switch function normal",
        },
        {
          required: activeStep == 1,
          value: fields?.functional_detection_checklist.product_no_abnormal_sound == null ? false : true,
          field: "product no abnormal sound",
        },
        {
          required: activeStep == 1,
          value: fields?.functional_detection_checklist.indicator_lights_working == null ? false : true,
          field: "indicator lights working",
        },
        {
          required: activeStep == 1,
          value: fields?.functional_detection_checklist.no_explosion_abnormal_charging == null ? false : true,
          field: "no explosion abnormal charging",
        },

        {
          required: activeStep == 2,
          value: fields?.technical_parameter_checklist.max_ospl90 == null ? false : true,
          field: "max ospl90",
        },
        {
          required: activeStep == 2,
          value: fields?.technical_parameter_checklist.average == null ? false : true,
          field: "average",
        },
        {
          required: activeStep == 2,
          value: fields?.technical_parameter_checklist.average_sound_gain == null ? false : true,
          field: "average sound gain",
        },
        {
          required: activeStep == 2,
          value: fields?.technical_parameter_checklist.equivalent_input_noise == null ? false : true,
          field: "equivalent input noise",
        },
        {
          required: activeStep == 2,
          value: fields?.technical_parameter_checklist.total_harmonic_distortion == null ? false : true,
          field: "total harmonic distortion",
        },
        {
          required: activeStep == 2,
          value: fields?.technical_parameter_checklist.frequency_response == null ? false : true,
          field: "frequency response",
        },
        {
          required: activeStep == 2,
          value: fields?.technical_parameter_checklist.rated_supply_current_consumption == null ? false : true,
          field: "rated supply current consumption",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.charging_duration.case.from == null ? false : true,
          field: "Charging Duration Case from",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.charging_duration.case.to == null ? false : true,
          field: "Charging Duration Case To",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.charging_duration.ric.left.from == null ? false : true,
          field: "Charging Duration Ric Left from",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.charging_duration.ric.left.to == null ? false : true,
          field: "Charging Duration RIC Left To",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.charging_duration.ric.right.from == null ? false : true,
          field: "Charging Duration RIC Right From",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.charging_duration.ric.right.to == null ? false : true,
          field: "Charging Duration RIC Right to",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.cycles_with_case == null ? false : true,
          field: "Charging Duration RIC Right to",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.discharging_duration.ric.day_1.left.from && true,
          field: "Charging Duration RIC day_1 Left From",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.discharging_duration.ric.day_1.left.to && true,
          field: "Charging Duration RIC day_1 Left to",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.discharging_duration.ric.day_1.right.from && true,
          field: "Charging Duration RIC day_1 Right From",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.discharging_duration.ric.day_1.right.to && true,
          field: "Charging Duration RIC day_1 Right to",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.discharging_duration.ric.day_2.right.from && true,
          field: "Charging Duration RIC day_2 Right From",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.discharging_duration.ric.day_2.right.to && true,
          field: "Charging Duration RIC day_2 Right to",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.discharging_duration.ric.day_2.left.from && true,
          field: "Charging Duration RIC day_2 Left From",
        },
        {
          required: activeStep == 3,
          value: fields?.charging_discharging.discharging_duration.ric.day_2.left.to && true,
          field: "Charging Duration RIC day_2 Left to",
        },

      ],
    [fields]
  );

  const [disabledButton, setdisabledButton] = useState(true)
  const validatedisabled = () => {
    const validationResponse = validate(validationSchemaForUpdate);
    if ((activeStep == 0 && validationResponse === true)
      || (activeStep == 1 && validationResponse === true)
      || (activeStep == 2 && validationResponse === true)
      || (activeStep == 3 && validationResponse === true)
    ) {
      setdisabledButton(false);
    }
    else {
      setdisabledButton(true);
    }
  }


  useEffect(() => {
    validatedisabled();
  }, [fields, activeStep])

  const handleNext = () => {
    let data;

    switch (activeStep) {
      case 0:
        data = { appearance_checklist: { ...fields.appearance_checklist } }
        break;

      case 1:
        data = { functional_detection_checklist: { ...fields.functional_detection_checklist } }
        break;

      case 2:
        data = { technical_parameter_checklist: { ...fields.technical_parameter_checklist } }
        break;

      case 3:
        data = { charging_discharging: { ...fields.charging_discharging } }
        currentPath.replace(/\/quality-check\/batch-list\/:product_id\/:batch_no$/, '');
        navigate(newPath);
        break;

      default:
        break;
    }

    const validationResponse = validate(validationSchemaForUpdate);

    if (validationResponse === true) {
      setLoading(true)
      dispatch(
        callApiAction(
          async () => await updateQcCheckListApi({ serial_no: params.serial_no, ...data }),
          async (response) => {
            await callBack(fields)
            setLoading(false)
            dispatch(callSnackBar("Test Done Successfully", SNACK_BAR_VARIETNS.suceess))
            setdisabledButton(true);

            const newActiveStep =
              isLastStep() && !allStepsCompleted()
                ? steps.findIndex((step, i) => !(i in completed))
                : activeStep + 1;
            setActiveStep(newActiveStep);
          },
          (err) => {
            setLoading(false)
            setFields({ ...fields, err })
          }
        )
      )
    }
    else {
      setFields({ ...fields, err: validationResponse });
    }


  };


  const fetchById = (serial_no) => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await QcFetchBySerialNoCheckListApi({ serial_no }),
        async (response) => {
          setFields({ ...fields, ...response });
          setLoading(false);
        },
        (err) => {
          setFields({ ...fields, err });
          setLoading(false);
        }
      )
    );
  };

  useEffect(() => {
    if (params.serial_no) fetchById(params.serial_no);
  }, [params.serial_no]);

  return (
    <>

      <Paper sx={{ height: "100%", backgroundColor: "white", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

        <Box p={6}>
          <Box mb={6} display={"flex"} flexDirection={"row"} alignItems={"center"}>
            <Typography color={"primary"} variant='h3'>Product Quality Testing</Typography>
            <Typography variant='h6' color={"primary"}>&nbsp; ({params.serial_no})</Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel><Typography variant='h6'>{label}</Typography></StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <Box>
            {allStepsCompleted() ? (
              <>

              </>
            ) : (
              <>
                {activeStep === 0 && <AppearanceChecklistUi fields={fields} onClick={handleNext} setFields={setFields} />}
                {activeStep === 1 && <FunctionalDetectionCheckListUi fields={fields} onClick={handleNext} setFields={setFields} />}
                {activeStep === 2 && <TechnicalParameterCheckListUi fields={fields} onClick={handleNext} setFields={setFields} />}
                {activeStep === 3 && <ChargingDischargingCheckListUi fields={fields} onClick={handleNext} setFields={setFields} />}

              </>
            )}
          </Box>
        </Box>


        <Box p={4} borderTop={"1px solid black"} display={"flex"} justifyContent={"space-between"}>
          <Box>
            <Button
              color="primary"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              <Typography variant='h5' >
                Back
              </Typography>
            </Button>
          </Box>

          {activeStep === 3 ? (
            <Box mr={3} display={"flex"} alignItems={"flex-end"} justifyContent={"flex-end"} >
              <Button variant='contained'
                disabled={disabledButton}
                sx={{ width: "10vw" }}
                onClick={handleNext}>
                <Typography>Submit</Typography>
              </Button>
            </Box>
          ) : (
            <Box mr={3} display={"flex"} alignItems={"flex-end"} justifyContent={"flex-end"} >
              <Button variant='contained'
                disabled={disabledButton}
                sx={{ width: "10vw" }}
                onClick={handleNext}>
                <Typography>Submit</Typography>
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

    </>
  );
}

export default StepperListController
