import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const FetchSKDApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.SKDFetch,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };
  
  export const CreateSKDApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.SKDCreate,
      method: "post",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const deleteSKDApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.SKDDelete,
      method: "delete",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const UpdateSKDApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.SKDUpdate,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };


  export const getSKDByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.SKDFetchById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };