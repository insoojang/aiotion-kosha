import React from 'react'
import { Text, View as RNView } from 'react-native'
import { Ndef } from 'react-native-nfc-manager'

const RTD_MAP = {
    TEXT: 'T', // [0x54]
    URI: 'U', // [0x55]
    SMART_POSTER: 'Sp', // [0x53, 0x70]
    ALTERNATIVE_CARRIER: 'ac', //[0x61, 0x63]
    HANDOVER_CARRIER: 'Hc', // [0x48, 0x63]
    HANDOVER_REQUEST: 'Hr', // [0x48, 0x72]
    HANDOVER_SELECT: 'Hs', // [0x48, 0x73]
}

const TagDetailScreen = (props) => {
    const { tag } = props.route.params
    const ndef =
        Array.isArray(tag.ndefMessage) && tag.ndefMessage.length > 0
            ? tag.ndefMessage[0]
            : null
    function rtdValueToName(value) {
        value = value.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
        for (let name in RTD_MAP) {
            if (value === RTD_MAP[name]) {
                return name
            }
        }
        return null
    }
    let text = Ndef.text.decodePayload(ndef.payload)

    // const ndef =
    //     Array.isArray(tag.ndefMessage) && tag.ndefMessage.length > 0
    //         ? tag.ndefMessage[0]
    //         : null;
    return (
        <RNView>
            <Text>{text ? text : null}</Text>
        </RNView>
    )
}

export default TagDetailScreen
