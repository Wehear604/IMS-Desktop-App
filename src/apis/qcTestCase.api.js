import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const CreateQcTestCaseApi = async data => {
    const callResponse = await axios({
      url: endpoints.qcTestCase,
      method: "POST",
      headers: getHeaders(),
  
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const fetchQcTestCaseApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.qcTestCase,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };

  export const fetchQcTestCaseByIdApi = async (params) => {
    const callResponse = await axios({
      url: endpoints.qcTestCaseById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };


  export const updateQcTestCaseApi = async data => {
    const callResponse = await axios({
      url: endpoints.qcTestCase,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const deleteQcTestCaseApi = async (data) => {
    const callResponse = await axios({
      url: endpoints.qcTestCase,
      method: "delete",
      headers: getHeaders(),
      data,
    })
      .then((response) => response.data)
      .catch((err) => ({status:0,response:err.response,code:err.response.status}));
  
    return callResponse;
  };
