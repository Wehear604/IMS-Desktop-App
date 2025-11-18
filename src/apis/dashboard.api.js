import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const fetchRawMaterialCountApi = async params => {
    const callResponse = await axios({
      url: endpoints.fetchRawMaterialCount,
      method: "GET",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
};
  
export const fetchDashboardMaterialApi = async params => {
  const callResponse = await axios({
    url: endpoints.fetchDashboardMateriallogs,
    method: "GET",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};


  export const fetchFgCountApi = async params => {
    const callResponse = await axios({
      url: endpoints.fetchFgCount,
      method: "GET",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

   export const fetchSfgCountApi = async params => {
    const callResponse = await axios({
      url: endpoints.fetchSfgCount,
      method: "GET",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

   export const fetchSkdCountApi = async params => {
    const callResponse = await axios({
      url: endpoints.fetchSkdCount,
      method: "GET",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };