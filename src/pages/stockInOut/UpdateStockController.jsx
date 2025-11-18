import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { closeModal } from "../../store/actions/modalAction";
import { LOG_TYPE, MATERIAL_TYPE, SNACK_BAR_VARIETNS } from "../../utils/constants";
import { callSnackBar } from "../../store/actions/snackbarAction";
import useValidate from "../../store/hooks/useValidator";
import { useDispatch } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import moment from "moment";
import UpdateStockUi from "./UpdateStockUi";
import { CreateStockInOutLogsApi } from "../../apis/stockinout.api";
import {
  FetchInventoryOutLogApi,
  FetchInventoryQrByIdApi,
  FetchQrApi,
} from "../../apis/inventoryLogs.api";

const UpdateStockController = ({ Type, id, callBack = () => { } }) => {
  const validate = useValidate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [QrId, SetQrId] = useState();
  const QrLoading = useRef(false);
  const [fields, setFields] = useState({
    err: "",
    date: moment().toISOString(),
    materialType: null,
    materialId: null,
    materialIds: null,
    quantity: "",
    amount: "",
    vendorId: "",
    logType: null,
    batchNumbers: [{
      quantity: null,
      batchNumbers: ""
    }],
  });

  const validationSchemaForCreate = useMemo(
    () => [
      {
        required: true,
        value: fields.date,
        field: "Date",
      },
      {
        required: Type === LOG_TYPE.Out && true,
        value: fields.category,
        field: "Category",
      },
      {
        required: Type === LOG_TYPE.Out && fields?.categoryName === "R & D" && true,
        value: fields.projectId,
        field: "Select Project",
      },
      {
        required: true,
        value: fields.materialType,
        field: "Material Type",
      },

      {
        required: true,
        value: fields.materialId,
        field: "Material Name",
      },
      {
        required: Type === LOG_TYPE.In && fields?.materialType !== MATERIAL_TYPE.FG && true,
        value: fields.vendorId,
        field: "Vendor",
      },
      {
        required: true,
        value: fields.quantity,
        field: "Quantity",
      },
      {
        required: true,
        value: fields.batchNumbers.every((item) => item?.batchNumber !== ""),
        field: "Batch Number",
      },
      {
        required: true,
        value: fields.batchNumbers.every((item) => item.quantity !== null),
        field: "Batch Number",
      },
      {
        required: true,
        value: fields.batchNumbers.reduce(
          (acc, item) => acc + item.quantity,
          0
        ) < fields.quantity ? false : true,
        field: `only ${fields.batchNumbers.reduce(
          (acc, item) => acc + item.quantity,
          0
        )} quantity is available`,
      },
    ],
    [fields]
  );
  const [devices, setDevices] = useState([]);
  const checkHIDDevice = async () => {
    if (Type === LOG_TYPE.In) {
      try {
        if (!navigator.hid) {
          throw new Error("WebHID API is not supported in this browser.");
        }
        const connectedDevices = await navigator.hid.getDevices();

        console.log("HID Devices:", connectedDevices);

        if (connectedDevices.length === 0) {
          throw new Error("Please connect Scanner Device.");
        }

        setDevices(connectedDevices);
      } catch (error) {
        console.error(error.message);
        dispatch(callSnackBar(error.message, SNACK_BAR_VARIETNS.info));
      }
    }
  };
  useEffect(() => {
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      checkHIDDevice();
    }
  }, [id]);

  const createFunction = async () => {
    const validationResponse = validate(validationSchemaForCreate);
    const totalQuantity = fields?.batchNumbers?.reduce((sum, item) => {
      return sum + Number(item.quantity || 0);
    }, 0);

    if (validationResponse === true) {
      setLoading(true);
      dispatch(
        callApiAction(
          async () => await CreateStockInOutLogsApi({ ...fields, amount: fields?.totalPrice && (fields?.projectId || fields?.projectId?._id) ? fields?.totalPrice : fields?.amount, logType: Type === LOG_TYPE.In ? LOG_TYPE.In : LOG_TYPE.Out, quantity: totalQuantity }),
          async (response) => {
            callBack();
            setLoading(false);
            dispatch(
              callSnackBar(
                "Stock Updated Successfully",
                SNACK_BAR_VARIETNS.suceess
              )
            );
            dispatch(closeModal("stockInOut"));
          },
          (err) => {
            setLoading(false);
            setFields({ ...fields, err });

            dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error));
          }
        )
      );
    } else {
      setFields({ ...fields, err: validationResponse });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    createFunction();

  };

  const fetchList = useCallback(() => {
    // setLoading(true);
    dispatch(
      callApiAction(
        async () => await FetchInventoryOutLogApi({ date: fields.date, quantity: fields.quantity, materialId: fields.materialId, materialType: fields.materialType }),
        (response) => {
          if (response) {
            setFields((prev) => ({
              ...prev,
              batchNumbers: response.batchNumber,
              materialIds: response.materialIds,
              materialId: response.materialId,
              totalPrice: response?.totalPrice
            }));
            // console.log("response", response);
            // setLoading(false);

          } else {
            setFields((prev) => ({
              ...prev,
              err: "Data Not Found",
              materialId: fields.materialId,

            }));
          }
        },
        (err) => {
          setFields({ ...fields, err: "Data Not Found" });
          // setLoading(false);
        }
      )
    );
  }, [dispatch, fields.quantity, fields.materialId, fields.date]);



  console.log("feild", fields)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fields.quantity && fields.materialId && Type === LOG_TYPE.Out && fields.date && fields.materialId) {
        fetchList();
      }
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchList, fields.quantity, fields.date, fields.materialId]);

  return (
    <UpdateStockUi
      onSubmit={onSubmit}
      loading={loading}
      fields={fields}
      setFields={setFields}

      setLoading={setLoading}
      Type={Type}
    />
  );
};

export default UpdateStockController;
