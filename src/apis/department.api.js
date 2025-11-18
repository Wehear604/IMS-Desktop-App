import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const fetchDepartments = async (params) => {
    const callResponse = await axios({
      url: endpoints.DepartmentFetch,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };
  
  export const createDepartment = async (data) => {
    const callResponse = await axios({
      url: endpoints.DepartmentCreate,
      method: "post",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const deleteDepartment = async (data) => {
    const callResponse = await axios({
      url: endpoints.DepartmentDelete,
      method: "delete",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const updateDepartment = async (data) => {
    const callResponse = await axios({
      url: endpoints.DepartmentUpdate,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };


  export const getDepartmentByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.DepartmentFetchById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };