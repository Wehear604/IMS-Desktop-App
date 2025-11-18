import React, { useEffect, useState } from 'react';
import { FetchPurchaseRequestByIdApi } from '../../apis/purchaseRequest.api';
import CustomDialog from '../../components/layouts/common/CustomDialog';
import { CenteredBox } from '../../components/layouts/OneViewBox';
import { CircularProgress } from '@mui/material';
import { InformationUI } from '../../components/InformationUI';
import moment from 'moment';
import { callApiAction } from '../../store/actions/commonAction';
import { useDispatch } from 'react-redux';
import { findObjectKeyByValue } from '../../utils/main';
import { MATERIAL_REQUEST_STATUS } from '../../utils/constants';

const PurchaseRequestViewController = ({ params }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()

    const fetchList = () => {
        setLoading(true);
        dispatch(
            callApiAction(
                async () => await FetchPurchaseRequestByIdApi({ _id: params._id }),
                (response) => {
                    setData(response);
                    setLoading(false);
                },
                (err) => {
                    setLoading(false);
                }
            )
        );
    };

    useEffect(() => {
        fetchList();
    }, [params._id]);
    return (
        <CustomDialog
            id={"purchase-view"}
            loading={loading}
            err={data?.err}
            title={"Material Request Details"}
        >
            {loading ?
                <CenteredBox> <CircularProgress /> </CenteredBox>
                :
                <>
                    <InformationUI
                        Data={[
                            { label: "Date :", value: moment(data?.date).format("DD/MM/YYYY") },
                            { label: "Material Code :", value: data?.materialDetails?.rawMaterial_code || "NA", isField: !data?.materialDetails?.rawMaterial_code },
                            { label: "Material Name :", value: data?.materialDetails?.name || "NA", isField: !data?.materialDetails?.name },
                            { label: "Quantity :", value: data?.quantity || "NA", isField: !data?.quantity },
                            { label: "Status :", value: findObjectKeyByValue(data?.status, MATERIAL_REQUEST_STATUS) || "NA", isField: !data?.status },
                            { label: "Reason :", value: data?.reason || "NA", isField: !data?.reason },
                            { label: "Category :", value: data?.categoryId?.name || "NA", isField: !data?.categoryId?.name },

                            { label: "Created By :", value: data?.requestCreatedBy?.name || "NA", isField: !data?.requestCreatedBy?.name },
                            // { label: "Updated By :", value: data?.requestUpdatedBy?.name || "NA", isField: !data?.requestUpdatedBy?.name },
                            { label: "Approver 1 :", value: data?.approver1?.name || "NA", isField: !data?.approver1?.name },
                            { label: "Approver 2 :", value: data?.approver2?.name || "NA", isField: !data?.approver2?.name },

                            { label: "Allocator :", value: data?.allocator?.name || "NA", isField: !data?.allocator?.name },
                            { label: "Material Location :", value: data?.materialDetails?.location || "NA", isField: !data?.materialDetails?.location },
                            { label: "Unit Price :", value: `₹ ${data?.materialDetails?.price_per_unit}` || "NA", isField: !data?.materialDetails?.price_per_unit },
                            { label: "Lead Time :", value: `${data?.materialDetails?.lead_time} days` || "NA", isField: !data?.materialDetails?.lead_time },
                            { label: "MPN :", value: data?.materialDetails?.mpn || "NA", isField: !data?.materialDetails?.mpn },

                        ]}
                    />
                </>
            }
        </CustomDialog>
    );
};

export default PurchaseRequestViewController;
