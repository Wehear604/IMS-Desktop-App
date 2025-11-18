import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const FetchProductionPlanningApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.ProductionPlanningFetch,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };
  
  export const createProductionPlanningApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.ProductionPlanningCreate,
      method: "post",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const DeleteProductionPlanningApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.ProductionPlanningDelete,
      method: "delete",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

export const GetProductionPlanningByIdApi = async params => {
  const callResponse = await axios({
    url: endpoints.ProductionPlanningFindById,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};