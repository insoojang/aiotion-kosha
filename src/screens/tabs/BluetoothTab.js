import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { S_BluetoothView } from './BluetoothStyle'
import Bluetooth from '../Bluetooth'

const BluetoothTab = (props) => {
    return (
        <S_BluetoothView>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: '100%' }}
            >
                <TouchableOpacity activeOpacity={1}>
                    <Bluetooth />
                </TouchableOpacity>
            </ScrollView>
        </S_BluetoothView>
    )
}

export default BluetoothTab
