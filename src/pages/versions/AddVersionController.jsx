import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { callApiAction } from "../../store/actions/commonAction";
import AddVersionUI from "./AddVersionUI"
import { closeModal } from "../../store/actions/modalAction";
import useValidate from "../../store/hooks/useValidator";
import { createVersion } from "../../apis/version.api";
import { fetchVersionDataAction } from "../../store/actions/setting.Action";

const AddVersionController = ({ callBack }) => {

    const validate = useValidate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const { settings } = useSelector((state) => state)


    const [fields, setFields] = useState({
        name: "",
        main_version: null,
        sub_version: null,
        app_type: "",
        description: "",
        url: "",
        policy_name: "",
        err: ""
    })

    const validationSchema = useMemo(() => ([
        {
            required: true,
            value: fields.name,
            field: 'Version Name '
        },
        {
            required: true,
            value: fields.description,
            field: 'Version Description',
        },
        {
            required: true,
            value: fields.main_version,
            field: 'Main Version',
        },
        {
            required: true,
            value: fields.sub_version,
            field: 'Sub Version',
        }
    ]), [fields])

    const submitData = (e) => {
        e.preventDefault()
        const validationResponse = validate(validationSchema)

        if (validationResponse === true) {
            setLoading(true)
            dispatch(callApiAction(
                async () => await createVersion({ ...fields }),
                (response) => {
                    callBack()
                    setLoading(false)
                    dispatch(fetchVersionDataAction(settings.version_filters))
                    dispatch(closeModal("version"))
                },
                (err) => {
                    setLoading(false)
                    setFields({ ...fields, err })
                }
            ))
        } else {
            setFields({ ...fields, 'err': validationResponse })
        }
    }
    return <AddVersionUI
        loading={loading}
        onSubmit={submitData}
        fields={fields}
        setFields={setFields}
    />
}

export default AddVersionController;