import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const FetchPurchaseRequestApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.FetchPurchaseRequest,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const CreatePurchaseRequestApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.CreatePurchaseRequest,
      method: "post",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const UpdatePurchaseRequestApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.UpdatePurchaseRequest,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) =>
        err.response
          ? { status: 0, response: err.response, code: err.response.status }
          : {}
      );
    return callResponse;
  };


  export const FetchPurchaseRequestByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.FetchPurchaseRequestById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };