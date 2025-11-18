import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const fetchTypeofSaless = async (params) => {
    const callResponse = await axios({
      url: endpoints.TypeofSalesFetch,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };
  
  export const createTypeofSales = async (data) => {
    const callResponse = await axios({
      url: endpoints.TypeofSalesCreate,
      method: "post",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const deleteTypeofSales = async (data) => {
    const callResponse = await axios({
      url: endpoints.TypeofSalesDelete,
      method: "delete",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const updateTypeofSales = async (data) => {
    const callResponse = await axios({
      url: endpoints.TypeofSalesUpdate,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };


  export const getTypeofSalesByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.TypeofSalesFetchById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };