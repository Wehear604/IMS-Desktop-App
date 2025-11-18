import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const CreateStockInOutLogsApi = async data => {
  const callResponse = await axios({
    url: endpoints.updateStockLogs,
    method: "POST",
    headers: getHeaders(),

    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};