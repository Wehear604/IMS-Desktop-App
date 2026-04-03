import { Box, Chip, Divider, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { fetchDeviceApi, getDeviceByIdApi } from "../../apis/deviceQc.api";
import { callApiAction } from "../../store/actions/commonAction";
import { useDispatch } from "react-redux";
import { InformationUI } from "../../components/InformationUI";
import moment from "moment";
import { DEVICES } from "../../utils/constants";
import { toTitleCase } from "../../utils/main";

const DeviceQcInformationUi = ({ id, IsVeiw }) => {
  const dispatch = useDispatch();
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);
  const device = fields.device === DEVICES.SAFE_BUDS;
  const fetchById = useCallback(
    (id) => {
      setLoading(true);
      dispatch(
        callApiAction(
          async () => await getDeviceByIdApi({ id }),
          async (response) => {
            setFields((prev) => ({ ...prev, ...response }));
            setLoading(false);
          },
          (err) => {
            setFields((prev) => ({ ...prev, err }));
            setLoading(false);
          },
        ),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (id) fetchById(id);
  }, [id, fetchById]);

  console.log("object fields", fields);
  return (
    <>
      <CustomDialog
        id={"device-qc-information"}
        title={"Device QC Information"}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Device Basic Details :
          </Typography>
          <InformationUI
            Data={[
              {
                label: "Device Name :",
                value: toTitleCase(fields?.deviceName),
              },
              {
                isField: fields?.device !== DEVICES.SAFE_BUDS,
                label: "Device Mac Address :",
                value: fields?.left?.mac,
              },
              { label: "Device Box Id :", value: fields?.boxId },
              {
                isField: !fields?.box_Contains?.length,
                label: "Box Contains :",
                isArray: true,
                value: fields?.box_Contains?.length
                  ? toTitleCase(
                      fields.box_Contains
                        .flatMap((item) =>
                          Object.entries(item)
                            .filter(([_, val]) => val === true) // ✅ only true
                            .map(([key]) => key),
                        )
                        .map((key) => key.replace(/_/g, " "))
                        .join(", "),
                    )
                  : ["NA"],
              },
              {
                label: "Device QC Date :",
                value: moment(fields?.createdAt).format("DD/MM/YYYY") || "NA",
              },
              {
                label: "Device Color :",
                value: fields?.deviceColor?.name || "NA",
              },

              // {
              //   label: "Mac Before OTA :",
              //   value: fields?.macBeforeOta || "NA",
              // },
              {
                label: "QC Executive :",
                value: toTitleCase(fields?.qcExcecutive?.name) || "NA",
              },
              {
                label: "Overall Device QC Result :",
                value: (
                  <Chip
                    label={
                      fields?.left?.result && fields?.right?.result
                        ? "Passed"
                        : "Failed"
                    }
                    size="small"
                    sx={{
                      backgroundColor:
                        fields?.left?.result && fields?.right?.result
                          ? "success.main"
                          : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
            ]}
          />
        </Box>

        <Box mt={4}>
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Device QC Details :
          </Typography>
          <InformationUI
            Data={[
              {
                isField: fields?.device === DEVICES.SAFE_BUDS,
                label: "Left Device Mac :",
                value: fields?.left?.mac,
              },
              {
                isField: fields?.device === DEVICES.SAFE_BUDS,
                label: "Right Device Mac :",
                value: fields?.right?.mac,
              },
              {
                label: "Test Case Executed",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1" fontWeight={600} ml={2}>
                      Left Device
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography variant="body1" fontWeight={600}>
                      Right Device
                    </Typography>
                  </Box>
                ),
              },
              {
                label: "Test Case Executed",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1" fontWeight={600} ml={2}>
                      Left Device
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography variant="body1" fontWeight={600}>
                      Right Device
                    </Typography>
                  </Box>
                ),
              },

              {
                label: "Overall Device QC Result :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={fields?.left?.result ? "Passed" : "Failed"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.result
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={fields?.right?.result ? "Passed" : "Failed"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.result
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                isField: !(
                  fields?.device === DEVICES.SAFE_BUDS ||
                  fields?.device === DEVICES.ITE_PRIME ||
                  fields?.device === DEVICES.BTE_OPTIMA ||
                  fields?.device === DEVICES.BTE_PRIME
                ),
                label: "Device Audio Test :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={fields?.left?.audio ? "Passed" : "Failed"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.audio
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={fields?.right?.audio ? "Passed" : "Failed"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.audio
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                label: "Device Charging Test :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={fields?.left?.charging ? "Passed" : "Failed"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.charging
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={fields?.right?.charging ? "Passed" : "Failed"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.charging
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                label: "Device Mic Test :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={fields?.left?.mic ? "Passed" : "Failed"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.mic
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={fields?.right?.mic ? "Passed" : "Failed"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.mic
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                label: "Device is not Damaged :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={fields?.left?.body?.body1 ? "Passed" : "Damaged"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.body?.body1
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={fields?.right?.body?.body1 ? "Passed" : "Damaged"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.body?.body1
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                label: "Device is not Scratched :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={fields?.left?.body?.body2 ? "Passed" : "Scratched"}
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.body?.body2
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={
                        fields?.right?.body?.body2 ? "Passed" : "Scratched"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.body?.body2
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                label: "Device Volume Increased :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={
                        fields?.left?.volume?.volumeIncrease ||
                        fields?.left?.result
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          fields?.left?.volume?.volumeIncrease ||
                          fields?.left?.result
                            ? "success.main"
                            : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={
                        fields?.right?.volume?.volumeIncrease ||
                        fields?.right?.result
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          fields?.right?.volume?.volumeIncrease ||
                          fields?.right?.result
                            ? "success.main"
                            : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                label: "Device Volume Decreased :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={
                        fields?.left?.volume?.volumeDecrease
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.volume?.volumeDecrease
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={
                        fields?.right?.volume?.volumeDecrease
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.volume?.volumeDecrease
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                label: device ? "Single Touch :" : "First Mode :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={
                        fields?.left?.mode.includes(device ? 1 : 0)
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.mode.includes(
                          device ? 1 : 0,
                        )
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={
                        fields?.right?.mode.includes(device ? 1 : 0)
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.mode.includes(
                          device ? 1 : 0,
                        )
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                label: device ? "Double Touch :" : "Second Mode :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={
                        fields?.left?.mode.includes(device ? 2 : 1)
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.mode.includes(
                          device ? 2 : 1,
                        )
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={
                        fields?.right?.mode.includes(device ? 2 : 1)
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.mode.includes(
                          device ? 2 : 1,
                        )
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                label: device ? "Triple Touch :" : "Third Mode :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={
                        fields?.left?.mode.includes(device ? 3 : 2)
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.mode.includes(
                          device ? 3 : 2,
                        )
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={
                        fields?.right?.mode.includes(device ? 3 : 2)
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.mode.includes(
                          device ? 3 : 2,
                        )
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
              {
                isField: fields?.device === DEVICES.RIC_OPTIMA,
                label: device ? "Long Press :" : "Four Mode :",
                value: (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      width: "100%",
                    }}
                  >
                    <Chip
                      label={
                        fields?.left?.mode.includes(device ? 4 : 3)
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.left?.mode.includes(
                          device ? 4 : 3,
                        )
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <Chip
                      label={
                        fields?.right?.mode.includes(device ? 4 : 3)
                          ? "Passed"
                          : "Failed"
                      }
                      size="small"
                      sx={{
                        backgroundColor: fields?.right?.mode.includes(
                          device ? 4 : 3,
                        )
                          ? "success.main"
                          : "error.main",
                        color: "#fff",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>
                ),
              },
            ]}
          />
        </Box>
      </CustomDialog>
      ;
    </>
  );
};

export default DeviceQcInformationUi;

{
  /* <Box mt={4}>
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Right Device QC Details :
          </Typography>
          <InformationUI
            Data={[
              {
                isField: fields?.device === DEVICES.SAFE_BUDS,
                label: "Right Device Mac :",
                value: fields?.right?.mac,
              },
              {
                label: "Overall Device QC Result :",
                value: (
                  <Chip
                    label={fields?.right?.result ? "Passed" : "Failed"}
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.result
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                label: "Device Audio Test :",
                value: (
                  <Chip
                    label={fields?.right?.audio ? "Passed" : "Failed"}
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.audio
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                label: "Device Charging Test :",
                value: (
                  <Chip
                    label={fields?.right?.charging ? "Passed" : "Failed"}
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.charging
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                isField: fields?.device !== DEVICES.SAFE_BUDS,
                label: "Device Mic Test :",
                value: (
                  <Chip
                    label={fields?.right?.mic ? "Passed" : "Failed"}
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.mic
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                label: "Device is not Damaged :",
                value: (
                  <Chip
                    label={fields?.right?.body?.body1 ? "Passed" : "Damaged"}
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.body?.body1
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                label: "Device is not Scratched :",
                value: (
                  <Chip
                    label={fields?.right?.body?.body2 ? "Passed" : "Scratched"}
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.body?.body2
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                label: "Device Volume Increased :",
                value: (
                  <Chip
                    label={
                      fields?.right?.volume?.volumeIncrease
                        ? "Passed"
                        : "Failed"
                    }
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.volume?.volumeIncrease
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                label: "Device Volume Decreased :",
                value: (
                  <Chip
                    label={
                      fields?.right?.volume?.volumeDecrease
                        ? "Passed"
                        : "Failed"
                    }
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.volume?.volumeDecrease
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                label: "Single Touch :",
                value: (
                  <Chip
                    label={
                      fields?.right?.mode.includes(1) ? "Passed" : "Failed"
                    }
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.mode.includes(1)
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                label: "Double Touch :",
                value: (
                  <Chip
                    label={
                      fields?.right?.mode.includes(2) ? "Passed" : "Failed"
                    }
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.mode.includes(2)
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                label: "Triple Touch :",
                value: (
                  <Chip
                    label={
                      fields?.right?.mode.includes(3) ? "Passed" : "Failed"
                    }
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.mode.includes(3)
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
              {
                label: "Long Press :",
                value: (
                  <Chip
                    label={
                      fields?.right?.mode.includes(4) ? "Passed" : "Failed"
                    }
                    size="small"
                    sx={{
                      backgroundColor: fields?.right?.mode.includes(4)
                        ? "success.main"
                        : "error.main",
                      color: "#fff",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                ),
              },
            ]}
          />
        </Box> */
}
