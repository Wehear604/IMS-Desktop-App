import axios from 'axios'
import { getHeaders } from '../utils/main'
import endpoints from './endpoints'

export const fetchVersiones = async (params) => {
    const callResponse = await axios({
        url: endpoints.versions,
        method: 'get',
        headers: getHeaders(),
        params
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }))

    return callResponse
}

export const fetchLatestVersion = async (params) => {
    const callResponse = await axios({
        url: endpoints.latestVersions,
        method: 'get',
        headers: getHeaders(),
        params
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }))

    return callResponse
}

export const createVersion = async (data) => {
    const callResponse = await axios({
        url: endpoints.versions,
        method: 'post',
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }))

    return callResponse
}

export const deleteVersion = async (data) => {
    const callResponse = await axios({
        url: endpoints.versions,
        method: 'delete',
        headers: getHeaders(),
        data,
    })
        .then((response) => response.data)
        .catch((err) => ({ status: 0, response: err.response, code: err.response.status }))

    return callResponse
}

