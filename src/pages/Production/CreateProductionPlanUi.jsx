import React from 'react'
import CustomDialog from '../../components/layouts/common/CustomDialog'
import { Box, Card, FormControl, Grid, InputLabel, ListItem, MenuItem, Select, Typography } from '@mui/material'
import moment from 'moment'
import { MATERIAL_STAGES } from '../../utils/constants'
import { titleCase } from '../../utils/main'
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop'
import AsyncDropDown from '../../components/inputs/AsyncDropDown'
import { fetchvendorApi } from '../../apis/vendor.api'
import { StyledSearchBar } from '../../components/inputs/SearchBar'

const InformationUI = ({ Title, Data, TableData, TableTitle, Quantity, setFields, tableKey }) => {

    return (<>
        <Box sx={{ height: "auto", width: "100%", borderRadius: "10px" }}>
            {Title && <Box p={2} sx={{ borderBottom: "1px solid #1D013B", backgroundColor: "rgba(29, 1, 59, 0.1)" }}>
                <Typography variant='h4' color={"#1D013B"}>{Title}</Typography>
            </Box>}
            {Data?.length > 0 && <Grid container p={2} pt={0} md={12}>
                {Data.map((item, index) => (
                    !item?.isField && <>
                        <Grid item mt={2} md={3} xs={3} sm={3} key={index}>
                            <Typography fontWeight="bold" variant="h6">{item.label}</Typography>
                        </Grid>
                        <Grid item mt={2} md={item.IsFullLine ? 9 : 3} xs={item.IsFullLine ? 9 : 3} sm={item.IsFullLine ? 9 : 3} key={index}>
                            <Typography variant="h6" sx={{ display: "flex", justifyContent: "flex-start", color: "#808080" }}>
                                {item.isArray && Array.isArray(item.value) ? item.value.map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(", ") : item.value}
                            </Typography>
                        </Grid>
                    </>
                ))}
            </Grid>}
            {TableData && TableTitle && <>
                <Box p={2} sx={{ border: "1px solid rgba(0,0,0,0.2)", borderRadius: "10px" }}>
                    <Box p={2}>
                        <Typography fontWeight="bold" variant="h6">{TableTitle}</Typography>
                    </Box>
                    <Card sx={{ marginBottom: 2, padding: 2, backgroundColor: "rgba(0, 0, 0, 0.26)", color: "rgb(0 0 0 / 37%)" }}>
                        <Grid container alignItems="center" spacing={5}>
                            <Grid item xs={2}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Name</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Total Quantity Required</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Current Quantity</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Quantity Difference</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Status</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Vendor Name</Typography>
                            </Grid>
                            <Grid item xs={1.5}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>Total Time</Typography>
                            </Grid>
                        </Grid>
                    </Card>
                    {TableData.map((item, index) => {
                        return (
                            <Card key={index} sx={{ marginBottom: 2, padding: 2 }}>
                                <Grid container alignItems="center" spacing={5}>
                                    <Grid item xs={2} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item.name}</Typography>
                                    </Grid>
                                    <Grid item xs={1.5} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">
                                            {item.min_of_quantity * Quantity}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={1.5} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">{item.currentStock}</Typography>
                                    </Grid>
                                    <Grid item xs={1.5} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2" backgroundColor={item?.difference < 0 ? "#fa4b4b70" : "rgb(63 243 167 / 41%)"} borderRadius={"10px"} border={item?.difference < 0 ? "2px solid #fa4b4b70" : "2px solid rgb(63 243 167 / 41%)"} color={item?.difference < 0 ? "#d32f2fd6" : "#00100782"}>{item?.difference}</Typography>
                                    </Grid>
                                    <Grid item xs={2} sx={{ textAlign: "center" }}>
                                        <FormControl fullWidth>
                                            <InputLabel >Status</InputLabel>
                                            <Select
                                                value={item.status}
                                                label="Status*"
                                                onChange={(e) => {
                                                    const updatedstatus = [...TableData];
                                                    updatedstatus[index] = {
                                                        ...updatedstatus[index],
                                                        status: e.target.value
                                                    };
                                                    setFields(prev => ({
                                                        ...prev,
                                                        err: '',
                                                        [tableKey]: updatedstatus
                                                    }));
                                                }}
                                            >
                                                {Object.keys(MATERIAL_STAGES).map((key) => (
                                                    <MenuItem key={key} value={MATERIAL_STAGES[key]}>{titleCase(key)}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={2} sx={{ textAlign: "center" }}>
                                        <PaddingBoxInDesktop
                                            sx={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                            }}
                                        >
                                            <AsyncDropDown
                                                Value={
                                                    item.vendor && item.vendor_name
                                                        ? {
                                                            _id: item.vendor,
                                                            name: item.vendor_name,
                                                        }
                                                        : null
                                                }
                                                lazyFun={async (para) =>
                                                    await fetchvendorApi({ ...para, allStatus: true, tableKey, id: item?._id })
                                                }
                                                OptionComponent={({ option, ...rest }) => (
                                                    <ListItem {...rest}>{option.name}</ListItem>
                                                )}
                                                onChange={async (changedVal) => {

                                                    const TypeOfId = (tableKey) => {
                                                        switch (tableKey) {
                                                            case "sfgs":
                                                                return "sfgId";
                                                            case "skds":
                                                                return "skdId";
                                                            default:
                                                                return "rawMaterialId";
                                                        }
                                                    }
                                                    const key = TypeOfId(tableKey);
                                                    const data = changedVal?.[tableKey]?.find(obj => obj?.[key] === item?._id);
                                                    console.log(" data fetch",data)
                                                    const updatedstatus = [...TableData];
                                                    updatedstatus[index] = {
                                                        ...updatedstatus[index],
                                                        vendor: changedVal ? changedVal?._id : null,
                                                        vendor_name: changedVal ? changedVal?.name : null,
                                                        lead_time: Number(data?.lead_time ?? 0)
                                                    };
                                                    setFields(prev => ({
                                                        ...prev,
                                                        err: '',
                                                        [tableKey]: updatedstatus
                                                    }));
                                                }}
                                                titleKey={"name"}
                                                valueKey={"_id"}
                                                InputComponent={(params) => (
                                                    <StyledSearchBar
                                                        label={"Select Vendor"}
                                                        placeholder={"Select Vendor"}
                                                        {...params}
                                                        margin="none"
                                                    />
                                                )}
                                            />
                                        </PaddingBoxInDesktop>
                                    </Grid>
                                    <Grid item xs={1.5} sx={{ textAlign: "center" }}>
                                        <Typography variant="body2">
                                            {item?.difference < 0 ?
                                                `${Number(item?.lead_time) || 0} ${Number(item?.lead_time) === 1 ? "Day" : "Days"}` :"Stock Available"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Card>
                        )
                    })}
                </Box></>}
        </Box>
    </>)
}

const CreateProductionPlanUi = ({ onSubmit, loading, fields, quantity, setFields }) => {
    return (<CustomDialog
        id={"Production-Planning"}
        loading={loading}
        err={fields.err}
        onSubmit={onSubmit}
        title={"Production Planning"}
        closeText="Close"
        confirmText={"Create Plan"}
    >
        <Box>
            <InformationUI
                Data={[
                    { label: "Create Date :", value: moment().format("DD-MM-YYYY") },
                    { label: "Product Name :", value: fields?.name ? fields?.name : "NA" },
                    { label: "Planned Quantity :", value: quantity ? quantity : "NA" },
                    { label: "Fg Code :", value: fields?.fg_Code ? fields?.fg_Code : "NA" },
                ]}
            />
            <Box mb={2}>
                <InformationUI
                    TableTitle={"Semi Finished Good"}
                    Quantity={quantity}
                    TableData={fields?.sfgs}
                    setFields={setFields}
                    tableKey="sfgs"
                />
            </Box>
            <Box mb={2}>
                <InformationUI
                    TableTitle={"Semi Knocked Down"}
                    Quantity={quantity}
                    TableData={fields?.skds}
                    setFields={setFields}
                    tableKey="skds"
                />
            </Box>
            <Box mb={2}>
                <InformationUI
                    TableTitle={"Raw Materials"}
                    Quantity={quantity}
                    TableData={fields?.rawMaterials}
                    setFields={setFields}
                    tableKey="rawMaterials"
                />
            </Box>
        </Box>
    </CustomDialog>
    )
}

export default CreateProductionPlanUi