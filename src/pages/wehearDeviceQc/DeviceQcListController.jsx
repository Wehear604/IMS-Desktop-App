import React, { useState } from 'react'
import DeviceQcListUi from './DeviceQcListUi'
import { useLocation } from 'react-router-dom';

const DeviceQcListController = () => {
    const [data, setData] = useState({})
    const { state } = useLocation();
    const [fields, setFields] = useState(state?.patientData || { suggestedProduct: [], device: null });
    return (
        <DeviceQcListUi
            data={data}
            setData={setData}
            fields={fields}
            setFields={setFields}
        />
    )
}

export default DeviceQcListController