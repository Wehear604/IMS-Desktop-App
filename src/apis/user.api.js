import axios from "axios";
import { getHeaders } from "../utils/main";
import endpoints from "./endpoints";

export const getUserAndSystemDataApi = async (data) => {
  const callResponse = await axios({
    url: endpoints.userAndSystemFetchByToken,
    method: "get",
    headers: getHeaders(),
    params: data,
  })
    .then((response) => response.data)
    .catch((err) => err.response.data);

  return callResponse;
};

export const getUserApi = async params => {
  const callResponse = await axios({
    url: endpoints.UserFetchApi,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const createUserApi = async data => {
  const callResponse = await axios({
    url: endpoints.UserCreateApi,
    method: "post",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const fetchUserByIdApi = async params => {
  const callResponse = await axios({
    url: endpoints.UserFetchByIdApi,
    method: "get",
    headers: getHeaders(),
    params,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const userUpdateApi = async data => {
  const callResponse = await axios({
    url: endpoints.UserUpdateApi,
    method: "patch",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const deleteUserApi = async data => {
  const callResponse = await axios({
    url: endpoints.UserDelete,
    method: "DELETE",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const userResetPasswordApi = async data => {
  const callResponse = await axios({
    url: endpoints.UserResetPassword,
    method: "patch",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const userUndoDeleteApi = async data => {
  const callResponse = await axios({
    url: endpoints.UserUndoDelete,
    method: "patch",
    headers: getHeaders(),
    data,
  })
    .then(response => response.data)
    .catch(err => err.response.data);

  return callResponse;
};

export const updateModulesPermission = async (data) => {
  const callResponse = await axios({
    url: endpoints.ModulesPermission,
    method: "PUT",
    headers: getHeaders(),
    data,
  })
    .then((response) => response.data)
    .catch((err) => err.response.data);

  return callResponse;
};