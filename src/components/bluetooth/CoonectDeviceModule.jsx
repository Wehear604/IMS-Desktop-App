import { Button, CircularProgress, Typography } from "@mui/material";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";

const ConnectDevice = () => {
  const dispatch = useDispatch();

  // connection & loading states
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Checking Browser Support");

  // BLE objects
  const [servers, setServer] = useState(null);
  const [services, setServices] = useState(null);
  const [characteristics, setCharacteristics] = useState(null);
  const [deviceObj, setDeviceObj] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({ name: "", id: "" });
  const [data, setData] = useState([]);

  // BLE connection logic
  const connectDevice = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Connecting Device...");

      const serviceUUid = "e093f3b5-00a3-a9e5-9eca-40016e0edc24";

      const device = await navigator.bluetooth
        .requestDevice({
          filters: [
            { manufacturerData: [{ companyIdentifier: parseInt("0x0362") }] },
          ],
          optionalServices: [serviceUUid],
        })
        .catch((e) => {
          setLoadingMessage("Failed to connect because of " + (e.message ?? "errors"));
          setLoading(false);
        });

      if (!device) {
        setLoadingMessage("Cannot connect to device.");
        setLoading(false);
        return;
      }

      console.log("Device object:", device);

      setDeviceInfo({
        name: device.name,
        id: device.id,
      });

      device.ongattserverdisconnected = disconnect;
      setDeviceObj(device);

      setLoadingMessage("Connecting Device Server...");
      const server = await device.gatt.connect();
      setServer(server);

      setLoadingMessage("Connecting Services...");
      const service = await server.getPrimaryService(serviceUUid).catch(() => {
        setLoadingMessage("Error connecting Services.");
      });

      setServices(service);
      setLoadingMessage("Fetching Characteristics...");

      const allCharacteristics = await service.getCharacteristics();
      setCharacteristics(allCharacteristics);

      setLoadingMessage("Connected.");
      setConnected(true);
      setLoading(false);
    } catch (e) {
      setLoadingMessage(e.message ?? "Oops!");
      setLoading(false);
    }
  };

  // Disconnect logic
  const disconnect = () => {
    if (deviceObj?.gatt?.connected) {
      deviceObj.gatt.disconnect();
      dispatch(
        callSnackBar("Device disconnected successfully.", SNACK_BAR_VARIETNS.success)
      );
    } else {
      dispatch(callSnackBar("Already disconnected.", SNACK_BAR_VARIETNS.info));
    }

    setDeviceInfo({});
    setConnected(false);
    setDeviceObj(null);
    setServer(null);
    setCharacteristics(null);
    setServices(null);
    setData([]);
    setLoadingMessage("");
  };

  // check browser support
  useEffect(() => {
    if (window.navigator && window.navigator.bluetooth) {
      setLoading(false);
      setLoadingMessage("");
    } else {
      setLoadingMessage("This browser does not support Bluetooth Low Energy.");
    }
  }, []);

  return (
    <>
      {loading && <CircularProgress />}
      {loadingMessage && <Typography sx={{ mt: 2 }}>{loadingMessage}</Typography>}

      {!connected && !loading && (
        <Button variant="contained" onClick={connectDevice} sx={{ mt: 2 }}>
          Connect Device
        </Button>
      )}

      {connected && (
        <>
          <Typography sx={{ mt: 2 }}>
            Connected With: {deviceInfo.name} ({deviceInfo.id})
          </Typography>
          <Button onClick={disconnect} sx={{ mt: 2 }} variant="outlined">
            Disconnect
          </Button>
        </>
      )}
    </>
  );
};

export default memo(ConnectDevice);
