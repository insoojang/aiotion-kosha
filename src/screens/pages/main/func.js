import { saveBluetooteData } from '../../../service/api/bluetooth.service'
import { i18nt } from '../../../utils/i18n'
import { WarnAlert } from '../../../components/Alerts'

export const launchFunction = async (promise) => {
    let timerId = null

    clearTimeout(timerId)
    let timeout = new Promise((resolve, reject) => {
        timerId = setTimeout(() => {
            reject('408')
        }, 5000)
    })

    return Promise.race([promise(), timeout])
}

export const fetchBluetoothData = ({ server, resourceKey, param }) => {
    saveBluetooteData({
        url: server,
        resourceKey,
        param,
    })
        .then(() => {
            console.log('service Success')
        })
        .catch((e) => {
            onAllClear()
            console.error(e)
        })
}

export const delayFunction = async () => {
    let closeTimerId = null

    return new Promise((resolve) => {
        closeTimerId = setTimeout(() => {
            resolve()
        }, 3000)
    })
}

export const sensorErrorAlert = (e, timeoutCount = 0, state) => {
    if (e === '408') {
        WarnAlert({
            message: i18nt(`error.sensor-error-${e}`),
            content: timeoutCount === 2 ? i18nt(`action.bluetooth-reset`) : '',
            state: state(),
        })
    } else if (e === '404' || e === '500') {
        WarnAlert({
            message: i18nt(`error.sensor-error-${e}`),
        })
    } else {
        WarnAlert({
            message: i18nt(`action.connection-fail`),
        })
    }
    console.error(`[ERROR] : ${i18nt(`error.sensor-error-${e}`)}`)
}
