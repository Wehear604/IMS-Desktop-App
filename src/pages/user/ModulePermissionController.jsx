import { memo, useCallback, useEffect, useMemo, useState } from "react";
import useValidate from "../../store/hooks/useValidator";
import { useDispatch } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { closeModal } from "../../store/actions/modalAction";
import ModulePermissionUi from "./ModulePermissionUi";
import { callSnackBar } from "../../store/actions/snackbarAction";
import { SNACK_BAR_VARIETNS } from "../../utils/constants";
import { fetchUserByIdApi, updateModulesPermission } from "../../apis/user.api";

const ModulePermissionController = ({ callBack = () => { }, id, ims_modules }) => {
  const validate = useValidate();
  const dispatch = useDispatch();

  const modalKey = "ims_modules";
  const title = "Modules ";

  const updateApi = updateModulesPermission;

  const [loading, setLoading] = useState(false);

  const [fields, setFields] = useState({
    err: "",
    id,
    ims_modules:[]
  });

  const validationSchemaForUpdate = useMemo(() => [], []);

  const updateFunction = async () => {
    const validationResponse = validate(validationSchemaForUpdate);

    if (validationResponse === true) {
      setLoading(true);

      dispatch(
        callApiAction(
          async () => await updateApi({ ...fields }),
          async (response) => {
            await callBack({ ims_modules: fields.ims_modules });
            setLoading(false);
            dispatch(callSnackBar("Module Access Updated Successfully", SNACK_BAR_VARIETNS.suceess))
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

  const onSubmit = async (e) => {
    e.preventDefault();
    updateFunction();
  };

    const fetchById = useCallback((id) => {
        setLoading(true)
        dispatch(
            callApiAction(
                async () => await fetchUserByIdApi({ id }),
                async (response) => {
                  setFields((prev) => ({ ...prev, ...response }))
                    setLoading(false)
                },
                (err) => {
                    setFields((prev) => ({ ...prev, err }))
                    setLoading(false)
                }
            )
        )
    }, [dispatch])

    useEffect(() => {
        if (id)
            fetchById(id)

    }, [id, fetchById])
  return (
    <ModulePermissionUi
      title={title}
      modalKey={modalKey}
      loading={loading}
      isUpdate={id}
      fields={fields}
      onSubmit={onSubmit}
      setFields={setFields}
    />
  );
};
export default memo(ModulePermissionController);
