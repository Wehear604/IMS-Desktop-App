export const mode = "development";
let domain = "";

switch (mode) {
  case "ip":
    domain = "http://192.168.29.247:8000/";
    break;
  case "local":
    domain = "http://localhost:8000/";
    break;
  case "development":
    domain = "https://imsdevelopment.wehear.in/";
    break;
  case "production1":
    domain = "https://serverims.wehear.in/";
    break;
  default:
    domain = "http://localhost:8000/";
}

export default {
  root: domain,
  signIn: `${domain}api/v1/auth/login`,
  resetToken: `${domain}api/v1/auth/resetToken`,
  resetPass: `${domain}api/v1/auth/reset-pass`,
  userAndSystemFetchByToken: `${domain}api/v1/user/fetch-by-token`,
  ModulesPermission: `${domain}api/v1/user/change-module-permission`,

  vendorcreate: `${domain}api/v1/vendor/`,
  vendorfetch: `${domain}api/v1/vendor/fetch`,
  fetchvendorRawMaterialWise: `${domain}api/v1/vendor/fetch-vendor`,
  vendordelete: `${domain}api/v1/vendor/delete`,
  vendorupdate: `${domain}api/v1/vendor/update`,
  VendorFetchById: `${domain}api/v1/vendor/by-id`,

  DepartmentCreate: `${domain}api/v1/department/`,
  DepartmentFetch: `${domain}api/v1/department/fetch`,
  DepartmentDelete: `${domain}api/v1/department/delete`,
  DepartmentUpdate: `${domain}api/v1/department/update`,
  DepartmentFetchById: `${domain}api/v1/department/by-id`,

  UserCreateApi: `${domain}api/v1/user/create`,
  UserFetchByIdApi: `${domain}api/v1/user/fetch-by-id`,
  UserUpdateApi: `${domain}api/v1/user/update`,
  UserFetchApi: `${domain}api/v1/user/fetch`,
  UserDelete: `${domain}api/v1/user/delete`,
  UserSearch: `${domain}api/v1/user/search`,
  UserResetPassword: `${domain}api/v1/user/reset-password`,
  UserUndoDelete: `${domain}api/v1/user/undo-delete`,

  RawMaterialCreate: `${domain}api/v1/rawMaterial/create`,
  RawMaterialFetch: `${domain}api/v1/rawMaterial/fetch`,
  RawMaterialById: `${domain}api/v1/rawMaterial/by-id`,
  RawMaterialDelete: `${domain}api/v1/rawMaterial/delete`,
  RawMaterialUpdate: `${domain}api/v1/rawMaterial/update`,
  RawMaterialSearch: `${domain}api/v1/rawMaterial/search`,

  ProductCreate: `${domain}api/v1/product/create`,
  ProductFetch: `${domain}api/v1/product/fetch`,
  ProductDelete: `${domain}api/v1/product/delete`,
  ProductUpdate: `${domain}api/v1/product/update`,
  ProductFetchById: `${domain}api/v1/product/by-id`,
  FetchProductStockById: `${domain}api/v1/production-planning/stock-byid`,

  AddInOutProductStock: `${domain}api/v1/product/stock`,
  AddInOutRawMaterialStock: `${domain}api/v1/rawMaterial/in-out`,
  fetchCurrentStockByProductId: `${domain}api/v1/product/current-stock`,
  fetchCurrentStockByRawMaterialId: `${domain}api/v1/rawMaterial/current-stock`,

  TypeofSalesCreate: `${domain}api/v1/typeOfSale/`,
  TypeofSalesFetch: `${domain}api/v1/typeOfSale/fetch`,
  TypeofSalesDelete: `${domain}api/v1/typeOfSale/delete`,
  TypeofSalesUpdate: `${domain}api/v1/typeOfSale/update`,
  TypeofSalesFetchById: `${domain}api/v1/typeOfSale/by-id`,

  fileImage: `${domain}api/v1/file/image`,
  fileFile: `${domain}api/v1/file/file`,
  fileBase: `${domain}api/v1/file/`,

  CategoryCreate: `${domain}api/v1/category/`,
  CategoryFetch: `${domain}api/v1/category/fetch`,
  CategoryFetchById: `${domain}api/v1/category/by-id`,
  CategoryDelete: `${domain}api/v1/category/delete`,
  CategoryUpdate: `${domain}api/v1/category/update`,

  productBrandCreate: `${domain}api/v1/brand/`,
  productBrandFetch: `${domain}api/v1/brand/fetch`,
  productBrandFetchById: `${domain}api/v1/brand/by-id`,
  productBrandDelete: `${domain}api/v1/brand/delete`,
  productBrandUpdate: `${domain}api/v1/brand/update`,

  colorCreate: `${domain}api/v1/color/`,
  colorFetch: `${domain}api/v1/color/fetch`,
  colorFetchById: `${domain}api/v1/color/by-id`,
  colorDelete: `${domain}api/v1/color/delete`,
  colorUpdate: `${domain}api/v1/color/update`,

  productTypeCreate: `${domain}api/v1/type/`,
  productTypeFetch: `${domain}api/v1/type/fetch`,
  productTypeFetchById: `${domain}api/v1/type/by-id`,
  productTypeDelete: `${domain}api/v1/type/delete`,
  productTypeUpdate: `${domain}api/v1/type/update`,

  QualityCheckCreate: `${domain}api/v1/qc/create`,
  QualityCheckFetch: `${domain}api/v1/qc/fetch`,
  QualityCheckFetchQc: `${domain}api/v1/qc/fetch-qc`,
  QualityCheckUpdateCheckList: `${domain}api/v1/qc/update-checklist`,
  QualityCheckFetchBySerialNoCheckList: `${domain}api/v1/qc/by-serial-no`,

  ComponentCreate: `${domain}api/v1/component/create`,
  ComponentFetch: `${domain}api/v1/component/fetch`,
  ComponentDelete: `${domain}api/v1/component/delete`,
  ComponentUpdate: `${domain}api/v1/component/update`,
  ComponentFetchById: `${domain}api/v1/component/by-id`,

  itemTypeCreate: `${domain}api/v1/itemType/create`,
  itemTypeFetch: `${domain}api/v1/itemType/fetch`,
  itemTypeDelete: `${domain}api/v1/itemType/delete`,
  itemTypeUpdate: `${domain}api/v1/itemType/update`,
  itemTypeFetchById: `${domain}api/v1/itemType/by-id`,

  RejectionReasonCreate: `${domain}api/v1/rejectionReason/create`,
  RejectionReasonFetch: `${domain}api/v1/rejectionReason/fetch`,
  RejectionReasonDelete: `${domain}api/v1/rejectionReason/delete`,
  RejectionReasonUpdate: `${domain}api/v1/rejectionReason/update`,
  RejectionReasonFetchById: `${domain}api/v1/rejectionReason/by-id`,

  itemCreate: `${domain}api/v1/Item/create`,
  itemFetch: `${domain}api/v1/Item/fetch`,
  itemDelete: `${domain}api/v1/Item/delete`,
  itemUpdate: `${domain}api/v1/Item/update`,
  itemFetchById: `${domain}api/v1/Item/by-id`,
  itemHistoryFetchById: `${domain}api/itemhistory/by-id`,
  itemHistoryUpdate: `${domain}api/itemhistory/update`,
  itemHistoryCreate: `${domain}api/itemhistory/create`,

  SKDCreate: `${domain}api/v1/SKD/create`,
  SKDFetch: `${domain}api/v1/SKD/fetch`,
  SKDDelete: `${domain}api/v1/SKD/delete`,
  SKDUpdate: `${domain}api/v1/SKD/update`,
  SKDFetchById: `${domain}api/v1/SKD/by-id`,

  SFGCreate: `${domain}api/v1/SFG/create`,
  SFGFetch: `${domain}api/v1/SFG/fetch`,
  SFGDelete: `${domain}api/v1/SFG/delete`,
  SFGUpdate: `${domain}api/v1/SFG/update`,
  SFGFetchById: `${domain}api/v1/SFG/by-id`,

  FGCreate: `${domain}api/v1/FG/create`,
  FGFetch: `${domain}api/v1/FG/fetch`,
  FGDelete: `${domain}api/v1/FG/delete`,
  FGUpdate: `${domain}api/v1/FG/update`,
  FGFetchById: `${domain}api/v1/FG/by-id`,
  FGFetchItemCodeById: `${domain}api/v1/FG/fetch-by-id`,

  createInventoryLogs: `${domain}api/v1/inventoryLogs/create-material`,
  RejectedQuantity: `${domain}api/v1/inventoryLogs/inventory-rejected`,
  fetchStockInOut: `${domain}api/v1/inventoryLogs/fetch`,
  generateQr: `${domain}api/v1/inventoryLogs/Generate-QR`,
  FetchQrById: `${domain}api/v1/inventoryLogs/fetch-by-id`,
  fetchInventoryLogs: `${domain}api/v1/inventoryLogs/fetch-inventory`,
  UpadteInventoryIQC: `${domain}api/v1/inventoryLogs/update-material`,
  FetchQrIQC: `${domain}api/v1/inventoryLogs/fetch-qr-history`,
  updateStockLogs: `${domain}api/v1/inventoryLogs/create`,
  fetchQrDetails: `${domain}api/v1/inventoryLogs/fetch-generated-qr-history`,
  downloadQrImage: `${domain}api/v1/inventoryLogs/download-qr`,
  generateInventoryLogQr: `${domain}api/v1/inventoryLogs/generate-qr-inventory-logs`,
  fetchInventoryLogById: `${domain}api/v1/inventoryLogs/fetch-by-id`,
  fetchInventoryOutLogs: `${domain}api/v1/inventoryLogs//fetch-out-inventory`,

  getMacAddress: `https://serverlkims.wehear.in/api/qr/fetch`,
  getQcResult: `https://serverlkims.wehear.in/api/rxtx/fetch-rxtx`,
  downloadRxtxCsv: `https://serverlkims.wehear.in/api/rxtx/download`,

  createInventoryMaster: `${domain}api/v1/inventoryMaster/create`,
  fetchInventoryMaster: `${domain}api/v1/inventoryMaster/fetch`,
  fetchInventoryMasterById: `${domain}api/v1/inventoryMaster/fetch-by-id`,
  updateInventoryMaster: `${domain}api/v1/inventoryMaster/update`,
  deleteInventoryMaster: `${domain}api/v1/inventoryMaster/delete`,

  qcTestCase: `${domain}api/qc-test-case/`,
  qcTestCaseById: `${domain}api/qc-test-case/by-id`,

  qcDashboard: `${domain}api/qc-test`,
  qcDashboardById: `${domain}api/qc-test/by-id`,

  SpecialMarkingCreate: `${domain}api/v1/special-markings/create`,
  SpecialMarkingUpdate: `${domain}api/v1/special-markings/update`,
  SpecialMarkingDelete: `${domain}api/v1/special-markings/delete`,
  SpecialMarkingFetchById: `${domain}api/v1/special-markings/by-id`,
  SpecialMarkingFetch: `${domain}api/v1/special-markings/fetch`,

  fetchRawMaterialCount: `${domain}api/v1/dashboard/raw-materials`,
  fetchDashboardMateriallogs: `${domain}api/v1/dashboard/material-logs`,
  fetchFgCount: `${domain}api/v1/dashboard/fg`,
  fetchSkdCount: `${domain}api/v1/dashboard/skd`,
  fetchSfgCount: `${domain}api/v1/dashboard/sfg`,

  ProductionPlanningCreate: `${domain}api/v1/production-planning/create`,
  ProductionPlanningFetch: `${domain}api/v1/production-planning/fetch`,
  ProductionPlanningDelete: `${domain}api/v1/production-planning/delete`,
  ProductionPlanningFindById: `${domain}api/v1/production-planning/by-id`,

  CreatePurchaseRequest: `${domain}api/v1/materialRequest/`,
  FetchPurchaseRequest: `${domain}api/v1/materialRequest/`,
  UpdatePurchaseRequest: `${domain}api/v1/materialRequest/`,
  FetchPurchaseRequestById: `${domain}api/v1/materialRequest/by-id`,

  qrinfo: `${domain}api/v1/qr-info/fetch`,
  locationInfo: `${domain}api/v1/qr-info/location-info`,

  fetchHrmsUsers: `https://azurehrms.wehear.in/api/ims/fetch-user-public-details`,
  fetchHrmsProjects: `https://azurehrms.wehear.in/api/ims/fetch`,
  versions: `${domain}api/version`,
  latestVersions: `${domain}api/version/latest`,

  locationMasterCreate: `${domain}api/locationMaster/create`,
  locationMasterFetch: `${domain}api/locationMaster/fetch`,
  locationMasterDelete: `${domain}api/locationMaster/delete`,
  locationMasterUpdate: `${domain}api/locationMaster/update`,
  locationMasterFetchById: `${domain}api/locationMaster/by-id`,

  purchaseRequestCreate: `${domain}api/v1/purchaseRequest/`,

  createDeviceQc: `${domain}api/qc-device/create`,
  fetchDeviceQc: `${domain}api/qc-device/fetch`,
  fetchByIdDeviceQc: `${domain}api/qc-device/fetch-by-id`,
  fetchDeviceCounts: `${domain}api/qc-device/fetch-count-device-wise`,

  createDeviceQc: `${domain}api/qc-device/create`,
  fetchDeviceQc: `${domain}api/qc-device/fetch`,
  fetchByIdDeviceQc: `${domain}api/qc-device/fetch-by-id`,
  fetchDeviceCounts: `${domain}api/qc-device/fetch-count-device-wise`,
  updateDeviceQc: `${domain}api/qc-device/update`,

  createLogsDeviceQc: `${domain}api/qc-device/create-logs`,
  getLogsDeviceQc: `${domain}api/qc-device/get-log`,
};
