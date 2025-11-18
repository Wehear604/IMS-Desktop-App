import { Box } from "@mui/system";
import DataTable from "../../components/tables/DataTable";
import CustomDialog from "../../components/layouts/common/CustomDialog";

const QcDashboardListOnClickCountController = ({
  title,
  filters,
  setFilters,
  list,
  loading,
  columns,
}) => {
 
  return (
    <>
          <CustomDialog id={"dashboard-details"} title={title}>
    
          <Box sx={{ minHeight: "40vh" }}>
            <DataTable
              key={JSON.stringify(list)}
              columns={columns}
              rows={list ? list : []}
              count={list.length ?? 0}
              filters={filters}
              setFilters={setFilters}
              loading={loading}
            />
          </Box>
          </CustomDialog>
    </>
  );
};
export default QcDashboardListOnClickCountController;
