import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { S_BluetoothView } from './BluetoothStyle'
import Bluetooth from '../Bluetooth'
import { colorSet } from '../../styles/colors'
import { responsiveHeight } from 'react-native-responsive-dimensions'

const BluetoothTab = (props) => {
    return (
        <S_BluetoothView>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: '100%', backgroundColor: colorSet.white }}
            >
                <TouchableOpacity activeOpacity={1} style={{ height: responsiveHeight(100) - 91 }}>
                    <Bluetooth />
                </TouchableOpacity>
            </ScrollView>
        </S_BluetoothView>
    )
}

export default BluetoothTab
