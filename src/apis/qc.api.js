import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const CreateBatchApi = async data => {
    const callResponse = await axios({
      url: endpoints.QualityCheckCreate,
      method: "POST",
      headers: getHeaders(),
  
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const fetchBatchApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.QualityCheckFetch,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const fetchProductQcApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.QualityCheckFetchQc,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };


  export const updateQcCheckListApi = async data => {
    const callResponse = await axios({
      url: endpoints.QualityCheckUpdateCheckList,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };


  export const QcFetchBySerialNoCheckListApi = async params => {
    const callResponse = await axios({
      url: endpoints.QualityCheckFetchBySerialNoCheckList,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };