import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const fetchComponentApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.ComponentFetch,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };
  
  export const createComponentApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.ComponentCreate,
      method: "post",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const deleteComponentApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.ComponentDelete,
      method: "delete",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const updateComponentApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.ComponentUpdate,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };


  export const getComponentByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.ComponentFetchById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };