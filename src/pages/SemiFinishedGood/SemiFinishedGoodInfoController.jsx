import { useDispatch } from "react-redux";
import { memo, useEffect, useState, useCallback } from "react";
import { callApiAction } from "../../store/actions/commonAction";

import SemiFinishedGoodInfoUi from "./SemiFinishedGoodInfoUi";
import { getSFGByIdApi } from "../../apis/sfg.api";

const arr = (val) => (Array.isArray(val) ? val : val ? [val] : []);

const SemiFinishedGoodInfoController = ({ id }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({});

  const fetchById = useCallback((id) => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await getSFGByIdApi({ id }),
        async (response) => {
          setFields((prev) => ({
            ...response,
            skds: response?.skds?.map((item) => ({
              min_of_quantity: item.min_of_quantity,
              name: item?.skdId?.name ? item?.skdId?.name : item.name
            })),
            rawMaterials: response?.rawMaterials?.map((item) => ({
              min_of_quantity: item.min_of_quantity,
              name: item?.rawMaterialId?.name ? item?.rawMaterialId?.name : item.name,
              code: item?.code,
            }))
          }))
          setLoading(false);
        },
        (err) => {
          setFields((prev) => ({ ...prev, err }));
          setLoading(false);
        }
      )
    );
  }, [dispatch]);

  useEffect(() => {
    if (id) fetchById(id);
  }, [id, fetchById]);

  return <SemiFinishedGoodInfoUi loading={loading} data={fields} />;
};

export default memo(SemiFinishedGoodInfoController);
