import { Grid, Skeleton } from "@mui/material";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { callApiAction } from "../../store/actions/commonAction";
import { fetchProductApi } from "../../apis/product.api";
import ClickButton from "../../components/button/ClickButton";
import RawMaterialViewControllerProduct from "../products/RawMaterialViewControllerProduct";
import { openModal } from "../../store/actions/modalAction";


const DashboardProductCounts = ({ filters }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchCountFun = () => {
    setLoading(true);
    dispatch(
      callApiAction(
        async () => await fetchProductApi({ ...filters }),
        (response) => {
          setData(response.result);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        }
      )
    );
  };

  useEffect(() => {
    fetchCountFun();
  }, [
    filters.startDate,
    filters.endDate,
    filters.userId,
  ]);

  if (loading)
    return (
      <Grid container spacing={2} height={200}>
        <Grid item xs={6} md={3}>
          <Skeleton variant="rounded" width="100%" height="100px" />
        </Grid>
        <Grid item xs={6} md={3}>
          <Skeleton variant="rounded" width="100%" height="100px" />
        </Grid>
        <Grid item xs={6} md={3}>
          <Skeleton variant="rounded" width="100%" height="100px" />
        </Grid>

        <Grid item xs={6} md={3}>
          <Skeleton variant="rounded" width="100%" height="150px" />
        </Grid>
      </Grid>
    );

  if (data.length > 0)
    return (
      <Grid container spacing={2}>
        {data.map((item) => (
          <Grid item key={item._id} xs={6} md={12 / data.length}>
            <ClickButton
              onClick={() => {

                dispatch(
                  openModal(
                    <RawMaterialViewControllerProduct params={item} />,
                    "sm",
                    false,
                    "infoupdate"
                  )
                );
              }
              }
              active={filters.product_code === item.product_code}
              title={item.current_stock}
              subTitle={item.product_name}
            />
          </Grid>
        ))}
      </Grid>
    );

  return <></>;
};

export default memo(DashboardProductCounts);