import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const AddInOutProductStock = async data => {
    const callResponse = await axios({
      url: endpoints.AddInOutProductStock,
      method: "POST",
      headers: getHeaders(),
  
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const AddInOutRawMaterialStock = async data => {
    const callResponse = await axios({
      url: endpoints.AddInOutRawMaterialStock,
      method: "POST",
      headers: getHeaders(),
  
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };
  export const fetchProductCurrentStock = async params => {
    const callResponse = await axios({
      url: endpoints.fetchCurrentStockByProductId,
      method: "GET",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };
  export const fetchRawMaterialCurrentStock = async params => {
    const callResponse = await axios({
      url: endpoints.fetchCurrentStockByRawMaterialId,
      method: "GET",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };