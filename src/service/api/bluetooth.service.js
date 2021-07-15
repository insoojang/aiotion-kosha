import { client } from '../http'

const defaultUrl = 'http://192.168.234.24/'
const saveBluetooteData = ({ url, resourceKey, param }) => {
    return client.post(
        `${url || defaultUrl}/api/noauth/kosha/sensor/${resourceKey}/info`,
        param,
    )
}

export { saveBluetooteData }
