import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const fetchlocationMasterApi = async (params) => {
    const callResponse = await axios({
        url: endpoints.locationMasterFetch,
        method: "get",
        headers: getHeaders(),
        params,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const FetchLocationHistoryApi = async params => {
    const callResponse = await axios({
        url: endpoints.locationInfo,
        method: "GET",
        headers: getHeaders(),
        params,
    })
        .then(response => response.data)
        .catch(err => err.response.data);
    return callResponse;
};

export const createlocationMasterApi = async (data) => {
    const callResponse = await axios({
        url: endpoints.locationMasterCreate,
        method: "post",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const deletelocationMasterApi = async (data) => {
    const callResponse = await axios({
        url: endpoints.locationMasterDelete,
        method: "delete",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const updatelocationMasterApi = async (data) => {
    const callResponse = await axios({
        url: endpoints.locationMasterUpdate,
        method: "patch",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};


export const getlocationMasterByIdApi = async params => {
    const callResponse = await axios({
        url: endpoints.locationMasterFetchById,
        method: "get",
        headers: getHeaders(),
        params,
    })
        .then(response => response.data)
        .catch(err => err.response.data);

    return callResponse;
};