import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";


// export const fetchDepartments = async (params) => {
//     const callResponse = await axios({
//       url: endpoints.DepartmentFetch,
//       method: "get",
//       headers: getHeaders(),
//       params,
//     })
//       .then((response) => response.data)
//       .catch((err) => ({status:0,response:err.response,code:err.response.status}));

//     return callResponse;
//   };

export const createDeviceQcApi = async (data) => {
    const callResponse = await axios({
        url: endpoints.createDeviceQc,
        method: "post",
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }));

    return callResponse;
};
