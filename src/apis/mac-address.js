import axios from "axios";
import endpoints from "./endpoints";
import { getHeaders } from "../utils/main";

export const fetchMacAddressApi = async (params) => {
    const callResponse = await axios({
        url: endpoints.getMacAddress,
        method: "get",
        headers: getHeaders(),
        params,
    })
        .then((response) => response.data)
        .catch((err) => err.response.data);

    return callResponse;
};
