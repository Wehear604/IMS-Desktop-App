import { memo, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Chip } from "@mui/material"
import LeadListUi from "./LeadListUi"
import { LOG_TYPE, USER_ROLES } from "../../utils/constants"
import moment from "moment"
import { findObjectKeyByValue } from "../../utils/main"
import { fetchUpdateStockProductAction, fetchUpdateStockRawMaterialAction } from "../../store/actions/setting.Action"


const LogTypeComponent = memo(({ params, setParams }) => {
  return (
    <Chip
      size="small"
      label={findObjectKeyByValue(params.logType, LOG_TYPE)}
    />
  );
});

const LeadListController = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const initialItemType = user?.data?.role === USER_ROLES.ACCOUNT ? 'product' : 'rawMaterial';
  const [itemType, setItemType] = useState(initialItemType);
  const { settings } = useSelector((state) => state)
  const title = "Producttt"
  const columns = useMemo(() => {
    if (itemType === 'rawMaterial') {
      return [
        {
          id: 1,
          fieldName: "date",
          label: "Date",
          align: "left",
          sort: true,
          renderValue: (params) => moment(params.date).format('DD/MM/YYYY')
        },
        {
          id: 7,
          fieldName: "rawMaterialId",
          label: "Raw Material Name",
          align: "left",
          sort: true,
          renderValue: (params) => params.rawMaterialId?.name
        },


        {
          id: 4,
          fieldName: "quantity",
          label: "Quantity",
          align: "left",

        },

        {
          id: 7,
          fieldName: "product_id",
          label: "Product Name",
          align: "left",

          renderValue: (params) => params.product_id?.product_name
        },
        {
          id: 3,
          fieldName: "product_code",
          label: "Product Code",
          align: "left",

          renderValue: (params, setParams) => params.product_id?.product_code
        },
        {
          id: 5,
          fieldName: "amount",
          label: "amount",
          align: "left",

        },
        {
          id: 6,
          fieldName: "departmentId",
          label: "Department",
          align: "left",

          renderValue: (params, setParams) => params.departmentId?.name
        },
        {
          id: 8,
          fieldName: "logType",
          label: "Stock",
          align: "left",
          renderValue: (params, setParams) => (
            <LogTypeComponent onlyview params={params} setParams={setParams} />
          ),
        }

      ];
    } else {

      return [
        {
          id: 1,
          fieldName: "date",
          label: "Date",
          align: "left",
          sort: true,
          renderValue: (params) => moment(params.date).format('DD/MM/YYYY')
        },
        {
          id: 7,
          fieldName: "product_id",
          label: "Product Name",
          align: "left",
          sort: true,

          renderValue: (params) => params.product_id?.product_name
        },
        {
          id: 3,
          fieldName: "product_code",
          label: "Product Code",
          align: "left",

          renderValue: (params, setParams) => params.product_id?.product_code
        },
        {
          id: 4,
          fieldName: "quantity",
          label: "Quantity",
          align: "left",

        },
        {
          id: 5,
          fieldName: "amount",
          label: "amount",
          align: "left",

        },
        {
          id: 6,
          fieldName: "departmentId",
          label: "Department",
          align: "left",

          renderValue: (params, setParams) => params.departmentId?.name
        },

        {
          id: 8,
          fieldName: "logType",
          label: "Stock",
          align: "left",
          renderValue: (params, setParams) => (
            <LogTypeComponent onlyview params={params} setParams={setParams} />
          ),
        }

      ];
    }
  }, [itemType, dispatch]);


    const [filters, setFilters] = useState({
        pageNo: 1,
        pageSize: 10,
        search: '',
        searchable:['rawMaterialId.name'],
        sort: '',
        sortDirection: -1,

  })


  const handleItemTypeChange = (newItemType) => {
    setItemType(newItemType);
    setFilters(prevFilters => ({
      ...prevFilters,
      pageNo: 1,
      searchable: newItemType === 'product' ? ['product_id.product_name'] : ['rawMaterialId.name'],
    }));
  };

  
    const getList = () => {
      if (itemType === 'rawMaterial') {
          if (!settings.update_stock_raw_material_data || settings.update_stock_raw_material_data.length === 0 || JSON.stringify(filters) !== JSON.stringify(settings.update_stock_raw_material_filters)) {
              dispatch(fetchUpdateStockRawMaterialAction(filters));
          }
      } else {
          if (!settings.update_stock_product_data || settings.update_stock_product_data.length === 0 || JSON.stringify(filters) !== JSON.stringify(settings.update_stock_product_filters)) {
              dispatch(fetchUpdateStockProductAction(filters));
          }
      }
  };

  useEffect(() => {
      getList();
  }, [filters, itemType]); 



  return (
    <>
      <LeadListUi
        title={title}
        filters={filters}
        setFilters={setFilters}
        loading={itemType === 'rawMaterial' ? settings.update_stock_raw_material_loading : settings.update_stock_product_loading}
        list={itemType === 'rawMaterial' ? settings.update_stock_raw_material_data : settings.update_stock_product_data}
        columns={columns}
        itemType={itemType}
        setItemType={handleItemTypeChange}
      />

    </>
  )
}
export default LeadListController;