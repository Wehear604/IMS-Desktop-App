import axios from "axios";
import { getHeaders, getHeadersSecret } from "../utils/main";
import endpoints from "./endpoints";


export const FetchItemApi = async (params) => {
  const callResponse = await axios({
    url: endpoints.itemFetch,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then((response) => response.data)
    .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

  return callResponse;
};

export const CreateItemApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.itemCreate,
    method: "post",
    headers: getHeaders(),
    data,
  })
    .then((response) => response.data)
    .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

  return callResponse;
};

export const CreateItemHistoryApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.itemHistoryCreate,
    method: "post",
    headers: getHeaders(),
    data,
  })
    .then((response) => response.data)
    .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

  return callResponse;
};

export const deleteItemApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.itemDelete,
    method: "delete",
    headers: getHeaders(),
    data,
  })
    .then((response) => response.data)
    .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

  return callResponse;
};

export const UpdateItemApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.itemUpdate,
    method: "patch",
    headers: getHeaders(),
    data,
  })
    .then((response) => response.data)
    .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

  return callResponse;
};

export const UpdateItemHistoryApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.itemHistoryUpdate,
    method: "patch",
    headers: getHeaders(),
    data,
  })
    .then((response) => response.data)
    .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

  return callResponse;
};

export const getItemByIdApi = async params => {
  const callResponse = await axios({
    url: endpoints.itemFetchById,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const getItemHistoryByIdApi = async params => {
  const callResponse = await axios({
    url: endpoints.itemHistoryFetchById,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const fetchHrmsUsers = async (params) => {
  const callResponse = await axios({
    url: endpoints.fetchHrmsUsers,
    method: "get",
    headers: getHeadersSecret(),
    params,
  })
    .then((response) => response.data)
    .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

  return callResponse;
};

export const fetchHrmsProjects = async (params) => {
  const callResponse = await axios({
    url: endpoints.fetchHrmsProjects,
    method: "get",
    headers: getHeadersSecret(),
    params,
  })
    .then((response) => response.data)
    .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

  return callResponse;
};