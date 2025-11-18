import { Box, Grid, IconButton } from '@mui/material';
import CustomInput from '../../components/inputs/CustomInputs';
import DeleteIcon from '@mui/icons-material/Delete';

const RejectedQuantityUI = ({ fields, loading, setFields, handleDeleteItem, isview }) => {
    
    return (<Box mt={2}>
        {fields?.rejected?.length > 0 && fields?.rejected?.map((val, inx) => {
            if (!fields?.rejected[inx]) return null;

            return (
                <Grid container spacing={2} key={inx}>
                    <Grid item xs={12} sm={5.5} md={5.5}>
                        <CustomInput
                            disabled={loading || isview}
                            value={fields?.rejected[inx]?.quantity || ''}
                            onChange={(e) => {
                                let value = e.target.value;
                                if (!/^\d*$/.test(value)) return;
                                const updatedValue = Math.max(0, Number(value));

                                const updated = [...fields.rejected];
                                updated[inx] = {
                                    ...updated[inx],
                                    quantity: updatedValue,
                                };

                                setFields({ ...fields, err: "", rejected: updated });
                            }}
                            type="number"
                            label={"Rejected Quantity*"}
                            inputProps={{
                                min: 0,
                                onKeyDown: (e) => {
                                    if (['-', 'e', '+'].includes(e.key)) {
                                        e.preventDefault();
                                    }
                                },
                            }}
                            onWheel={(e) => e.target.blur()}
                            sx={{
                                "& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button": {
                                    WebkitAppearance: "none",
                                    margin: 0,
                                },
                                "& input": {
                                    MozAppearance: "textfield",
                                },
                            }}
                        />

                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <CustomInput
                            disabled={loading || isview}
                            value={fields?.rejected[inx]?.reason}
                            onChange={(e) => {
                                let value = e.target.value;
                                const updated = [...fields.rejected];
                                updated[inx] = {
                                    ...updated[inx],
                                    reason: value,
                                };
                                setFields({ ...fields, err: "", rejected: updated });
                            }}
                            type="text"
                            label={"Reason*"}
                            InputLabelProps={{
                                shrink: fields?.rejected[inx]?.reason && true,
                            }}
                        />
                    </Grid>
                    {!isview &&<Grid item xs={12} sm={0.5} md={0.5} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                        <IconButton
                            disabled={fields?.rejected?.length <= 1}
                            color="error"
                            onClick={() => handleDeleteItem(inx)}
                            aria-label="delete"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>}
                </Grid>
            );
        })}
    </Box>
    );
};


export default RejectedQuantityUI