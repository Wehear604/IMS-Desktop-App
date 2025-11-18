import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const addProductApi = async data => {
    const callResponse = await axios({
      url: endpoints.ProductCreate,
      method: "POST",
      headers: getHeaders(),
  
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const updateProductApi = async data => {
    const callResponse = await axios({
      url: endpoints.ProductUpdate,
      method: "patch",
      headers: getHeaders(),
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const deleteProductApi = async data => {
    const callResponse = await axios({
      url: endpoints.ProductDelete,
      method: "DELETE",
      headers: getHeaders(),
      data,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };  

  
export const fetchProductApi = async params => {
    const callResponse = await axios({
      url: endpoints.ProductFetch,
      method: "GET",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };
  
  export const getProductByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.ProductFetchById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };

  export const FetchProductStockByIdApi = async params => {
    const callResponse = await axios({
      url: endpoints.FetchProductStockById,
      method: "get",
      headers: getHeaders(),
      params,
    })
      .then(response => response.data)
      .catch(err => err.response.data);
  
    return callResponse;
  };