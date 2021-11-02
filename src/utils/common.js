import { isEmpty } from 'lodash-es'
import { i18nt } from './i18n'
import Constants from 'expo-constants'

export const qrErrorCheck = (value) => {
    if (typeof value !== 'object') {
        return false
    }
    switch (true) {
        case isEmpty(value):
            return true
        case Object.keys(value).length < 3:
            return true
        case !value.hasOwnProperty('ios'):
            return true
        case !value.hasOwnProperty('android'):
            return true
        case !value.hasOwnProperty('server'):
            return true
        case isEmpty(value.ios) &&
            isEmpty(value.android) &&
            isEmpty(value.server):
            return true
        default:
            return false
    }
}

export const fastenedMessage = (value) => {
    if (typeof value !== 'string') {
        return i18nt('sensor.unknown')
    }
    switch (true) {
        case isEmpty(value):
            return i18nt('sensor.unknown')
        case value === '11':
            return i18nt('sensor.normal-connection')
        case value === '10':
            return i18nt('sensor.abnormal-connection')
        case value === '01':
            return i18nt('sensor.not-fastened')
        case value === '00':
            return i18nt('sensor.not-fastened')
        case value === '3':
            return i18nt('sensor.foreign-object')
        default:
            return i18nt('sensor.unknown')
    }
}

export const defaultTypeOfFastened = {
    icon: 'account-hard-hat',
    color: '#ccc',
    borderColor: '#ccc',
    backgroundColor: 'rgba(204,204,204, 0.2)',
}

export const typeOfFastened = (value) => {
    if (typeof value !== 'string') {
        return defaultTypeOfFastened
    }
    switch (true) {
        case isEmpty(value):
            return defaultTypeOfFastened
        case value === '11':
            return {
                icon: 'check-circle-outline',
                color: 'rgb(42 ,200, 63)',
                borderColor: 'rgba(42 ,200, 63, 0.2)',
                backgroundColor: 'rgba(42 ,200, 63, 0.1)',
            }
        case value === '10':
            return {
                icon: 'alert-outline',
                color: 'rgb(245, 161, 77)',
                borderColor: 'rgba(245, 161, 77, 0.2)',
                backgroundColor: 'rgba(245, 161, 77, 0.1)',
            }
        case value === '01':
            return {
                icon: 'block-helper',
                color: 'rgb(245, 95, 77)',
                borderColor: 'rgba(245, 95, 77, 0.2)',
                backgroundColor: 'rgba(245, 95, 77, 0.1)',
            }
        case value === '00':
            return {
                icon: 'block-helper',
                color: 'rgb(245, 95, 77)',
                borderColor: 'rgba(245, 95, 77, 0.2)',
                backgroundColor: 'rgba(245, 95, 77, 0.1)',
            }
        case value === '3':
            return {
                icon: 'virus',
                color: 'rgb(245, 161, 77)',
                borderColor: 'rgba(245, 161, 77, 0.2)',
                backgroundColor: 'rgba(245, 161, 77, 0.1)',
            }
        default:
            return defaultTypeOfFastened
    }
}

export const checkDevice = () => {
    if (!Constants.isDevice) {
        const e = new Error(i18nt('error.device'))
        e.name = 'device'
        throw e
    }
}

export const sensorDataCheck = (value) => {
    if (typeof value !== 'object') {
        return false
    }
    switch (true) {
        case isEmpty(value):
            return true
        case !value.hasOwnProperty('proximity_sensor'):
            return true
        case !value.hasOwnProperty('battery'):
            return true
        case !value.hasOwnProperty('version'):
            return true
        case isEmpty(value.proximity_sensor) &&
            isEmpty(value.battery) &&
            isEmpty(value.version):
            return true
        default:
            return false
    }
}

export const percentageCalc = (v, t) => {
    return (v * 100) / t
}

export const checkNotifyProperties = (info) => {
    if (info?.characteristics) {
        const characteristic = info.characteristics
        return characteristic.reduce(
            (acc, datum) => {
                if (Object.values(datum.properties).includes('Notify')) {
                    acc = Object.assign({}, datum, { status: 200 })
                }
                return acc
            },
            { status: 400 },
        )
    }
    return { status: 500 }
}

export const isEmptyASCII = (value) => {
    if (value && value.length) {
        const data = value.slice()
        const idx = data.indexOf(0)
        if (idx > -1) {
            data.splice(idx, 1)
        }
        return data
    }
}
