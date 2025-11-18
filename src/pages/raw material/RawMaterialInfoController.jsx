import { useDispatch } from "react-redux";
import { memo, useEffect, useState, useCallback } from "react";
import { callApiAction } from "../../store/actions/commonAction";
import { getRawMaterialByIdApi } from "../../apis/rawMaterial.api";
import RawMaterialInfoUi from "./RawMaterialInfoUi";
import { DAY_WEEK_MONTH } from "../../utils/constants";


const RawMaterialInfoController = ({ id }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({});

  const fetchById = useCallback((id) => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await getRawMaterialByIdApi({ id }),
        async (response) => {
          setFields({ ...response });
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

  const rows = [
    {
      label: "Raw-Material Name",
      value: fields?.name || "-",
    },
    {
      label: "Item Code",
      value: fields?.rawMaterial_code || "-",
    },
    {
      label: "Price per Unit",
      value: fields?.price_per_unit || "-",
    },
    {
      label: "Lead Time",
      value: (() => {
        if (fields?.lead_time == null) return "-";
        if (fields?.lead_time <= 7) {
          return `${fields?.lead_time} ${DAY_WEEK_MONTH.DAY}`;
        } else {
          if (fields?.lead_time % 7 === 0) {
            return `${Math.floor((fields?.lead_time ?? 0) / 7)} ${DAY_WEEK_MONTH.WEEK}`;
          }
          return `${Math.floor((fields?.lead_time ?? 0) / 7)} ${DAY_WEEK_MONTH.WEEK} ${(fields?.lead_time ?? 0) % 7} ${DAY_WEEK_MONTH.DAY}`;
        }
      })(),
    },
    {
      label: "MPN Number",
      value: fields?.mpn || "-",
    },
  ];

  return <RawMaterialInfoUi loading={loading} data={fields} />;
};

export default memo(RawMaterialInfoController);
