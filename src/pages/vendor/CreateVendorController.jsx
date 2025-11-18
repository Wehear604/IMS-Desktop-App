import { memo, useEffect, useMemo, useState } from "react";
import useValidate from "../../store/hooks/useValidator";
import { useDispatch, useSelector } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { closeModal } from "../../store/actions/modalAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { callSnackBar } from "../../store/actions/snackbarAction";
import {
  addvendorApi,
  getVendorByIdApi,
  updatevendorApi,
} from "../../apis/vendor.api";
import CreatevendorUI from "./CreatevendorUI";
import { fetchVendorAction } from "../../store/actions/setting.Action";
import { useCallback } from "react";

const CreateVendorController = ({ callBack, id, role = null }) => {
  const validate = useValidate();
  const dispatch = useDispatch();
  const modalKey = "vendor";
  const title = "Vendor";
  const createApi = addvendorApi;
  const updateApi = updatevendorApi;
  const getByIdApi = getVendorByIdApi;
  const { settings } = useSelector((state) => state);

  const [loading, setLoading] = useState(false);
  const isRolePredefined = role !== null;
  const [fields, setFields] = useState({
    err: "",
    id,
    name: "",
    email: "",
    country: "",
    gst_no: "",
    rawMaterials: [
      {
        rawMaterialId: { _id: "", name: "" },
        min_of_quantity: "",
        lead_time: "",
        priority: null,
      },
    ],
    sfgs: [
      {
        sfgId: "",
        min_of_quantity: "",
        lead_time: "",
        priority: null,
      },
    ],
    skds: [
      {
        skdId: "",
        min_of_quantity: "",
        lead_time: "",
        priority: null,
      },
    ],
    address: "",
    phone: "",

  });
  const [originalDocument, setOriginalDocument] = useState({});
  const validationSchemaForCreate = useMemo(
    () =>
      [
        {
          required: true,
          value: fields.name,
          field: "name",
        },
        {
          required: true,
          value: fields.address,
          field: "Address",
        },

        {
          required: true,
          value: fields.phone,
          field: "Phone",
        },

        {
          required: true,
          value: fields.country,
          field: "Country",
        },

      ],
    [fields]
  );

  const validationSchemaForUpdate = useMemo(
    () => [
      {
        required: true,
        value: fields.name,
        field: "name",
      },

      {
        required: true,
        value: fields.address,
        field: "address",
      },

      {
        required: true,
        value: fields.country,
        field: "Country",
      },
    ],
    [fields]
  );
  const processedsfg = fields?.sfgs?.map((entry) => ({
    ...entry,
    sfgId: typeof entry?.sfgId === "object" ? entry?.sfgId._id : entry?.sfgId,
  }));

  const processedRawMaterials = fields?.rawMaterials?.map((entry) => ({
    ...entry,
    rawMaterialId: typeof entry?.rawMaterialId === "object" ? entry?.rawMaterialId?._id : entry?.rawMaterialId,
  }));

  const processedskd = fields?.skds?.map((entry) => ({
    ...entry,
    skdId: typeof entry?.skdId === "object" ? entry?.skdId?._id : entry?.skdId,
  }));

  const createFunction = async () => {
    const validationResponse = validate(validationSchemaForCreate);

    if (validationResponse === true) {
      setLoading(true);
      dispatch(
        callApiAction(
          async () => await createApi({ ...fields, skds: processedskd, rawMaterials: processedRawMaterials, sfgs: processedsfg }),
          async (response) => {
            setLoading(false);
            dispatch(
              callSnackBar(
                "Vendor Created Successfully",
                SNACK_BAR_VARIETNS.suceess
              )
            );
            dispatch(fetchVendorAction(settings.vender_filters));
            dispatch(closeModal(modalKey));
          },
          (err) => {
            setLoading(false);
            setFields({ ...fields, err });
          }
        )
      );
    } else {
      setFields({ ...fields, err: validationResponse });
    }
  };

  const updateFunction = async () => {
    const validationResponse = validate(validationSchemaForUpdate);
    const updatedData = { id };

    for (let field in originalDocument) {
      if (
        originalDocument[field] &&
        fields[field] &&
        fields[field] !== originalDocument[field]
      ) {
        updatedData[field] = fields[field];
      }
    }

    if (validationResponse === true) {
      setLoading(true);

      dispatch(
        callApiAction(
          async () => await updateApi({ ...fields, skds: processedskd, rawMaterials: processedRawMaterials, sfgs: processedsfg }),

          async (response) => {
            // await callBack(response, updatedData);
            setLoading(false);
            dispatch(
              callSnackBar(
                "Vendor Updated Successfully",
                SNACK_BAR_VARIETNS.suceess
              )
            );
            dispatch(fetchVendorAction(settings.vender_filters));
            dispatch(closeModal("vendorupdate"));
          },
          (err) => {
            setLoading(false);
            setFields({ ...fields, err });
          }
        )
      );
    } else {
      setFields({ ...fields, err: validationResponse });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (id) updateFunction();
    else createFunction();
  };

  const fetchById = useCallback((id) => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await getByIdApi({ id }),
        async (response) => {
          setFields((prev) => ({ ...prev, ...response }));
          setOriginalDocument(response);
          setLoading(false);
        },
        (err) => {
          setFields((prev) => ({ ...prev, err }));
          setLoading(false);
        }
      )
    );
  }, [dispatch, getByIdApi]);

  useEffect(() => {
    if (id) fetchById(id);
  }, [id, fetchById]);

  return (
    <CreatevendorUI
      isRolePredefined={isRolePredefined}
      modalKey={modalKey}
      title={title}
      isUpdate={id}
      loading={loading}
      fields={fields}
      onSubmit={onSubmit}
      setFields={setFields}
    />
  );
};
export default memo(CreateVendorController);
