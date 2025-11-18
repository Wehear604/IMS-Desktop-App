import { useDispatch, useSelector } from "react-redux"
import useValidate from "../../store/hooks/useValidator"
import { closeModal } from "../../store/actions/modalAction"
import { memo, useEffect, useMemo, useState, useCallback } from "react"
import { callApiAction } from "../../store/actions/commonAction"

import SemiKnockDownInfoUi from "./SemiKnockDownInfoUi"
import { getSKDByIdApi } from "../../apis/skd.api"

const arr = (val) => (Array.isArray(val) ? val : val ? [val] : []);

const SemiKnockDownInfoController = ({ id }) => {
    const validate = useValidate()
    const dispatch = useDispatch()
    const title = "Finished Good"
    const user = useSelector((state) => state.user)

    const [loading, setLoading] = useState(false)
    const [fields, setFields] = useState({});

    const fetchById = useCallback((id) => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await getSKDByIdApi({ id }),
                async (response) => {
                    setFields((prev) => ({
                        ...response,
                        rawMaterials: response?.rawMaterials?.map((item) => ({
                            min_of_quantity: item.min_of_quantity,
                            name: item?.rawMaterialId?.name ? item?.rawMaterialId?.name : item.name,
                            code: item?.code,
                        }))
                    }))
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

    return (
        <SemiKnockDownInfoUi
            loading={loading}
            data={fields}
        />
    );
}

export default memo(SemiKnockDownInfoController);