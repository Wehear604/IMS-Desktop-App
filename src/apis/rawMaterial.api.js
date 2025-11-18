import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const AddRawMaterialApi = async data => {
    const callResponse = await axios({
      url: endpoints.RawMaterialCreate,
      method: "POST",
      headers: getHeaders(),
  
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };
  export const fetchRawMaterialApi = async params => {
    const callResponse = await axios({
      url: endpoints.RawMaterialFetch,
      method: "GET",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };
  
  export const getRawMaterialByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.RawMaterialById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const deleteRawMaterialApi = async data => {
    const callResponse = await axios({
      url: endpoints. RawMaterialDelete,
      method: "DELETE",
      headers: getHeaders(),
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };  


  export const updateRawMaterialApi = async data => {
    const callResponse = await axios({
      url: endpoints.RawMaterialUpdate,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };
