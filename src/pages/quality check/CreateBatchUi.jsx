import { Box, ListItem } from '@mui/material';
import React from 'react'
import PaddingBoxInDesktop from '../../components/layouts/PaddingBoxDesktop';
import AsyncDropDown from '../../components/inputs/AsyncDropDown';
import { fetchProductApi } from '../../apis/product.api';
import { StyledSearchBar } from '../../components/inputs/SearchBar';
import CustomInput from '../../components/inputs/CustomInputs';
import CustomDialog from '../../components/layouts/common/CustomDialog';
import moment from 'moment';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { fetchBatchApi } from '../../apis/qc.api';
import { fetchTypeApi } from '../../apis/productType.api';
import { fetchColorApi } from '../../apis/productColor.api';
import { fetchBrandApi } from '../../apis/productBrand.api';

const CreateBatchUi = ({ fields, setFields, loading, onSubmit }) => {
    const modalkey = "batchadd"
    return (

        <CustomDialog
            id={modalkey}
            loading={loading}
            err={fields?.err}
            onSubmit={onSubmit}
            title={"Add Batch"}
            closeText="Close"
            confirmText={"Add"}
        >
            {
                <PaddingBoxInDesktop
                    mt={2}
                    sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
                >
                    <AsyncDropDown
                        defaultVal={
                            fields.product_id
                                ? {
                                    _id: fields?.product_id?._id,
                                    name: fields?.product?.product_id,
                                }
                                : null
                        }
                        lazyFun={async (para) =>
                            await fetchProductApi({ ...para, allStatus: true })
                        }
                        OptionComponent={({ option, ...rest }) => {
                            return <ListItem {...rest}>{option.product_name}</ListItem>;
                        }}
                        value={fields?.product_id}
                        onChange={async (changedVal) => {
                            setFields({
                                ...fields,
                                product_id: changedVal ? changedVal._id : null,
                            });
                        }}
                        titleKey={"product_name"}
                        valueKey={"_id"}
                        InputComponent={(params) => (
                            <StyledSearchBar
                                placeholder={"Select Product*"}
                                {...params}
                                margin="none"
                            />
                        )}
                    />
                </PaddingBoxInDesktop>
            }

            {
                <Box mt={2}>
                    <CustomInput
                        disabled={loading}
                        value={fields.batch_no}
                        onChange={(e) =>
                            setFields({ ...fields, err: "", batch_no: e.target.value })
                        }
                        type="text"
                        label={"Product Batch*"}
                        sx={{ height: "56px" }}
                    />
                </Box>
            }



            {
                <Box mt={2}>
                    <CustomInput
                        disabled={loading}
                        value={fields.quantity}
                        onChange={(e) =>
                            setFields({ ...fields, err: "", quantity: e.target.value })
                        }
                        type="text"
                        label={"Quantity*"}
                        sx={{ height: "56px" }}
                    />
                </Box>
            }

            {
                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                    <DesktopDatePicker
                        disabled={loading}
                        inputFormat="DD/MM/YYYY"
                        value={moment(fields.date ?? null)}
                        onChange={(e) => {
                            setFields({ ...fields, err: "", date: moment(e).toISOString() });
                        }}
                        renderInput={(props) => (
                            <CustomInput {...props} sx={{ height: "56px" }} />
                        )}
                        type="date"
                        label={"Date*"}
                    />
                </Box>
            }
        </CustomDialog>

    )
}

export default CreateBatchUi