import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { closeModal } from "../../store/actions/modalAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { callSnackBar } from "../../store/actions/snackbarAction";
import useValidate from "../../store/hooks/useValidator";
import { useDispatch } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import moment from "moment";

import PurchaseRequestCreateUi from "./PurchaseRequestCreateUi";
import { CreatePurchaseRequestApi } from "../../apis/purchaseRequest.api";

const PurchaseRequestCreateController = ({ id, callBack = () => { } }) => {
  const validate = useValidate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [QrId, SetQrId] = useState();
  const QrLoading = useRef(false);
  const [fields, setFields] = useState({
    err: "",
    date: moment().toISOString(),
    materialType: null,
    materialId: "",
    quantity: "",
    reason: "",

  });

  const validationSchemaForCreate = useMemo(
    () => [
      {
        required: true,
        value: fields.date,
        field: "Date",
      },
      {
        required: true,
        value: fields.categoryId,
        field: "Category",
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
        required: true,
        value: fields.quantity,
        field: "Quantity",
      },


    ],
    [fields]
  );


  const createFunction = async () => {
    const validationResponse = validate(validationSchemaForCreate);

    if (validationResponse === true) {
      setLoading(true);
      dispatch(
        callApiAction(
          async () => await CreatePurchaseRequestApi(fields),
          async (response) => {
            callBack();
            setLoading(false);
            dispatch(
              callSnackBar(
                "Material Request created Successfully",
                SNACK_BAR_VARIETNS.suceess
              )
            );
            dispatch(closeModal("purchase"));
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


  return (
    <PurchaseRequestCreateUi
      onSubmit={onSubmit}
      loading={loading}
      fields={fields}
      setFields={setFields}
      setLoading={setLoading}
    />
  );
};

export default PurchaseRequestCreateController;
