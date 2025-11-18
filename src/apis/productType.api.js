import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const fetchTypeApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.productTypeFetch,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };
  
  export const createTypeApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.productTypeCreate,
      method: "post",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const deleteTypeApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.productTypeDelete,
      method: "delete",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const updateTypeApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.productTypeUpdate,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };


  export const getTypeByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.productTypeFetchById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };