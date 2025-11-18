import React, { useState } from 'react'
import ButtonComponentsUi from '../../components/button/ButtonComponentsUi'
import SemiFinishedGoodListController from '../SemiFinishedGood/SemiFinishedGoodListController'
import SemiKnockedDownListController from '../SemiKnockedDown/SemiKnockedDownListController'
import RawMaterialMainController from '../raw material/RawMaterialMainController'
import { ButtonGroup } from '@mui/material'
import FinishGoodListController from '../FinishGood/FinishGoodListController'

const BomUI = () => {
    const [buttonStatus, setButtonStatus] = useState("Finished_Good")
    return (<>
        <ButtonGroup >
            <ButtonComponentsUi
                onSubmit={() => setButtonStatus("Finished_Good")}
                ButtonGroup
                STATUSWiseData={buttonStatus === "Finished_Good"}
                Title={"Finished Good"}
            />
            <ButtonComponentsUi
                onSubmit={() => setButtonStatus("SemiFinishedGood")}
                ButtonGroup
                STATUSWiseData={buttonStatus === "SemiFinishedGood"}
                Title={"Semi Finished Good"}
            />
            <ButtonComponentsUi
                onSubmit={() => setButtonStatus("SemiKnockedDown")}
                ButtonGroup
                STATUSWiseData={buttonStatus === "SemiKnockedDown"}
                Title={"Semi Knocked Down"}
            />
            <ButtonComponentsUi
                onSubmit={() => setButtonStatus("Raw_Material")}
                ButtonGroup
                STATUSWiseData={buttonStatus === "Raw_Material"}
                Title={"Raw Material"}
            />
        </ButtonGroup >
        {buttonStatus === "Finished_Good" && <FinishGoodListController />}
        {buttonStatus === "SemiFinishedGood" && <SemiFinishedGoodListController />}
        {buttonStatus === "SemiKnockedDown" && <SemiKnockedDownListController />}
        {buttonStatus === "Raw_Material" && <RawMaterialMainController />}

    </>)
}

export default BomUI