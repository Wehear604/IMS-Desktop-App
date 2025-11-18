import axios from "axios";
import endpoints from "./endpoints";
import { getHeaders } from "../utils/main";

export const fetchQcResultApi = async (params) => {
  const callResponse = await axios({
    url: endpoints.getQcResult,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then((response) => response.data)
    .catch((err) => err.response.data);

  return callResponse;
};

export const downloadRxtxCsv = async (params) => {
  const callResponse = await axios({
    url: endpoints.downloadRxtxCsv,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then((response) => response.data)
    .catch((err) => err.response.data);

  return callResponse;
};
