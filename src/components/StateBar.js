import React from 'react'
import { Text } from 'react-native-elements'
import { SStateTextInnerView, SStateTextView } from './StateBarStyle'

const StateBar = ({ title, innerStyle }) => {
    return (
        <SStateTextView>
            <SStateTextInnerView style={innerStyle}>
                <Text>{title}</Text>
            </SStateTextInnerView>
        </SStateTextView>
    )
}

export default StateBar
