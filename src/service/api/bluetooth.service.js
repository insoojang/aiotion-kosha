import { client } from '../http'

const defaultUrl = 'http://192.168.234.24/'
const saveBluetooteData = ({ url, resourceId, param }) => {
    return client.post(
        `${url || defaultUrl}/api/noauth/kosha/sensor/${resourceId}/info`,
        param,
    )
}

export { saveBluetooteData }
