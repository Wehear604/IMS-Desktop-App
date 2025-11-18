import { useDispatch } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useEffect, useMemo, useState } from "react"
import { callApiAction } from "../../store/actions/commonAction"
import CreateSemiKnockedDownUi from "./CreateSemiKnockedDownUi"
import { callSnackBar } from "../../store/actions/snackbarAction"
import { SNACK_BAR_VARIETNS } from "../../utils/constants"
import { CreateSKDApi, getSKDByIdApi, UpdateSKDApi } from "../../apis/skd.api"
import { useCallback } from "react"

const CreateSemiKnockedDownController = ({ callBack = () => { }, id, isModal, handleAreaModalClose }) => {
  const validate = useValidate()
  const dispatch = useDispatch()
  const title = "Semi Knocked Down"

  const [loading, setLoading] = useState(false)

  const [fields, setFields] = useState({
    err: '',
    id,
    name: '',
    skd_Code: '',
    rawMaterials: [
      {
        rawMaterialId: "",
        min_of_quantity: null,
        percentage: null,
      }
    ],
    items: [
      {
        itemId: "",
        min_of_quantity: null,
        code: "",
      },
    ],
  })

  const [originalDocument, setOriginalDocument] = useState({})

  const validationSchemaForCreate = useMemo(() => ([



    {
      required: true,
      value: fields.name,
      field: 'SKD Name',
    },
    {
      required: true,
      value: fields.skd_Code,
      field: 'SKD Code',
    },
    // {
    //   required: true,
    //   value: fields.rawMaterials.every((item) => item.rawMaterialId !== ""),
    //   field: 'Raw Materials rawMaterialId',
    // },
    {
      required: fields.rawMaterials.every((item) => item.rawMaterialId !== ""),
      value: fields.rawMaterials.every((item) => item.rawMaterialId !== "" && (item.min_of_quantity !== null || item.min_of_quantity !== 0)),
      field: 'Min Of Quantity Of Raw Material',
    },

  ]), [fields])

  const validationSchemaForUpdate = useMemo(() => ([
    {
      required: true,
      value: fields.name,
      field: 'SKD Name',
    },
    {
      required: true,
      value: fields.skd_Code,
      field: 'SKD Code',
    },
    // {
    //   required: true,
    //   value: fields.rawMaterials.every((item) => item.rawMaterialId !== ""),
    //   field: 'Raw Materials rawMaterialId',
    // },
    {
      required: fields.rawMaterials.every((item) => item.rawMaterialId !== ""),
      value: fields.rawMaterials.every((item) => !(item.min_of_quantity === null || item.min_of_quantity === 0)),
      field: 'Min Of Quantity Of Raw Material',
    },
    {
      required: fields.rawMaterials.every((item) => item.min_of_quantity >= 0),
      value: fields.rawMaterials.every((item) => !(item.rawMaterialId === "" || item.rawMaterialId === null || item.rawMaterialId._id === "")),
      field: 'Raw Materials rawMaterialId',
    },

  ]), [fields])

  const createFunction = async () => {
    const validationResponse = validate(validationSchemaForCreate)

    if (validationResponse === true) {


      setLoading(true)
      dispatch(
        callApiAction(
          async () => await CreateSKDApi({ ...fields }),
          async (response) => {
            callBack()
            setLoading(false)
            dispatch(
              callSnackBar(
                "Semi Knocked Down Created Successfully",
                SNACK_BAR_VARIETNS.suceess
              )
            );
            dispatch(closeModal("create_Semi_Knocked_Down"))
          },
          (err) => {
            setLoading(false)
            setFields({ ...fields, err })
          }
        )
      )
    } else {
      setFields({ ...fields, 'err': validationResponse })
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
    const processedrawMaterialId = fields?.rawMaterials?.map((entry) => ({
      ...entry,
      rawMaterialId: typeof entry.rawMaterialId === "object" ? entry?.rawMaterialId?._id : entry.rawMaterialId,
    }));
    if (validationResponse === true) {
      setLoading(true);
      dispatch(
        callApiAction(
          async () => await UpdateSKDApi({ ...fields, rawMaterials: processedrawMaterialId, specialMarking: fields?.specialMarking?._id ? fields?.specialMarking?._id : fields?.specialMarking }),
          async (response) => {
            callBack();
            setLoading(false);
            dispatch(
              callSnackBar(
                "Updated Semi Knocked Down Successfully",
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
    console.log("object id", id);
    dispatch(
      callApiAction(
        async () => await getSKDByIdApi({ id }),
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
    if (id) fetchById(id);
  }, [id, fetchById]);


  const onSubmit = async (e) => {
    e.preventDefault()
    if (id)
      updateFunction()
    else
      createFunction()
  }

  return <CreateSemiKnockedDownUi
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
export default memo(CreateSemiKnockedDownController)