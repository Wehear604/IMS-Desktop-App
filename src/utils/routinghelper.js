import { USER_ROLES } from "./constants";
import MODULES from "./module.constant";

export const getDefaultRedirect = (ims_modules) => {
  // if (
  //   ims_modules &&
  //   Array.isArray(ims_modules) &&
  //   ims_modules.includes(MODULES.BOM)
  // ) {
  //   return "/bom";
  // }
  // if (
  //   ims_modules &&
  //   Array.isArray(ims_modules) &&
  //   ims_modules.includes(MODULES.QC_DASHBOARD)
  // ) {
  //   return "/qc-dashboard";
  // }
  return "/qc";
};
