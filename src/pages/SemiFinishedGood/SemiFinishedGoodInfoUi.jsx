import React from "react";
import InfoTable from "../../components/tables/InfoTable";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { useDispatch } from "react-redux";
import { closeModal } from "../../store/actions/modalAction";
import { Box, Card, CircularProgress, Grid, Typography } from "@mui/material";
import { CenteredBox } from "../../components/layouts/OneViewBox";
import { InformationUI } from "../../components/InformationUI";

const DataView = ({ TableData, TableTitle, tableKey }) => {
  const istrue = tableKey === "rawMaterials"
  return (
    <>
      {TableData && TableTitle && <>
        <Box p={2} sx={{ border: "1px solid rgba(0,0,0,0.2)", borderRadius: "10px" }}>
          <Box p={2}>
            <Typography fontWeight="bold" variant="h6">{TableTitle}</Typography>
          </Box>
          <Card sx={{ marginBottom: 2, padding: 2, backgroundColor: "rgba(0, 0, 0, 0.26)", color: "rgb(0 0 0 / 37%)" }}>
            <Grid container alignItems="center" spacing={5}>
              <Grid item xs={!istrue ? 6 : 4}>
                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Name</Typography>
              </Grid>
              {istrue && <Grid item xs={!istrue ? 6 : 4}>
                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Code</Typography>
              </Grid>}
              <Grid item xs={!istrue ? 6 : 4}>
                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Min Of Quantity Required</Typography>
              </Grid>
            </Grid>
          </Card>
          {TableData.map((item, index) => {
            return (
              <Card key={index} sx={{ marginBottom: 2, padding: 2 }}>
                <Grid container alignItems="center" spacing={5}>
                  <Grid item xs={!istrue ? 6 : 4} sx={{ textAlign: "center" }}>
                    <Typography variant="body2">{item?.name}</Typography>
                  </Grid>
                  {istrue && <Grid item xs={!istrue ? 6 : 4} sx={{ textAlign: "center" }}>
                    <Typography variant="body2">{item?.code}</Typography>
                  </Grid>}
                  <Grid item xs={!istrue ? 6 : 4} sx={{ textAlign: "center" }}>
                    <Typography variant="body2">
                      {item?.min_of_quantity}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            )
          })}
        </Box></>}
    </>
  )
}

const SemiFinishedGoodInfoUi = ({ data, loading }) => {
  const dispatch = useDispatch();

  return (
    <CustomDialog
      id={"infoupdatee"}
      title={"Semi Finished Good"}
      closeText="Close"
      onClose={() => dispatch(closeModal("infoupdatee"))}
    >
      {loading ?
        <CenteredBox> <CircularProgress /> </CenteredBox>
        :
        <>
          <InformationUI
            Data={[
              { label: "SFG Name :", value: data?.name },
              { label: "SFG Code :", value: data?.sfg_Code || "NA" },
              { label: "Special Marking :", value: data?.specialMarking?.name || "NA" },
              { label: "Description :", value: data?.description || "NA" },
              { label: "MPN :", value: data?.mpn || "NA" },
            ]}
          />
          {data?.skds?.length > 0 && <Box mb={2}>
            <DataView
              TableTitle={"Semi Knocked Down"}
              TableData={data?.skds}
              tableKey="skds"
            />
          </Box>}
          {data?.rawMaterials?.length > 0 && <Box mb={2}>
            <DataView
              TableTitle={"Raw Materials"}
              TableData={data?.rawMaterials}
              tableKey="rawMaterials"
            />
          </Box>}
        </>
      }    </CustomDialog>
  );
};

export default SemiFinishedGoodInfoUi;
