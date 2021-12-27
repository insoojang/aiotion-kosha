import { i18nt } from '../../../utils/i18n'
import { WarnAlert } from '../../../components/Alerts'

export const launchFunction = async (promise) => {
    let timerId = null

    clearTimeout(timerId)
    let timeout = new Promise((resolve, reject) => {
        timerId = setTimeout(() => {
            reject('408')
        }, 3500)
    })

    return Promise.race([promise(), timeout])
}

export const delayFunction = async () => {
    let closeTimerId = null

    return new Promise((resolve) => {
        closeTimerId = setTimeout(() => {
            resolve()
        }, 1000)
    })
}

export const sensorErrorAlert = (e, timeoutCount = 0, onPress) => {
    if (e === '408') {
        WarnAlert({
            message: i18nt(`error.sensor-error-${e}`),
            content: timeoutCount === 2 ? i18nt(`action.bluetooth-reset`) : '',
            state: () => {
                onPress(false)
            },
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
