import React from "react";
import InfoTable from "../../components/tables/InfoTable";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { useDispatch } from "react-redux";
import { closeModal } from "../../store/actions/modalAction";
import { InformationUI } from "../../components/InformationUI";
import { CenteredBox } from "../../components/layouts/OneViewBox";
import { CircularProgress } from "@mui/material";

const RawMaterialInfoUi = ({ data, loading }) => {
  const dispatch = useDispatch();

  return (
    <CustomDialog
      id={"infoupdatee"}
      title={"Raw Material"}
      closeText="Close"
      onClose={() => dispatch(closeModal("infoupdatee"))}
    >
      {loading ?
        <CenteredBox> <CircularProgress /> </CenteredBox>
        :
        <>
          <InformationUI
            Data={[
              { label: "Raw-Material Name :", value: data?.name },
              { label: "Raw-Material Code :", value: data?.rawMaterial_code || "NA" },
              { label: "Raw-Material Time :", value: data?.itemType?.name || "NA" },
              { label: "Price per Unit :", value: data?.price_per_unit || "NA" },

              { label: "Lead Time :", value: data?.lead_time || "NA" },

              { label: "MPN :", value: data?.mpn || "NA" },
              { label: "Special Marking :", value: data?.specialMarking?.name || "NA" },
              { label: "Measurement Unit :", value: data?.unit || "NA" },

            ]}
          />
        </>
      }
    </CustomDialog>
  );
};

export default RawMaterialInfoUi;
