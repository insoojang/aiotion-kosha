import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react'
import { Platform } from 'react-native'
import { i18nt } from '../../../utils/i18n'
import { Input, Button } from 'react-native-elements'
import { fontSizeSet } from '../../../styles/size'
import { debounce, isEmpty } from 'lodash-es'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SCREEN } from '../../../navigation/constants'

import {
    SLoginContainerView,
    SLoginHeaderView,
    SLoginInfoText,
    SLoginInfoView,
} from './LoginStyle'
import { colorSet } from '../../../styles/colors'

const Login = (props) => {
    const navigation = useNavigation()
    const [name, setName] = useState()
    const [birth, setBirth] = useState()

    const storeData = async ({ name, birth }) => {
        try {
            const jsonValue = JSON.stringify({ name, birth })
            await AsyncStorage.setItem('@userData', jsonValue)
        } catch (e) {
            console.error('[ERROR]: set storeData')
            // saving error
        }
    }
    const onPressNext = debounce(({ name, birth }) => {
        storeData({ name, birth })
        navigation.navigate(SCREEN.MainTab)
    }, 200)

    return (
        <SLoginContainerView
            style={{
                paddingTop: Platform.OS === 'ios' ? 80 : 40,
            }}
        >
            <SLoginHeaderView>
                <SLoginInfoText>{i18nt('login.header')}</SLoginInfoText>
            </SLoginHeaderView>
            <SLoginInfoView>
                <Input
                    placeholder={i18nt('login.name')}
                    returnKeyType="next"
                    clearButtonMode="always"
                    containerStyle={{
                        paddingHorizontal: 0,
                    }}
                    inputContainerStyle={{
                        backgroundColor: colorSet.primaryBg,
                        borderColor: 'transparent',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                    }}
                    inputStyle={{
                        fontSize: fontSizeSet.sm,
                        color: colorSet.normalTextColor,
                    }}
                    maxLength={20}
                    onChangeText={setName}
                />
                <Input
                    placeholder={i18nt('login.date-of-birth')}
                    returnKeyType="go"
                    clearButtonMode="always"
                    value={birth}
                    containerStyle={{
                        paddingHorizontal: 0,
                    }}
                    inputContainerStyle={{
                        backgroundColor: colorSet.primaryBg,
                        borderColor: 'transparent',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                    }}
                    inputStyle={{
                        fontSize: fontSizeSet.sm,
                        color: colorSet.normalTextColor,
                    }}
                    keyboardType={'phone-pad'}
                    maxLength={6}
                    onChangeText={setBirth}
                />
                <Button
                    onPress={() => onPressNext({ name, birth })}
                    buttonType="text"
                    title={i18nt('action.ok')}
                    buttonStyle={{
                        backgroundColor: colorSet.primary,
                        borderRadius: 2,
                        paddingVertical: 20,
                        marginVertical: 10,
                    }}
                    disabled={
                        isEmpty(name) || isEmpty(birth)
                    }
                />
            </SLoginInfoView>
        </SLoginContainerView>
    )
}

export default Login
