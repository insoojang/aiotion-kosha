import React, { useEffect, useState, useCallback } from 'react'
import { View as RNView } from 'react-native'
import { Button, Input, Text } from 'react-native-elements'
import BleManager from 'react-native-ble-manager'
import { i18nt as t } from '../../utils/i18n'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SInfoDetailView, SInfoView } from '../tabs/BluetoothStyle'
import { debounce, isEmpty } from 'lodash-es'
import Constants from 'expo-constants'
import { useNavigation } from '@react-navigation/native'
import { SCREEN } from '../../navigation/constants'
import { Camera } from 'expo-camera'
import { useToast } from 'react-native-styled-toast'
import { TOAST_ERROR_CONFIG } from '../../components/constants'
import { useDispatch, useSelector } from 'react-redux'

const Bluetooth = ({}) => {
    const [connectionState, setConnectionState] = useState(false)
    const [safetySate, setSafetyState] = useState('-')
    const navigation = useNavigation()
    const { toast } = useToast()

    useEffect(() => {
        BleManager.start({ showAlert: false }).then(() => {
            // Success code
            console.log('Module initialized')
        })
    })

    const checkDevice = () => {
        if (!Constants.isDevice) {
            const e = new Error(t('error.device'))
            e.name = 'device'
            throw e
        }
    }

    const getCameraPermission = async (url) => {
        const { status } = await Camera.requestPermissionsAsync()
        if (status === 'granted') {
            navigation.navigate(SCREEN.QR)
        } else {
            const e = new Error(t('error.permission-deny-camera'))
            e.name = 'permission-deny-camera'
            toast({
                ...TOAST_ERROR_CONFIG,
                hideAccent: false,
                duration: 2000,
                message: t('user.select-site'),
            })
        }
    }

    const debounceOnRoute = debounce((url) => {
        try {
            checkDevice()
            getCameraPermission(url)
                .then((response) => {
                    console.log('Success Camera Permission.')
                })
                .catch((e) => {
                    console.error('[ERROR]', e)
                })
        } catch (e) {
            console.error('[ERROR]', e)
        }
    }, 200)

    const onPressQR = useCallback(debounceOnRoute, [])
    const stopBleScan = () => {
        BleManager.stopScan().then(() => {
            // Success code
            console.log('Scan stopped')
        })
    }
    const connectBle = () => {
        BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
            // Success code
            console.log('Connected peripherals: ' + peripheralsArray.length)
        })
    }

    const retrieveConnected = () => {
        BleManager.getConnectedPeripherals([]).then((results) => {
            console.log(results)
        })
    }
    // const counter = useSelector((state) => state)
    // console.log('counter', counter)
    return (
        <RNView>
            <SInfoView>
                <SInfoDetailView>
                    <Text style={{ flex: 2.9 }} h4>
                        {t('common.name')}
                    </Text>
                    <Input
                        containerStyle={{ flex: 8 }}
                        disabledInputStyle={{ background: '#ddd' }}
                        // errorMessage="Oops! that's not correct."
                        clearButtonMode="always"
                        rightIcon={<Icon name="pencil" size={20} />}
                        // placeholder="생년월일을 입력하세요."
                    />
                </SInfoDetailView>
                <SInfoDetailView>
                    <Text style={{ flex: 4 }} h4>
                        {t('common.date-of-birth')}
                    </Text>
                    <Input
                        containerStyle={{ flex: 11 }}
                        disabledInputStyle={{ background: '#ddd' }}
                        // errorMessage="Oops! that's not correct."
                        clearButtonMode="always"
                        rightIcon={<Icon name="pencil" size={20} />}
                        // placeholder="생년월일을 입력하세요."
                    />
                </SInfoDetailView>
                <SInfoDetailView>
                    <Text style={{ flex: 4 }} h4>
                        {t('common.connection-status')}
                    </Text>
                    <Text
                        style={{
                            flex: 4,
                            color: connectionState ? 'green' : 'red',
                        }}
                        h4
                    >
                        {connectionState ? t('sensor.on') : t('sensor.off')}
                    </Text>
                </SInfoDetailView>
                <SInfoDetailView>
                    <Text style={{ flex: 4 }} h4>
                        {t('common.fail-safe')}
                    </Text>
                    <Text style={{ flex: 4 }} h4>
                        {safetySate}
                    </Text>
                </SInfoDetailView>
            </SInfoView>
            <Button
                buttonStyle={{ height: 50, marginHorizontal: 25 }}
                onPress={onPressQR}
                title={t('action.connection')}
            />
            <Button
                buttonStyle={{ height: 50, marginHorizontal: 25 }}
                onPress={() => {
                    stopBleScan()
                }}
                title={t('action.disconnect')}
            />
        </RNView>
    )
}

export default Bluetooth
