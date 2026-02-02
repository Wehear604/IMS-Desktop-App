import { ShowChart } from "@mui/icons-material";
import SignInController from "./pages/signin/SignInController";
import { Navigate } from "react-router-dom";
import NotAllowedComponent from "../src/components/layouts/NotAllowedComponent";
import { getDefaultRedirect } from "./utils/routinghelper";
import AppContainer from "./components/layouts/common/AppContainer";
import MODULES from "./utils/module.constant";
import PagenotFound from "./components/layouts/PagenotFound";
import FactoryIcon from "@mui/icons-material/Factory";
import DeviceQcListController from "./pages/wehearDeviceQc/DeviceQcListController";
import DeviceQcDashboardController from "./pages/Device-qc/DeviceQcDashboardController";
const loggedInPathElementRender = (
  login,
  allowed = [],
  permittedModule = [],
  Component,
  defaultRedirect,
  hideInPannel = false,
) => {
  const obj = {
    hideInPannel,
    element: Component,
  };
  if (!login) {
    obj["element"] = <Navigate replace to={"/sign-in"} />;
  } else {
    let found = false;
    for (let module of allowed) {
      for (let allowedModule of permittedModule) {
        if (module == allowedModule) {
          found = true;
          break;
        }
      }
    }
    if (!found) {
      obj["hideInPannel"] = true;
      obj["element"] = <NotAllowedComponent />;
    }
  }
  return obj;
};

const defineRoutes = (user) => {
  const allowedModules =
    user.data?.ims_modules?.map((item) => item?.module) ?? [];
  const defaultRedirect = getDefaultRedirect(allowedModules);
  return [
    {
      path: "sign-in",
      element: !user.isLoggedIn ? (
        <SignInController />
      ) : (
        <Navigate replace to={defaultRedirect} />
      ),
      hideInPannel: true,
    },
    {
      path: "",
      element: user.isLoggedIn ? (
        <Navigate replace to={defaultRedirect} />
      ) : (
        <Navigate replace to="/sign-in" />
      ),
      hideInPannel: true,
    },

    {
      path: "qc",
      icon: <FactoryIcon />,
      title: "Device QC",
      ...loggedInPathElementRender(
        user.isLoggedIn,
        [MODULES.DEVICE_QC],
        allowedModules,
        <AppContainer>
          <DeviceQcListController />{" "}
        </AppContainer>,
        defaultRedirect,
      ),
    },

    {
      path: "device-qc-dashboard",
      icon: <ShowChart />,
      title: "Device Qc Dashboard",
      ...loggedInPathElementRender(
        user.isLoggedIn,
        [MODULES.DEVICE_QC_DASHBOARD],
        allowedModules,
        <AppContainer>
          <DeviceQcDashboardController />
        </AppContainer>,
        defaultRedirect,
      ),
    },

    {
      path: "*",
      hideInPannel: true,
      element: !user.isLoggedIn ? (
        <Navigate replace to={"/sign-in"} />
      ) : (
        <PagenotFound />
      ),
    },
  ];
};

export default defineRoutes;
