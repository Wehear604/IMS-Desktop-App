import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const CreateQcDashboardApi = async data => {
    const callResponse = await axios({
      url: endpoints.qcDashboard,
      method: "POST",
      headers: getHeaders(),
  
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const fetchQcDashboardApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.qcDashboard,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const fetchQcDashboardByIdApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.qcDashboardById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };


  export const updateQcDashboardApi = async data => {
    const callResponse = await axios({
      url: endpoints.qcDashboard,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const deleteQcDashboardApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.qcDashboard,
      method: "delete",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };
