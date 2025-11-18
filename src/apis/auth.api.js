import axios from "axios";
import { getHeaders, refreshToken } from "../utils/main";
import endpoints from "./endpoints";

export const signInApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.signIn,
    method: "post",
    data,
  })
    .then((response) => response.data)
    .catch((err) =>
      err.response
        ? { status: 0, response: err.response, code: err.response.status }
        : {}
    );
  return callResponse;
};

export const resetTokenApi = async () => {
  const callResponse = await axios({
    url: endpoints.resetToken,
    method: "post",
    data: {
      refreshToken: refreshToken.get(),
    },
  })
    .then((response) => response.data)
    .catch((err) =>
      err.response
        ? { status: 0, response: err.response, code: err.response.status }
        : {}
    );
  return callResponse;
};

export const resetPasswordApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.resetPass,
    method: "post",
    data,
    headers: getHeaders(),
  })
    .then((response) => response.data)
    .catch((err) =>
      err.response
        ? { status: 0, response: err.response, code: err.response.status }
        : {}
    );
  return callResponse;
};
