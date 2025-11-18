import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const fetchRejectionReasonApi = async (params) => {
    const callResponse = await axios({
        url: endpoints.RejectionReasonFetch,
        method: "get",
        headers: getHeaders(),
        params,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const createRejectionReasonApi = async (data) => {
    const callResponse = await axios({
        url: endpoints.RejectionReasonCreate,
        method: "post",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const deleteRejectionReasonApi = async (data) => {
    const callResponse = await axios({
        url: endpoints.RejectionReasonDelete,
        method: "delete",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const updateRejectionReasonApi = async (data) => {
    const callResponse = await axios({
        url: endpoints.RejectionReasonUpdate,
        method: "patch",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};


export const getRejectionReasonByIdApi = async params => {
    const callResponse = await axios({
        url: endpoints.RejectionReasonFetchById,
        method: "get",
        headers: getHeaders(),
        params,
    })
        .then(response => response.data)
        .catch(err => err.response.data);

    return callResponse;
};