import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const CreateQcMacCheckApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.createLogsDeviceQc,
    method: "POST",
    headers: getHeaders(),

    data,
  })
    .then((response) => response.data)
    .catch((err) => err.response.data);

  return callResponse;
};

export const fetchQcMacCheckByIdApi = async (params) => {
  const callResponse = await axios({
    url: endpoints.getLogsDeviceQc,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then((response) => response.data)
    .catch((err) => ({
      status: 0,
      response: err.response,
      code: err.response.status,
    }));

  return callResponse;
};
