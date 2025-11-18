import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { memo } from "react";
import CustomDialog from "../../components/layouts/common/CustomDialog";
import { CenteredBox } from "../../components/layouts/OneViewBox";
import MODULES, { MODULE_ACTION_MAP, MODULES_ACTION } from "../../utils/module.constant";
import { titleCase } from "../../utils/main";

const ModulePermissionUI = ({
  title,
  fields,
  setFields,
  loading,
  onSubmit,
  modalKey,
}) => {
  const isModuleChecked = (modKey) => {
    const modId = MODULES[modKey];
    return fields.ims_modules?.some((entry) => entry.module === modId);
  };

  const isActionChecked = (modKey, actionId) => {
    const modId = MODULES[modKey];
    return fields.ims_modules?.some(
      (entry) => entry.module === modId && Array.isArray(entry.actions) && entry.actions.includes(actionId)
    );
  };

  const addModule = (modId) => {
    const updated = [...fields.ims_modules];
    if (!updated?.some((entry) => entry.module === modId)) {
      updated.push({ module: modId, actions: [] });
    }
    setFields({ ...fields, ims_modules: updated });
  };

  const removeModule = (modId) => {
    const updated = fields.ims_modules.filter((entry) => entry.module !== modId);
    setFields({ ...fields, ims_modules: updated });
  };

  const addModuleAction = (modId, actionId) => {
    const updated = fields.ims_modules.map((entry) => {
      if (entry.module === modId) {
        const newActions = Array.isArray(entry.actions) ? [...entry.actions] : [];
        if (!newActions.includes(actionId)) newActions.push(actionId);
        return { ...entry, actions: newActions };
      }
      return entry;
    });
    setFields({ ...fields, ims_modules: updated });
  };

  const removeModuleAction = (modId, actionId) => {
    const updated = fields.ims_modules.map((entry) => {
      if (entry.module === modId) {
        const newActions = Array.isArray(entry.actions)
          ? entry.actions.filter((act) => act !== actionId)
          : [];
        return { ...entry, actions: newActions };
      }
      return entry;
    });
    setFields({ ...fields, ims_modules: updated });
  };

  return (
    <CustomDialog
      id={modalKey}
      loading={loading}
      err={fields.err}
      onSubmit={onSubmit}
      title={`Change ${title} permissions`}
      closeText="Close"
      confirmText="Change permissions"
    >
      {loading ? (
        <CenteredBox>
          <CircularProgress />
        </CenteredBox>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {Object.entries(MODULES).map(([modKey, modId]) => (
            <Accordion key={modKey} sx={{ width: "100%" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${modKey}-content`}
                id={`${modKey}-header`}
              >
                <Box
                  width="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6">{titleCase(modKey)}</Typography>
                  <Checkbox
                    onClick={(e) => {
                      e.stopPropagation();
                      isModuleChecked(modKey)
                        ? removeModule(modId)
                        : addModule(modId);
                    }}
                    checked={isModuleChecked(modKey)}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {(!MODULE_ACTION_MAP[modKey] || MODULE_ACTION_MAP[modKey].length === 0) ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No actions available for this module.
                  </Typography>
                ) : (
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={2}
                    justifyContent="space-evenly"
                  >
                    {Object.entries(MODULES_ACTION).map(([actionKey, actionId]) => {
                      if (!MODULE_ACTION_MAP[modKey]?.includes(actionId)) return null;

                      return (
                        <Box
                          key={actionKey}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          width="30%"
                          px={2}
                          py={1}
                          border="1px solid #e0e0e0"
                          borderRadius={2}
                          bgcolor="#f9f9f9"
                        >
                          <Typography variant="body2" color="text.secondary">
                            {titleCase(actionKey)}
                          </Typography>
                          <Checkbox
                            size="small"
                            disabled={!isModuleChecked(modKey)}
                            onClick={(e) => {
                              e.stopPropagation();
                              isActionChecked(modKey, actionId)
                                ? removeModuleAction(modId, actionId)
                                : addModuleAction(modId, actionId);
                            }}
                            checked={isActionChecked(modKey, actionId)}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </AccordionDetails>


            </Accordion>
          ))}
        </Box>
      )}
    </CustomDialog>
  );
};

export default memo(ModulePermissionUI);
