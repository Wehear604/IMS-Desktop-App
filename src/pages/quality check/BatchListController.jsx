import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../../store/actions/modalAction";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { fetchBatchAction } from "../../store/actions/setting.Action";
import { useNavigate, useParams } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import BatchListUi from "./BatchListUi";
import QcChecklistDetailedViewUi from "./QcChecklistDetailedViewUi";


const ActionComponent = memo(({ params, setParams, deleteApi }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state);
  const dispatch = useDispatch();
  const onViewMore = () => {
    navigate(`${params.serial_no}`);
  };

  const DetailedView = () => {
    dispatch(openModal(<QcChecklistDetailedViewUi title={"CheckList Details"} params={params?.serial_no}/>, "md", false, "masking"))
  }


  return (
    <Box sx={{ width: "100%", alignItems: "flex-start", display: "flex" }}>
      <Tooltip title={"Start Quality Check"}>
        <IconButton disabled={loading} size="inherit" onClick={onViewMore}>
          <Edit color="info" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Tooltip title={"Quality CheckList View"}>
        <IconButton disabled={loading} size="inherit" onClick={DetailedView}>
          <VisibilityIcon color="info" fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  );
});

const BatchListController = () => {
  const { product_id } = useParams();
  const { batch_no } = useParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { settings } = useSelector((state) => state);



  const columns = useMemo(
    () => [


      {
        id: 1,
        fieldName: "",
        label: "Product Name",
        align: "left",
        sort: true,
        renderValue: (param, setParam) => param.product.product_name
      },

      {
        id: 2,
        fieldName: "serial_no",
        label: "Serial No",
        align: "left",
        sort: true,
      },

      {
        id: 5,
        fieldName: "",
        label: "Action",
        align: "left",
        renderValue: (params, setParams) => (
          <ActionComponent params={params} setParams={setParams} />
        ),
      }

    ],
    []
  );


  const [filters, setFilters] = useState({
    pageNo: 1,
    pageSize: 10,
    search: "",
    searchable: ["serial_no"],
    sort: "createdAt",
    sortDirection: 1,
    product_id: product_id,
    batch_no: batch_no
  });


  const getBatchList = () => {
    if (
      !settings.batch_data ||
      settings.batch_data.length === 0 ||
      JSON.stringify(filters) != JSON.stringify(settings.batch_filters)
    ) {
      dispatch(fetchBatchAction(filters));
    }
  };

  useEffect(() => {
    getBatchList();
  }, [filters]);

  return (
    <>
      <BatchListUi
        filters={filters}
        setFilters={setFilters}
        loading={settings.batch_loading}
        list={settings.batch_data}
        columns={columns}

      />
    </>
  );
};
export default BatchListController;
