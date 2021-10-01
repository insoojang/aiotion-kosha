//14co
const snesor_14co = () => {
    const uuid = {
        server: 'http://121.78.87.165',
        ios: 'D88F794C-1DAD-FE3C-070C-E9D356A6518F',
        android: 'F2:57:E3:BC:14:C0',
    }
    const min = 16368
    const max = 1600
    const character = [
        {
            properties: { Write: 'Write', Read: 'Read' },
            characteristic: '2a00',
            service: '1800',
        },
        {
            properties: { Read: 'Read' },
            characteristic: '2a01',
            service: '1800',
        },
        {
            properties: { Read: 'Read' },
            characteristic: '2a04',
            service: '1800',
        },
        {
            properties: { Read: 'Read' },
            characteristic: '2aa6',
            service: '1800',
        },
        {
            descriptors: [{ value: null, uuid: '2902' }],
            properties: { Indicate: 'Indicate', Write: 'Write' },
            characteristic: '8ec90003-f315-4f60-9fb8-838830daea50',
            service: 'fe59',
        },
        {
            properties: {
                Write: 'Write',
                WriteWithoutResponse: 'WriteWithoutResponse',
            },
            characteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
            service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
        },
        {
            descriptors: [{ value: null, uuid: '2902' }],
            properties: { Notify: 'Notify' },
            characteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
            service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
        },
    ]
    const character_ios = [
        {
            service: 'FE59',
            characteristic: '8EC90003-F315-4F60-9FB8-838830DAEA50',
            isNotifying: false,
            properties: ['Write', 'Indicate'],
        },
        {
            service: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E',
            characteristic: '6E400002-B5A3-F393-E0A9-E50E24DCCA9E',
            isNotifying: false,
            properties: ['WriteWithoutResponse', 'Write'],
        },
        {
            service: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E',
            characteristic: '6E400003-B5A3-F393-E0A9-E50E24DCCA9E',
            isNotifying: false,
            properties: ['Notify'],
        },
    ]
}

const sensor_49e6 = {
    server: 'http://121.78.87.165',
    ios: '21EBD060-DFDA-D824-31EC-CB921F344F1E',
    android: 'D0:AB:8D:97:49:E6',
}
const sensor_d4e4 = {
    server: 'http://121.78.87.165',
    ios: '2AD63190-035A-9AB9-E53F-CDE7968F544D',
    android: 'C7:C9:A6:CF:D4:E4',
}
