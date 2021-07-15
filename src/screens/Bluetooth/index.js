import React, { useCallback, useEffect, useState } from 'react'
import { Alert, NativeEventEmitter, NativeModules } from 'react-native'
import { Button, Input, Text } from 'react-native-elements'
import BleManager from 'react-native-ble-manager'
import { useNavigation } from '@react-navigation/native'
import { i18nt as t } from '../../utils/i18n'
import { useDispatch, useSelector } from 'react-redux'
import { debounce, isEmpty } from 'lodash-es'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {
    SInfoDetailView,
    SInfoView,
    SText_ConnectState,
    SText_label,
    SView_buttonGroup,
    SView_ConnectStateWrap,
} from '../tabs/BluetoothStyle'
import Constants from 'expo-constants'
import { SCREEN } from '../../navigation/constants'
import { Camera } from 'expo-camera'
import { clearUuid } from '../../redux/reducers'
import { qrErrorCheck } from '../../utils/common'
import { saveBluetooteData } from '../../service/api/bluetooth.service'
import { fontSizeSet } from '../../styles/size'
import { colorSet } from '../../styles/colors'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const Bluetooth = ({}) => {
    const [connectionState, setConnectionState] = useState(false)
    const [safetySate, setSafetyState] = useState('-')
    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const qrValue = useSelector((state) => state.qr)

    const warnAlert = (message, e) => {
        console.error('[ERROR]', e)
        return Alert.alert(
            !isEmpty(message) ? message : t('action.connection-fail'),
            '',
            [
                {
                    text: t('action.ok'),
                    onPress: () => {
                        setConnectionState(false)
                    },
                },
            ],
        )
    }

    const successAlert = (message) =>
        Alert.alert(
            !isEmpty(message) ? message : t('action.connection-success'),
            '',
            [
                {
                    text: t('action.ok'),
                },
            ],
        )

    const onConnect = debounce(() => {
        try {
            checkNameAndDate()
            checkDevice()
            getCameraPermission()
                .then(() => {
                    console.log('Success Camera Permission.')
                })
                .catch((e) => {
                    console.error('[ERROR]', e)
                })
        } catch (e) {
            console.error('[ERROR]', e)
        }
    }, 200)
    const onDisconnect = useCallback(
        debounce((peripheral) => {
            if (peripheral?.uuid) {
                BleManager.disconnect(peripheral.uuid)
                    .then(() => {
                        Alert.alert(t('action.disconnect-success'), '', [
                            {
                                text: t('action.ok'),
                            },
                        ])
                        dispatch(clearUuid())
                    })
                    .catch((e) => {
                        Alert.alert(t('action.connection-fail'), '', [
                            {
                                text: t('action.ok'),
                            },
                        ])
                        console.error('[Error]', e)
                    })
            }
        }, 200),
        [],
    )
    const onChangeName = useCallback(
        debounce((name) => {
            setName(name)
        }, 200),
        [],
    )
    const onChangeDate = useCallback(
        debounce((date) => {
            setDate(date)
        }, 200),
        [],
    )
    const checkDevice = () => {
        if (!Constants.isDevice) {
            const e = new Error(t('error.device'))
            e.name = 'device'
            throw e
        }
    }

    const checkNameAndDate = () => {
        console.log(date, name)
        if (isEmpty(name) || isEmpty(date)) {
            setErrorMessage(t('error.name-date'))
            const e = new Error(t('error.name-date'))
            e.name = 'Empty name and date of birth'
            throw e
        } else {
            setErrorMessage('')
        }
    }

    const getCameraPermission = async () => {
        const { status } = await Camera.requestPermissionsAsync()
        if (status === 'granted') {
            navigation.navigate(SCREEN.QR)
        } else {
            warnAlert(t('error.permission-deny-camera'), 'Camera Auth')
        }
    }

    const onConnectAndPrepare = async (peripheral) => {
        if (!isEmpty(peripheral)) {
            if (!connectionState) {
                try {
                    await BleManager.connect(peripheral)
                    await BleManager.retrieveServices(peripheral)
                    await BleManager.startNotification(
                        peripheral,
                        '0xFFF0',
                        '0xFFF2',
                    )
                    setConnectionState(true)
                    bleManagerEmitter.addListener(
                        'BleManagerDidUpdateValueForCharacteristic',
                        ({ value }) => {
                            // Convert bytes array to string
                            console.log(
                                `Recieved@@@ ${String.fromCharCode(...value)} `,
                            )
                            const { resourceKey, server } = qrValue
                            const param = {
                                empName: name,
                                empBirth: date,
                                connected: true,
                                fastened: !isEmpty(value)
                                    ? String.fromCharCode(...value)
                                    : null,
                            }
                            saveBluetooteData({
                                url: server,
                                resourceKey,
                                param,
                            })
                                .then((r) => {
                                    console.log('service Success', r)
                                })
                                .catch((e) => {
                                    warnAlert(t('error.server'), e)
                                })
                        },
                    )
                } catch (e) {
                    warnAlert(null, e)
                }
            } else {
                onDisconnect(qrValue)
            }
        } else {
            warnAlert()
        }
    }

    useEffect(() => {
        if (!qrErrorCheck(qrValue)) {
            onConnectAndPrepare(qrValue.uuid)
                .then(() => {
                    if (!connectionState) {
                        successAlert()
                    }
                })
                .catch((e) => {
                    warnAlert(null, 'e')
                })
        }
    }, [qrValue])

    useEffect(() => {
        BleManager.start({ showAlert: false })
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', () => {
            setConnectionState(false)
        })
        // bleManagerEmitter.addListener('BleManagerConnectPeripheral', (args) => {
        //     if (args && !isEmpty(args.peripheral)) {
        //         setConnectionState(true)
        //     }
        // })
        return () => {
            setConnectionState(false)
            onDisconnect(qrValue)
            bleManagerEmitter.removeListener(
                'BleManagerDisconnectPeripheral',
                () => {
                    setConnectionState(false)
                },
            )
            // bleManagerEmitter.removeListener(
            //     'BleManagerConnectPeripheral',
            //     () => {
            //         setConnectionState(false)
            //     },
            // )
        }
    }, [])

    return (
        <>
            <SInfoView>
                <SInfoDetailView>
                    <SText_label>
                        {t('common.name')}
                    </SText_label>
                    <Input
                        disabledInputStyle={{ background: '#ddd' }}
                        containerStyle={{
                            paddingHorizontal: 0,
                        }}
                        inputContainerStyle={{
                            backgroundColor: colorSet.primaryBg,
                            borderColor: 'transparent',
                            paddingHorizontal: 10,
                        }}
                        inputStyle={{
                            fontSize: fontSizeSet.sm,
                            color: colorSet.normalTextColor,
                        }}
                        errorMessage={errorMessage}
                        onChangeText={onChangeName}
                        clearButtonMode="always"
                        rightIcon={<Icon name="pencil" size={20} />}
                    />
                </SInfoDetailView>
                <SInfoDetailView>
                    <SText_label>
                        {t('common.date-of-birth')}
                    </SText_label>
                    <Input
                        disabledInputStyle={{ background: '#ddd' }}
                        containerStyle={{
                            paddingHorizontal: 0,
                        }}
                        inputContainerStyle={{
                            backgroundColor: colorSet.primaryBg,
                            borderColor: 'transparent',
                            paddingHorizontal: 10,
                        }}
                        inputStyle={{
                            fontSize: fontSizeSet.sm,
                            color: colorSet.normalTextColor,
                        }}
                        errorMessage={errorMessage}
                        onChangeText={onChangeDate}
                        clearButtonMode="always"
                        rightIcon={<Icon name="pencil" size={20} color={colorSet.normalTextColor} />}
                        placeholder="YY/MM/DD"
                    />
                </SInfoDetailView>
                <SInfoDetailView>
                    <SText_label>
                        {t('common.connection-status')}
                    </SText_label>
                    <SView_ConnectStateWrap connectionState>
                        <SText_ConnectState>{connectionState ? t('sensor.on') : t('sensor.off')}</SText_ConnectState>
                    </SView_ConnectStateWrap>
                </SInfoDetailView>
                <SInfoDetailView>
                    <SText_label>
                        {t('common.fail-safe')}
                    </SText_label>
                    <Text
                        style={{
                            textAlign: 'center',
                            fontSize: fontSizeSet.lg

                        }}
                    >
                        {safetySate}
                    </Text>
                </SInfoDetailView>
            </SInfoView>
            <SView_buttonGroup>
                <Button
                    buttonStyle={{ height: 50, fontSize: fontSizeSet.base, marginBottom: 15, backgroundColor: colorSet.primary }}
                    onPress={onConnect}
                    title={t('action.connection')}
                    disabled={connectionState}
                />
                <Button
                    type="outline"
                    buttonStyle={{ height: 50, fontSize: fontSizeSet.base, borderColor: colorSet.primary }}
                    titleStyle={{ color: colorSet.primary }}
                    onPress={() => {
                        onDisconnect(qrValue)
                    }}
                    title={t('action.disconnect')}
                    disabled={!connectionState}
                />
            </SView_buttonGroup>
        </>
    )
}

export default Bluetooth
