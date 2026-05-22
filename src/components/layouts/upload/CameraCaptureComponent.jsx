import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  CameraAltOutlined,
  CloudUploadOutlined,
  Close,
  DeleteOutline,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useDispatch } from "react-redux";
import {
  deletefileOrImage,
  uploadFile,
  uploadImage,
} from "../../../apis/file.api";
import { callSnackBar } from "../../../store/actions/snackbarAction";
import { callApiAction } from "../../../store/actions/commonAction";
import { SNACK_BAR_VARIETNS } from "../../../utils/constants";

const CameraCaptureComponent = ({
  onlyImage = true,
  onChange,
  onDelete = () => {},
  defaultFile = "",
  title = "Upload Photo",
  subTitle = "Choose a photo from your device",
  accept = "image/*",
}) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(defaultFile || "");

  useEffect(() => {
    setUploadedFile(defaultFile || "");
  }, [defaultFile]);

  const getFileName = (url) => {
    const split = url?.split("/");
    return split?.[split.length - 1]?.split("?")?.[0] || "Uploaded file";
  };

  const handleUploadClick = () => {
    if (!loading) {
      inputRef.current?.click();
    }
  };

  const stopCamera = useCallback(() => {
    try {
      const video = webcamRef.current?.video;
      const stream = video?.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    } catch (e) {
      // swallow
    }

    setCameraStream(null);
    setCameraOpen(false);
  }, [cameraStream]);

  const startCamera = useCallback(async () => {
    setCameraError("");
    setCameraOpen(true);
    setShowPreview(false);
  }, []);

  useEffect(() => {
    // react-webcam manages the stream; no manual wiring needed here.
  }, [cameraStream]);

  const uploadHandler = (file) => {
    const maxSize = 1024 * 1024;

    if (!file) return;

    if (file.size > maxSize) {
      dispatch(
        callSnackBar(
          "File size should be less than 1 MB",
          SNACK_BAR_VARIETNS.error,
        ),
      );
      return;
    }

    setLoading(true);

    const formData = new FormData();

    if (onlyImage) {
      formData.append("image", file);
    } else {
      formData.append("file", file);
    }

    dispatch(
      callApiAction(
        async () =>
          onlyImage ? await uploadImage(formData) : await uploadFile(formData),
        (response) => {
          const nextUrl = response?.url || "";
          setUploadedFile(nextUrl);
          onChange && onChange(nextUrl);
          setLoading(false);
          dispatch(
            callSnackBar("Uploaded successfully", SNACK_BAR_VARIETNS.suceess),
          );
        },
        (err) => {
          setLoading(false);
          dispatch(
            callSnackBar(err || "Upload failed", SNACK_BAR_VARIETNS.error),
          );
        },
      ),
    );
  };

  const onChangeFile = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    uploadHandler(file);
    e.target.value = "";
  };

  const capturePhoto = async () => {
    try {
      // prefer react-webcam screenshot
      const screenshot = webcamRef.current?.getScreenshot?.();

      if (screenshot) {
        const res = await fetch(screenshot);
        const blob = await res.blob();
        const file = new File([blob], `capture_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        stopCamera();
        uploadHandler(file);
        return;
      }

      // fallback to canvas if webcam not available
      const canvas = canvasRef.current;
      if (!canvas) return;

      const video = webcamRef.current?.video;
      const width = video?.videoWidth;
      const height = video?.videoHeight;
      if (!width || !height) return;

      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(video, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const file = new File([blob], `capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });

          stopCamera();
          uploadHandler(file);
        },
        "image/jpeg",
        0.92,
      );
    } catch (err) {
      console.error("Capture failed:", err);
      dispatch(
        callSnackBar(
          err?.message || "Capture failed",
          SNACK_BAR_VARIETNS.error,
        ),
      );
      stopCamera();
    }
  };

  const handleDelete = useCallback(() => {
    if (!uploadedFile) return;

    setLoading(true);

    dispatch(
      callApiAction(
        async () => await deletefileOrImage(uploadedFile),
        () => {
          const deletedFile = uploadedFile;
          setUploadedFile("");
          setShowPreview(false);
          onDelete(deletedFile);
          setLoading(false);
          dispatch(
            callSnackBar("Deleted successfully", SNACK_BAR_VARIETNS.suceess),
          );
        },
        (err) => {
          setLoading(false);
          dispatch(
            callSnackBar(err || "Delete failed", SNACK_BAR_VARIETNS.error),
          );
        },
        true,
      ),
    );
  }, [dispatch, onDelete, uploadedFile]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        border: "2px dashed #0E2548",
        borderRadius: "24px",
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #FCFDFF 40%, #F6F8FC 100%)",
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 5 },
        mt: 2,
        minHeight: "240px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={onChangeFile}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={220}
        >
          <CircularProgress />
        </Box>
      )}

      {!loading && cameraOpen && !uploadedFile && (
        <Box
          width="100%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
        >
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: { ideal: "environment" },
            }}
            style={{
              width: "100%",
              maxHeight: 360,
              borderRadius: "20px",
              background: "#000",
              objectFit: "cover",
            }}
          />

          {cameraError ? (
            <Typography sx={{ color: "#B91C1C", fontFamily: "Public Sans" }}>
              {cameraError}
            </Typography>
          ) : null}

          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
            <Button
              variant="contained"
              startIcon={<CameraAltOutlined />}
              onClick={capturePhoto}
              sx={{
                minWidth: "180px",
                height: "50px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #2B5AA0 0%, #0E2548 100%)",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 700,
                fontFamily: "Public Sans",
              }}
            >
              Capture Photo
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={stopCamera}
              sx={{
                minWidth: "180px",
                height: "50px",
                borderRadius: "18px",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 700,
                fontFamily: "Public Sans",
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {!loading && !uploadedFile && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          width="100%"
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(180deg, #F2F1FF 0%, #F7F6FF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              boxShadow: "0px 15px 40px rgba(91,63,255,0.08)",
            }}
          >
            <CloudUploadOutlined sx={{ fontSize: 30, color: "#0E2548" }} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#111B4C",
              lineHeight: 1.2,
              fontFamily: "Public Sans",
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 1,
              color: "#7A83A3",
              maxWidth: "620px",
              fontWeight: 500,
              lineHeight: 1.6,
              fontFamily: "Public Sans",
            }}
          >
            {subTitle}
          </Typography>

          <Box
            mt={3}
            display="flex"
            gap={2}
            flexWrap="wrap"
            justifyContent="center"
          >
            <Button
              variant="outlined"
              startIcon={<CloudUploadOutlined />}
              onClick={handleUploadClick}
              sx={{
                minWidth: "220px",
                height: "50px",
                borderRadius: "18px",
                border: "2px solid #E3E6F5",
                background: "#FFFFFF",
                color: "#0E2548",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 700,
                fontFamily: "Public Sans",
                "&:hover": {
                  background: "#F8FAFF",
                  border: "2px solid #0E2548",
                },
              }}
            >
              Upload Image
            </Button>

            <Button
              variant="contained"
              startIcon={<CameraAltOutlined />}
              onClick={startCamera}
              sx={{
                minWidth: "220px",
                height: "50px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #2B5AA0 0%, #0E2548 100%)",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 700,
                fontFamily: "Public Sans",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #2B5AA0 0%, #0E2548 100%)",
                },
              }}
            >
              Capture Photo
            </Button>
          </Box>
        </Box>
      )}

      {!loading && uploadedFile && (
        <Box
          sx={{
            width: "100%",
            background: "#FFFFFF",
            borderRadius: "20px",
            position: "relative",
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            overflow: "hidden",
            border: "1px solid #EEF2FF",
            boxShadow: "0px 12px 35px rgba(15,23,42,0.06)",
          }}
        >
          <Box
            position="absolute"
            top={12}
            right={12}
            display="flex"
            gap={1}
            zIndex={2}
          >
            <IconButton
              onClick={() => setShowPreview((prev) => !prev)}
              sx={{
                color: "#64748B",
                background: "#fff",
                border: "1px solid #E2E8F0",
                "&:hover": { background: "#F8FAFC" },
              }}
            >
              {showPreview ? <Close /> : <VisibilityOutlined />}
            </IconButton>

            <IconButton
              onClick={handleDelete}
              sx={{
                color: "#94A3B8",
                background: "#fff",
                border: "1px solid #E2E8F0",
                "&:hover": {
                  color: "#EF4444",
                  background: "#FEE2E2",
                },
              }}
            >
              <DeleteOutline />
            </IconButton>
          </Box>

          {showPreview ? (
            <Box
              component="img"
              src={uploadedFile}
              alt="Preview"
              sx={{
                width: "100%",
                height: 320,
                objectFit: "contain",
                borderRadius: 2,
                background: "#000",
              }}
            />
          ) : (
            <>
              <CheckCircle sx={{ color: "#22C55E", fontSize: 72, mb: 2 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#111827",
                  fontFamily: "Public Sans",
                }}
              >
                {getFileName(uploadedFile)}
              </Typography>
              <Typography
                sx={{
                  fontSize: "16px",
                  color: "#64748B",
                  mt: 1,
                  fontFamily: "Public Sans",
                }}
              >
                Uploaded Successfully
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CameraCaptureComponent;
