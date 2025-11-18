import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const addvendorApi = async data => {
  const callResponse = await axios({
    url: endpoints.vendorcreate,
    method: "POST",
    headers: getHeaders(),

    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const updatevendorApi = async data => {
  const callResponse = await axios({
    url: endpoints.vendorupdate,
    method: "patch",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const deleteVendorApi = async data => {
  const callResponse = await axios({
    url: endpoints.vendordelete,
    method: "DELETE",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};


export const fetchvendorApi = async params => {
  const callResponse = await axios({
    url: endpoints.vendorfetch,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const FetchvendorRawMaterialWiseApi = async params => {
  const callResponse = await axios({
    url: endpoints.fetchvendorRawMaterialWise,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const getVendorByIdApi = async params => {
  const callResponse = await axios({
    url: endpoints.VendorFetchById,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};