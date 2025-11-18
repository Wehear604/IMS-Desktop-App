import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const fetchInventoryMaster = async (params) => {
    const callResponse = await axios({
        url: endpoints.fetchInventoryMaster,
        method: "get",
        headers: getHeaders(),
        params,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const createInventoryMaster = async (data) => {
    const callResponse = await axios({
        url: endpoints.createInventoryMaster,
        method: "post",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const deleteInventoryMaster = async (data) => {
    const callResponse = await axios({
        url: endpoints.deleteInventoryMaster,
        method: "delete",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const updateInventoryMaster = async (data) => {
    const callResponse = await axios({
        url: endpoints.updateInventoryMaster,
        method: "patch",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};


export const fetchInventoryMasterById = async params => {
    const callResponse = await axios({
        url: endpoints.fetchInventoryMasterById,
        method: "get",
        headers: getHeaders(),
        params,
    })
        .then(response => response.data)
        .catch(err => err.response.data);

    return callResponse;
};