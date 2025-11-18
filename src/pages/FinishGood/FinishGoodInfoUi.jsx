import React from "react";
import InfoTable from "../../components/tables/InfoTable";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { useDispatch } from "react-redux";
import { closeModal } from "../../store/actions/modalAction";
import { InformationUI } from "../../components/InformationUI";
import { Box, Card, CircularProgress, Grid, Typography } from "@mui/material";
import { CenteredBox } from "../../components/layouts/OneViewBox";
import FileInput from "../../components/layouts/upload/FileInput";
import ImageComponent from "../../components/layouts/upload/ImageComponent";

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

const FinishGoodInfoUi = ({ data, loading }) => {
  const dispatch = useDispatch();
  console.log("img", data?.product_image);
  return (
    <CustomDialog
      id={"infoupdatee"}
      title={"Finished Good"}
      closeText="Close"
      onClose={() => dispatch(closeModal("infoupdatee"))}
    >
      {loading ?
        <CenteredBox> <CircularProgress /> </CenteredBox>
        :
        <>
          <InformationUI
            Data={[
              { label: "FG Name :", value: data?.name },
              { label: "FG Code :", value: data?.fg_Code || "NA" },
              { label: "FG Type :", value: data?.product_type?.name || "NA" },
              { label: "FG Color :", value: data?.product_color?.name || "NA" },
              { label: "FG Brand :", value: data?.product_brand?.name || "NA" },
              { label: "Price :", value: data?.product_price || "NA" },
              // { label: "Description :", value: data?.description || "NA" },
              { label: "Special Marking :", value: data?.specialMarking?.name || "NA" },
              { label: "Image :", value: data?.product_image ? <ImageComponent src={data?.product_image} /> : "NA" },
            ]}
          />
          {data?.sfg?.length > 0 && <Box mb={2}>
            <DataView
              TableTitle={"Semi Finished Good"}
              TableData={data?.sfg}
              tableKey="sfgs"
            />
          </Box>}
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
      }
    </CustomDialog>
  );
};

export default FinishGoodInfoUi;
