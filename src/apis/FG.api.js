import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const FetchFGApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.FGFetch,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };
  
  export const CreateFGApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.FGCreate,
      method: "post",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const deleteFGApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.FGDelete,
      method: "delete",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const UpdateFGApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.FGUpdate,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };


  export const getFGByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.FGFetchById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const getFGItemCodeByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.FGFetchItemCodeById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };