import { percentageCalc, sensorDataCheck } from './common'

const jsonParser = (value) => {
    let originData = typeof value === 'object' ? value : JSON.parse(value)
    return typeof originData === 'object' ? originData : JSON.parse(originData)
}
const sensorDataParser = (value) => {
    if (sensorDataCheck(value)) {
        return '00'
    }
    const { tilt_sensor, proximity_sensor } = value
    const data = percentageCalc(proximity_sensor, 16384)
    let sensorData = []
    // if (proximity_sensor > 16360) {
    //     return '3'
    // } else
    if (
        (proximity_sensor > 9600 && proximity_sensor < 12000) ||
        (proximity_sensor > 7200 && proximity_sensor < 8300)
    ) {
        sensorData.push('1')
    } else {
        sensorData.push('0')
    }
    sensorData.push(tilt_sensor)
    return sensorData.join('')
}

export { jsonParser, sensorDataParser }
