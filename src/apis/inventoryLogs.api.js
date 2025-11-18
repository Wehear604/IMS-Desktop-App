import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const CreateInventoryLogsApi = async data => {
  const callResponse = await axios({
    url: endpoints.createInventoryLogs,
    method: "POST",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};

export const UpdateRejectedQuantityApi = async data => {
  const callResponse = await axios({
    url: endpoints.RejectedQuantity,
    method: "Patch",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};

export const UpadteInventoryIQCApi = async data => {
  const callResponse = await axios({
    url: endpoints.UpadteInventoryIQC,
    method: "patch",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};

export const fetchStockInOutApi = async params => {
  const callResponse = await axios({
    url: endpoints.fetchStockInOut,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};

export const FetchQrByIdApi = async params => {
  const callResponse = await axios({
    url: endpoints.FetchQrById,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};

export const FetchQrApi = async params => {
  const callResponse = await axios({
    url: endpoints.FetchQrIQC,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};

export const GenerateQrCodeApi = async data => {
  const callResponse = await axios({
    url: endpoints.generateQr,
    method: "POST",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};


export const fetchInventoryLogsApi = async params => {
  const callResponse = await axios({
    url: endpoints.fetchInventoryLogs,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};

export const FetchQrDetailsApi = async params => {
  const callResponse = await axios({
    url: endpoints.fetchQrDetails,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};

export const downloadQrImageApi = async (params) => {
  const callResponse = await axios({
    url: endpoints.downloadQrImage,
    method: "GET",
    headers: getHeaders(),
    params,
    responseType: 'blob', 
  })
    
    .then(response => response)
    .catch(err => err.response);
  return callResponse;
};

export const FetchInventoryQrByIdApi = async params => {
  const callResponse = await axios({
    url: endpoints.fetchInventoryLogById,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};
export const GenerateInventoryQrCodeApi = async (params) => {
  const callResponse = await axios({
    url: endpoints.downloadQrImage,
    method: "GET",
    headers: getHeaders(),
    params,
    responseType: 'blob', 
  })
    
    .then(response => response)
    .catch(err => err.response);
  return callResponse;
};

export const FetchQrInfoByIdApi = async params => {
  const callResponse = await axios({
    url: endpoints.qrinfo,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};

export const FetchInventoryOutLogApi = async params => {
  const callResponse = await axios({
    url: endpoints.fetchInventoryOutLogs,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);
  return callResponse;
};

