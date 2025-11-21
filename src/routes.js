import { DashboardCustomize, Grading, Groups2Outlined, PlaylistAddCheckCircle, Settings, ShowChart } from "@mui/icons-material"
import SignInController from './pages/signin/SignInController'
import { Navigate } from 'react-router-dom'
import NotAllowedComponent from '../src/components/layouts/NotAllowedComponent'
import { getDefaultRedirect } from './utils/routinghelper'
import AppContainer from './components/layouts/common/AppContainer'
import MODULES from './utils/module.constant'
import PagenotFound from './components/layouts/PagenotFound'
import DepartmentController from './pages/department/DepartmentController'
import ApartmentIcon from '@mui/icons-material/Apartment';
import VendorListController from './pages/vendor/VendorListController'
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ListController from './pages/user/UserLIstController';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TypeOfSalesMainController from './pages/type_of_sales/TypeOfSalesMainController'
import ProductionListController from './pages/Production/ProductionListController'
import CategoryTypeMainController from './pages/categories/CategoryTypeMainController'
import CategoryIcon from '@mui/icons-material/Category';
import ProductBrandController from './pages/productbrand/ProductBrandController'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ProductColorController from './pages/productcolor/ProductColorController'
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ProductTypeController from './pages/producttype/ProductTypeController'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ComponentListController from './pages/component/ComponentListController'
import ItemTypeListController from './pages/itemType/itemTypeListController'
import ItemListController from './pages/item/ItemListController'
import InventoryMasterListController from './pages/InventoryMaster/InventoryMasterListController'
import InventoryLogsListController from './pages/inventoryLogs/InventoryLogsListController'
import BomUI from './pages/Bom/BomUI'
import FactoryIcon from '@mui/icons-material/Factory';
import StockInOutListController from './pages/stockInOut/StockInOutListController'
import RejectionReasonListController from './pages/RejectionReason/RejectionReasonListController'
import MacAddressLIstController from './pages/MacAddress/MacAddressListController'
import QcListController from './pages/Qc-Result/QcListController'
import PodcastsIcon from '@mui/icons-material/Podcasts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GridViewIcon from '@mui/icons-material/GridView';
import ClassIcon from '@mui/icons-material/Class';
import DangerousIcon from '@mui/icons-material/Dangerous';
import InventoryIcon from '@mui/icons-material/Inventory';
import QcTestCaseListController from './pages/QcTestCase/QcTestCaseListController'
import QcDashboardListController from './pages/QcDashboard/QcDashboardListController'
import { LOG_TYPE, USER_ROLES } from './utils/constants'
import SpecialMarkingListController from './pages/SpecialMarking/SpecialMarkingListController'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import DashboardListController from './pages/dashboard/DashboardListController'
import PurchaseRequestListController from './pages/purchaseRequest/PurchaseRequestListController';
// import VersionsController from './pages/versions/VersionsController';
import LocationMasterListController from "./pages/LocationMaster/LocationMasterListController"
import DeviceQcListController from "./pages/wehearDeviceQc/DeviceQcListController"
import ListControllerPurchaseRequest from "./pages/purchaseRequestNew/ListControllerPurchaseRequest"
// import locationMasterListController from "./pages/LocationMaster/locationMasterListController";

const loggedInPathElementRender = (login, allowed = [], permittedModule = [], Component, defaultRedirect, hideInPannel = false) => {

  const obj = {
    hideInPannel,
    element: Component,
  }
  if (!login) {
    obj['element'] = <Navigate replace to={'/sign-in'} />
  } else {

    let found = false
    for (let module of allowed) {
      for (let allowedModule of permittedModule) {
        if (module == allowedModule) {
          found = true
          break;
        }
      }
    }
    if (!found) {
      obj['hideInPannel'] = true
      obj['element'] = <NotAllowedComponent />
    }

  }
  return obj
}


const defineRoutes = (user) => {
  const allowedModules = user.data?.ims_modules?.map((item) => item?.module) ?? []
  const defaultRedirect = getDefaultRedirect(allowedModules)
  return ([
    {
      path: "sign-in",
      element: !user.isLoggedIn ? <SignInController /> : <Navigate replace to={defaultRedirect} />,
      hideInPannel: true
    },
    {
      path: "",
      element: user.isLoggedIn ? <Navigate replace to={defaultRedirect} /> : <Navigate replace to="/sign-in" />,
      hideInPannel: true
    },
    {
      path: "dashboard",
      icon: <DashboardCustomize />,
      title: "Dashboard",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.DASHBOARD], allowedModules, <AppContainer ><DashboardListController /></AppContainer>, defaultRedirect),
    },
    {
      path: "bom",
      icon: <Inventory2Icon />,
      title: "BOM",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.BOM], allowedModules, <AppContainer ><BomUI /></AppContainer>, defaultRedirect),
    },
    {
      path: "GRN",
      icon: <FactoryIcon />,
      title: "GRN",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.GRN], allowedModules, <AppContainer ><InventoryLogsListController /> </AppContainer>, defaultRedirect),
    },

    {
      path: "purchase-request",
      icon: <FactoryIcon />,
      title: "Purchase Request",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.PURCHASE_REQUEST], allowedModules, <AppContainer ><ListControllerPurchaseRequest /> </AppContainer>, defaultRedirect),
    },

    {
      path: "device-qc",
      icon: <FactoryIcon />,
      title: "Device QC",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.DEVICE_QC], allowedModules, <AppContainer ><DeviceQcListController /> </AppContainer>, defaultRedirect),
    },

    {
      path: "stock",
      icon: <ImportExportIcon />,
      title: "Stock In/Out",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.STOCK_IN, MODULES.STOCK_OUT], allowedModules, <AppContainer />, defaultRedirect),
      children: [{
        path: "in",
        icon: ExpandLessIcon,
        title: "In",
        ...loggedInPathElementRender(user.isLoggedIn, [MODULES.STOCK_IN], allowedModules, <StockInOutListController Type={LOG_TYPE.In} />, defaultRedirect),
      },
      {
        path: "out",
        icon: ExpandMoreIcon,
        title: "Out",
        ...loggedInPathElementRender(user.isLoggedIn, [MODULES.STOCK_OUT], allowedModules, <StockInOutListController Type={LOG_TYPE.Out} />, defaultRedirect),
      }]
    },
    {
      path: "material-request",
      icon: <ShoppingCartIcon />,
      title: "Material Request",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.MATERIAL_REQUEST], allowedModules, <AppContainer ><PurchaseRequestListController /></AppContainer>, defaultRedirect),
    },
    {
      path: "production",
      icon: <PrecisionManufacturingIcon />,
      title: "Production Planning",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.PRODUCTIONPLANNING], allowedModules, <AppContainer ><ProductionListController /></AppContainer>, defaultRedirect),

    },
    {
      path: "vendor",
      icon: <PersonSearchIcon />,
      title: "Vendor",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.VENDOR], allowedModules, <AppContainer ><VendorListController /></AppContainer>, defaultRedirect),
      // hideInPannel: user.data.role === USER_ROLES.ADMIN || user.data.role === USER_ROLES.PURCHASE ? false : true,
    },
    {
      path: "mac-address",
      icon: <PodcastsIcon />,
      title: "Mac Address",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.MAC_ADDRESS], allowedModules, <AppContainer ><MacAddressLIstController /></AppContainer>, defaultRedirect),
      // hideInPannel: user.data.role === USER_ROLES.ADMIN || user.data.role === USER_ROLES.PURCHASE ? false : true,
    },
    {
      path: "qc",
      icon: <AssessmentIcon />,
      title: "Qc Result",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.QC_RESULT], allowedModules, <AppContainer ><QcListController /></AppContainer>, defaultRedirect),
      // hideInPannel: user.data.role === USER_ROLES.ADMIN || user.data.role === USER_ROLES.PURCHASE ? false : true,
    },

    {
      path: "qc-dashboard",
      icon: <Grading />,
      title: "Qc Dashboard",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.QC_DASHBOARD], allowedModules, <AppContainer ><QcDashboardListController /></AppContainer>, defaultRedirect),
      // hideInPannel: user.data.role !== USER_ROLES.ADMIN,
    },
    {
      path: "asset",
      icon: <DisplaySettingsIcon />,
      title: "Company Asset",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.ASSET], allowedModules, <AppContainer ><ItemListController /></AppContainer>, defaultRedirect),
    },
    {
      path: "users",
      icon: <Groups2Outlined />,
      title: "Users",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.USER], allowedModules, <AppContainer ><ListController /></AppContainer>, defaultRedirect),
      // hideInPannel: user.data.role === USER_ROLES.ADMIN ? false : true,
    },
    {
      path: "settings",
      icon: <Settings />,
      title: "Settings",
      ...loggedInPathElementRender(user.isLoggedIn, [MODULES.QC_TEST_CASE, MODULES.DEPARTMENT, MODULES.TYPEOFSALES, MODULES.CATEGORY, MODULES.BRAND, MODULES.PRODUCTTYPE, MODULES.COLOR, MODULES.COMPONENT, MODULES.ITEMTYPE, MODULES.REJECTION_REASON, MODULES.INVENTORY_MASTER, MODULES.SPECIAL_MARKING], allowedModules, <AppContainer />, defaultRedirect),
      // hideInPannel: user.data.role === USER_ROLES.ADMIN ? false : true,
      children: [
        {
          path: "qc-test-case",
          icon: PlaylistAddCheckCircle,
          title: "Qc Test Case",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.QC_TEST_CASE], allowedModules, <QcTestCaseListController />, defaultRedirect),
        },
        {
          path: "department",
          icon: ApartmentIcon,
          title: "Department",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.DEPARTMENT], allowedModules, <DepartmentController />, defaultRedirect),
        },
        {
          path: "type_of_sales",
          icon: ChecklistIcon,
          title: "Type Of Sales",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.TYPEOFSALES], allowedModules, <TypeOfSalesMainController />, defaultRedirect),
        },
        {
          path: "category_type",
          icon: CategoryIcon,
          title: "Category",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.CATEGORY], allowedModules, <CategoryTypeMainController />, defaultRedirect),

        },
        {
          path: "product-brand",
          icon: ShoppingCartIcon,
          title: "Product Brand",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.BRAND], allowedModules, <ProductBrandController />, defaultRedirect),
        },

        {
          path: "product-type",
          icon: FormatListBulletedIcon,
          title: "Type",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.PRODUCTTYPE], allowedModules, <ProductTypeController />, defaultRedirect),
        },

        {
          path: "product-color",
          icon: ColorLensIcon,
          title: "Product Color",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.COLOR], allowedModules, <ProductColorController />, defaultRedirect),
        },
        {
          path: "component",
          icon: GridViewIcon,
          title: "Component",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.COMPONENT], allowedModules, <ComponentListController />, defaultRedirect),
        },
        {
          path: "item-type",
          icon: ClassIcon,
          title: "Item Type",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.ITEMTYPE], allowedModules, <ItemTypeListController />, defaultRedirect),
        },
        // {
        //   path: "location-master",
        //   icon: ClassIcon,
        //   title: "Location Master",
        //   ...loggedInPathElementRender(user.isLoggedIn, [MODULES.LOCATION_MASTER], allowedModules, <locationMasterListController />, defaultRedirect),
        // },
        {
          path: "rejection-reason",
          icon: DangerousIcon,
          title: "Rejection Reasons",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.REJECTION_REASON], allowedModules, <RejectionReasonListController />, defaultRedirect),
        },
        {
          path: "inventory-master",
          icon: InventoryIcon,
          title: "Inventory Master",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.INVENTORY_MASTER], allowedModules, <InventoryMasterListController />, defaultRedirect),
        },
        {
          path: "Special-Marking",
          icon: PlaylistAddIcon,
          title: "Special Marking",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.SPECIAL_MARKING], allowedModules, <SpecialMarkingListController />, defaultRedirect),
        },
        {
          path: "location",
          icon: PlaylistAddIcon,
          title: "Location Master",
          ...loggedInPathElementRender(user.isLoggedIn, [MODULES.LOCATION_MASTER], allowedModules, <LocationMasterListController />, defaultRedirect),
        },
        // {
        //   path: "version",
        //   icon: SystemUpdateAltIcon,
        //   title: "version",
        //   ...loggedInPathElementRender(user.isLoggedIn, [MODULES.VERSIONS], allowedModules, <VersionsController />, defaultRedirect),
        // },
      ]
    },
    {
      path: "*",
      hideInPannel: true,
      element: !user.isLoggedIn ? <Navigate replace to={"/sign-in"} /> : <PagenotFound />,
    }
  ])

}

export default defineRoutes



// {
//   path: "quality-check",
//   icon: <AssignmentTurnedInIcon />,
//   title: "Quality Check",
//   ...loggedInPathElementRender(user.isLoggedIn, [MODULES.QUALITY_CHECK], allowedModules, <AppContainer ></AppContainer>, defaultRedirect),
//   children: [
//     {
//       path: "",
//       icon: RuleIcon,
//       title: "Product Batch",
//       ...loggedInPathElementRender(user.isLoggedIn, [MODULES.QUALITY_CHECK], allowedModules, <QualityCheckListController />, defaultRedirect),
//       hideInPannel: false,
//     },
//     {
//       path: "batch-list/:product_id/:batch_no",
//       ...loggedInPathElementRender(user.isLoggedIn, [MODULES.BATCHLIST], allowedModules, <BatchListController />, defaultRedirect),
//       hideInPannel: true,
//     },
//     {
//       path: "batch-list/:product_id/:batch_no/:serial_no",
//       ...loggedInPathElementRender(user.isLoggedIn, [MODULES.PRODUCTQC], allowedModules, <StepperListController />, defaultRedirect),
//       hideInPannel: true,
//     },

//   ]
// },