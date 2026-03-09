import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const fetchDeviceApi = async (params) => {
  const callResponse = await axios({
    url: endpoints.fetchDeviceQc,
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

export const fetchDeviceCountsApi = async (params) => {
  const callResponse = await axios({
    url: endpoints.fetchDeviceCounts,
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

export const createDeviceQcApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.createDeviceQc,
    method: "post",
    headers: getHeaders(),
    data,
  })
    .then((response) => response.data)
    .catch((err) => ({
      status: 0,
      response: err.response,
      code: err.response.status,
    }));

  return callResponse;
};

export const getDeviceByIdApi = async (params) => {
  const callResponse = await axios({
    url: endpoints.fetchByIdDeviceQc,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then((response) => response.data)
    .catch((err) => err.response.data);

  return callResponse;
};

export const updateDeviceQcApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.updateDeviceQc,
    method: "patch",
    headers: getHeaders(),
    data,
  })
    .then((response) => response.data)
    .catch((err) => ({
      status: 0,
      response: err.response,
      code: err.response.status,
    }));

  return callResponse;
};
