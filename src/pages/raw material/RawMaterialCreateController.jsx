import { useDispatch, useSelector } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import RawMaterialCreateUi from "./RawMaterialCreateUi"
import { AddRawMaterialApi, getRawMaterialByIdApi, updateRawMaterialApi } from "../../apis/rawMaterial.api"
import { fetchRawMaterialAction } from "../../store/actions/setting.Action"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"

const RawMaterialCreateController = ({ callBack = () => { }, id, isModal, handleAreaModalClose }) => {
  const validate = useValidate()
  const { settings } = useSelector((state) => state)
  const dispatch = useDispatch()
  const title = "Raw-Material"

  const [loading, setLoading] = useState(false)

  const [fields, setFields] = useState({
    err: '',
    id,
    name: '',
    rawMaterial_code: '',
    price_per_unit: 0,
    mpn: "",
    itemType: "",
    location: "",
    lead_time: '',
    role: 'Day',
  })

  const [originalDocument, setOriginalDocument] = useState({})

  const validationSchemaForCreate = useMemo(() => ([
    {
      required: true,
      value: fields.name,
      field: 'Raw Material',
    },
    {
      required: true,
      value: fields.rawMaterial_code,
      field: 'Item Code',
    },
    {
      required: true,
      value: fields.location,
      field: 'Location',
    },
    {
      required: true,
      value: fields.mpn,
      field: 'MPN',
    },
    {
      required: true,
      value: fields.unit,
      field: 'Measurement Unit',
    },
  ]), [fields])

  const validationSchemaForUpdate = useMemo(() => ([
    {
      required: true,
      value: fields.name,
      field: 'Raw Material',
    },
    {
      required: true,
      value: fields.rawMaterial_code,
      field: 'Item Code',
    },
    {
      required: true,
      value: fields.location,
      field: 'Location',
    },
    {
      required: true,
      value: fields.mpn,
      field: 'MPN',
    },
    {
      required: true,
      value: fields.unit,
      field: 'Measurement Unit',
    },
  ]), [fields])

  const createFunction = async () => {
    const validationResponse = validate(validationSchemaForCreate)

    if (validationResponse === true) {
      setLoading(true)
      dispatch(
        callApiAction(
          async () => await AddRawMaterialApi({ ...fields }),
          async (response) => {
            setLoading(false)
            dispatch(
              callSnackBar(
                "Raw Material Created Successfully",
                SNACK_BAR_VARIETNS.suceess
              )
            )
            dispatch(fetchRawMaterialAction(settings.rawMaterial_filters))
            dispatch(closeModal("rawMaterial"))
          },
          (err) => {
            setLoading(false)
            setFields({ ...fields, err })
          }
        )
      )
    } else {
      setFields({ ...fields, err: validationResponse })
    }
  }

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
          async () => await updateRawMaterialApi({ ...updatedData, unit: fields?.unit, specialMarking: fields?.specialMarking?._id ? fields?.specialMarking?._id : fields?.specialMarking, itemType: fields?.itemType?._id ? fields?.itemType?._id : fields?.itemType }),
          async (response) => {
            await callBack(response, updatedData);
            dispatch(fetchRawMaterialAction(settings.rawMaterial_filters))
            setLoading(false);
            dispatch(
              callSnackBar(
                "Raw Material Updated Successfully",
                SNACK_BAR_VARIETNS.suceess
              )
            );
            dispatch(closeModal("update"));
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

  const fetchById = useCallback((id) => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await getRawMaterialByIdApi({ id }),
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
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const onSubmit = async (e) => {
    e.preventDefault()
    if (id)
      updateFunction()
    else
      createFunction()
  }

  return <RawMaterialCreateUi
    title={title}
    isUpdate={id}
    loading={loading}
    fields={fields}
    onSubmit={onSubmit}
    setFields={setFields}
    isModal={isModal}
    handleAreaModalClose={handleAreaModalClose}
  />
}

export default memo(RawMaterialCreateController)
