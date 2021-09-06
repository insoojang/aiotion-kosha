import axios from 'axios'
import qs from 'qs'

const instance = axios.create({
    timeout: 30000,
    withCredentials: true,
})

const requestInterceptor = (method, url, data, headers, responseType) => {
    let defaultHeaders = {}
    const options = {
        method,
        url,
        // options are 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
        responseType: responseType || 'json',
        headers: defaultHeaders,
        paramsSerializer: (params) =>
            qs.stringify(params, {
                arrayFormat: 'repeat',
                skipNulls: true,
            }),
    }
    options.data = data
    options.headers = Object.assign(options.headers, {
        'Content-Type': 'application/json',
    })
    if (headers) {
        options.headers = Object.assign(options.headers, headers)
    }
    return new Promise((resolve, reject) => {
        instance
            .request(options)
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                if (error.response) {
                    // eslint-disable-next-line no-param-reassign
                    error.message = error.response.data
                        ? error.response.data.message
                        : `${error.response.status} ${error.response.statusText}`
                } else {
                    // eslint-disable-next-line no-param-reassign
                    error.message =
                        error.message || `${error.status} ${error.statusText}`
                }
                reject(error)
            })
    })
}

const client = {
    post(url, data, headers, responseType) {
        return requestInterceptor('POST', url, data, headers, responseType)
    },
    get(url, data, headers, responseType) {
        return requestInterceptor('GET', url, data, headers, responseType)
    },
}

export default client
