import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const getNotifcationsApi = async params => {
    const callResponse = await axios({
        url: endpoints.notificationFetch,
        method: "get",
        headers: getHeaders(),
        params,
    })
        .then(response => response.data)
        .catch(err => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};