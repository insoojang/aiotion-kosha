import { client } from '../http'

const defaultUrl = 'http://192.168.234.24/'
const saveBluetoothData = ({ url, resourceKey, param }) => {
    return client.post(
        `${url || defaultUrl}/api/noauth/kosha/sensor/${resourceKey}/info`,
        param,
    )
}
const getFirmwareVersion = (url) => {
    return client.get(`${url || defaultUrl}/api/noauth/kosha/files/recent`)
}
const getFirmwareFile = ({ url, version }) => {
    return client.get(
        `${url || defaultUrl}/api/noauth/kosha/file/${version}/download`,
    )
}

export { saveBluetoothData, getFirmwareVersion, getFirmwareFile }
