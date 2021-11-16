import React from 'react'
import {
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native'
import { SCopyrightText } from './TabStyle'
import { colorSet } from '../../styles/colors'
import { Login } from '../pages/login'

const LoginTab = () => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={{ backgroundColor: colorSet.white }}>
                <Login />
                <SCopyrightText>
                    © 2021 NKIA, ALL RIGHTS RESERVED
                </SCopyrightText>
            </ScrollView>
        </TouchableWithoutFeedback>
    )
}

export default LoginTab
