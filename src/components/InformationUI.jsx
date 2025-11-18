import { Box, Grid, Typography } from "@mui/material"


export const InformationUI = ({ Title, Data }) => {

    return (<>
        <Box sx={{ height: "auto", width: "100%", borderRadius: "10px" }}>
            {Title && <Box p={2} sx={{ borderBottom: "1px solid #1D013B", backgroundColor: "rgba(29, 1, 59, 0.1)" }}>
                <Typography variant='h4' color={"#1D013B"}>{Title}</Typography>
            </Box>}
            {Data?.length > 0 && <Grid container p={2} pt={0} md={12}>
                {Data.map((item, index) => (
                    !item?.isField && <>
                        <Grid item mt={2} md={3} xs={3} sm={3} key={index} border= {"1px solid #dddddd"} p={2}>
                            <Typography fontWeight="bold" variant="h6">{item.label}</Typography>
                        </Grid>
                        <Grid p={2} border={"1px solid #dddddd"} item mt={2} md={item.IsFullLine ? 9 : 3} xs={item.IsFullLine ? 9 : 3} sm={item.IsFullLine ? 9 : 3} key={index}>
                            <Typography variant="h6" sx={{ display: "flex", justifyContent: "flex-start", color: "#808080" }}>
                                {item?.isArray && Array.isArray(item.value) ? item.value.map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(", ") : item.value}
                            </Typography>
                        </Grid>
                    </>
                ))}
            </Grid>}
        </Box>
    </>)
}