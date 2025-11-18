import React, { useCallback, useEffect, useState } from 'react'
import CreateProductionPlanUi from './CreateProductionPlanUi'
import { FetchProductStockByIdApi } from '../../apis/product.api'
import { callApiAction } from '../../store/actions/commonAction';
import { useDispatch } from 'react-redux';
import { callSnackBar } from '../../store/actions/snackbarAction';
import { MATERIAL_STAGES, SNACK_BAR_VARIETNS } from '../../utils/constants';
import { closeModal } from '../../store/actions/modalAction';
import { createProductionPlanningApi, GetProductionPlanningByIdApi } from '../../apis/ProductionPlanning.api';

const CreateProductionPlanController = ({ id, quantity, callBack, isview }) => {
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState({})
    const dispatch = useDispatch()

    const createFunction = async (e) => {
        e.preventDefault()
        setLoading(true)
        dispatch(
            callApiAction(
                async () => await createProductionPlanningApi(fields),
                async () => {
                    callBack();
                    setLoading(false)
                    dispatch(callSnackBar("Created Production Planning Successfully", SNACK_BAR_VARIETNS.suceess))
                    dispatch(closeModal("Production-Planning"))
                },
                (err) => {
                    setLoading(false)
                    setFields({ ...fields, err })
                    dispatch(callSnackBar(err, SNACK_BAR_VARIETNS.error))
                }
            )
        )
    }

    const fetchById = useCallback((id) => {
        setLoading(true)
        dispatch(
            callApiAction(
                async () => isview ? await GetProductionPlanningByIdApi({ id }) : await FetchProductStockByIdApi({ id }),
                async (response) => {
                    const fetchQuantity = isview ? response?.quantity : quantity;
                    setFields((prev) => ({
                        name: response?.name,
                        quantity: fetchQuantity,
                        fg_Code: response?.fg_Code,
                        sfgs: response?.sfgs?.map((item) => ({
                            sfgId: item?.sfgId?._id ? item?.sfgId?._id : item._id,
                            _id: item?.sfgId?._id ? item?.sfgId?._id : item._id,
                            min_of_quantity: item.min_of_quantity,
                            currentStock: item.currentStock,
                            name: item?.sfgId?.name ? item?.sfgId?.name : item.name,
                            difference: (item?.currentStock || 0) - (item?.min_of_quantity * (fetchQuantity || 0)),
                            vendor_name: item?.vendor?.name ?? null,
                            vendor: item?.vendor?._id ?? null,
                            lead_time: Number(item?.lead_time ?? 0) ? Number(item?.lead_time ?? 0) : Number(item?.vendor?.sfg?.lead_time ?? 0),
                            status: (item?.currentStock || 0) - (item?.min_of_quantity * (fetchQuantity || 0)) < 0 ? MATERIAL_STAGES.PURCHASE : MATERIAL_STAGES.AVAILABLE
                        })),
                        skds: response?.skds?.map((item) => ({
                            skdId: item?.skdId?._id ? item?.skdId?._id : item._id,
                            _id: item?.skdId?._id ? item?.skdId?._id : item._id,
                            min_of_quantity: item.min_of_quantity,
                            currentStock: item.currentStock,
                            name: item?.skdId?.name ? item?.skdId?.name : item.name,
                            difference: (item?.currentStock || 0) - (item?.min_of_quantity * (fetchQuantity || 0)),
                            vendor_name: item?.vendor?.name ?? null,
                            vendor: item?.vendor?._id ?? null,
                            lead_time: Number(item?.lead_time ?? 0) ? Number(item?.lead_time ?? 0) : Number(item?.vendor?.skd?.lead_time ?? 0),
                            status: (item?.currentStock || 0) - (item?.min_of_quantity * (fetchQuantity || 0)) < 0 ? MATERIAL_STAGES.PURCHASE : MATERIAL_STAGES.AVAILABLE
                        })),
                        rawMaterials: response?.rawMaterials?.map((item) => ({
                            rawMaterialId: item?.rawMaterialId?._id ? item?.rawMaterialId?._id : item._id,
                            _id: item?.rawMaterialId?._id ? item?.rawMaterialId?._id : item._id,
                            min_of_quantity: item.min_of_quantity,
                            currentStock: item.currentStock,
                            name: item?.rawMaterialId?.name ? item?.rawMaterialId?.name : item.name,
                            difference: (item?.currentStock || 0) - (item?.min_of_quantity * (fetchQuantity || 0)),
                            vendor_name: item?.vendor?.name ?? null,
                            vendor: item?.vendor?._id ?? null,
                            lead_time: Number(item?.lead_time ?? 0) ? Number(item?.lead_time ?? 0) : Number(item?.vendor?.rawMaterial?.lead_time ?? 0),
                            status: (item?.currentStock || 0) - (item?.min_of_quantity * (fetchQuantity || 0)) < 0 ? MATERIAL_STAGES.PURCHASE : MATERIAL_STAGES.AVAILABLE
                        }))                       
                    }))
                    setLoading(false)
                },
                (err) => {
                    setFields((prev) => ({ ...prev, err }))
                    setLoading(false)
                }
            )
        )
    }, [dispatch])

    useEffect(() => {
        if (id) fetchById(id)
    }, [id, fetchById])

    return (<CreateProductionPlanUi
        loading={loading}
        fields={fields}
        quantity={isview ? fields?.quantity : quantity}
        onSubmit={!isview && createFunction}
        setFields={setFields}
    />
    )
}

export default CreateProductionPlanController