import { isEmpty } from 'lodash-es'
import { i18nt } from './i18n'

export const qrErrorCheck = (value) => {
    if (typeof value !== 'object') {
        return false
    }
    switch (true) {
        case isEmpty(value):
            return true
        case Object.keys(value).length !== 3:
            return true
        case !value.hasOwnProperty('uuid'):
            return true
        case !value.hasOwnProperty('resourceId'):
            return true
        case !value.hasOwnProperty('server'):
            return true
        case isEmpty(value.uuid) &&
            isEmpty(value.resourceId) &&
            isEmpty(value.server):
            return true
        default:
            return false
    }
}

export const fastenedMessage = (value) => {
    if (typeof value !== 'string') {
        return '-'
    }
    switch (true) {
        case isEmpty(value):
            return '-'
        case value === '11':
            return i18nt('sensor.normal-connection')
        case value === '10':
            return i18nt('sensor.abnormal-connection')
        case value === '01':
            return i18nt('sensor.disConnected')
        case value === '00':
            return i18nt('sensor.disConnected')
        default:
            return '-'
    }
}
