import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


export const FetchSpecialMarkingApi = async (params) => {
    const callResponse = await axios({
        url: endpoints.SpecialMarkingFetch,
        method: "get",
        headers: getHeaders(),
        params,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const CreateSpecialMarkingApi = async (data) => {
    const callResponse = await axios({
        url: endpoints.SpecialMarkingCreate,
        method: "post",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const DeleteSpecialMarkingApi = async (data) => {
    const callResponse = await axios({
        url: endpoints.SpecialMarkingDelete,
        method: "delete",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};

export const UpdateSpecialMarkingApi = async (data) => {
    const callResponse = await axios({
        url: endpoints.SpecialMarkingUpdate,
        method: "patch",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};


export const getSpecialMarkingByIdApi = async params => {
    const callResponse = await axios({
        url: endpoints.SpecialMarkingFetchById,
        method: "get",
        headers: getHeaders(),
        params,
    })
        .then(response => response.data)
        .catch(err => err.response.data);

    return callResponse;
};