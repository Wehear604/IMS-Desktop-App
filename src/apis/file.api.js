import axios from "axios";
import { getFileHeaders, getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const getFileOrImage = async (url) => {
    const api = await axios()
    const callResponse = await api({
        url: endpoints.fileBase,
        method: "get",
        headers: getHeaders(),
        params: { fileUrl: url },
        responseType: "blob"
    })
        .then(response => response.data)
        .catch(err => { return err.response.data });

    return callResponse;
};

export const getFileDirect = async (src, withHeaders) => {
    const obj = {
        url: src,
        method: "get",
        responseType: "blob"
    }
    if (withHeaders) {
        obj['headers'] = getHeaders()
    }
    const callResponse = await axios(obj)
        .then(response => response.data)
        .catch(err => err.response.data);

    return callResponse;
};

export const deletefileOrImage = async (url) => {
    const callResponse = await axios({
        url: endpoints.fileBase,
        method: "delete",
        headers: getHeaders(),
        data: { fileUrl: url },
    })
        .then(response => response.data)
        .catch(err => err.response.data);

    return callResponse;
};

export const uploadFile = async (data, onUploadProgress) => {
    const callResponse = await axios({
        url: endpoints.fileFile,
        method: "POST",
        headers: getFileHeaders(),
        onUploadProgress,
        data
    })
        .then(response => response.data)
        .catch(err => err.response.data);

    return callResponse;
};
export const uploadImage = async (data, onUploadProgress) => {
    const callResponse = await axios({
        url: endpoints.fileImage,
        method: "POST",
        headers: getFileHeaders(),
        onUploadProgress,
        data
    })
        .then(response => response.data)
        .catch(err => err.response.data);

    return callResponse;
};

