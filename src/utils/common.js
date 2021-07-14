import { isEmpty } from 'lodash-es'

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
        case !value.hasOwnProperty('resourceKey'):
            return true
        case !value.hasOwnProperty('server'):
            return true
        case isEmpty(value.uuid) &&
            isEmpty(value.resourceKey) &&
            isEmpty(value.server):
            return true
        default:
            return false
    }
}
