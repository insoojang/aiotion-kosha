import React, { useCallback, useEffect, useState } from 'react'
import {
    Alert,
    NativeEventEmitter,
    NativeModules,
    View as RNView,
} from 'react-native'
import { Button, Input, Text } from 'react-native-elements'
import BleManager from 'react-native-ble-manager'
import { useNavigation } from '@react-navigation/native'
import { i18nt as t } from '../../utils/i18n'
import { useDispatch, useSelector } from 'react-redux'
import { debounce, isEmpty } from 'lodash-es'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SInfoDetailView, SInfoView } from '../tabs/BluetoothStyle'
import Constants from 'expo-constants'
import { SCREEN } from '../../navigation/constants'
import { Camera } from 'expo-camera'
import { clearUuid } from '../../redux/reducers'
import { qrErrorCheck } from '../../utils/common'
import { saveBluetooteData } from '../../service/api/bluetooth.service'

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
        <RNView>
            <SInfoView>
                <SInfoDetailView>
                    <Text style={{ flex: 2.9 }} h4>
                        {t('common.name')}
                    </Text>
                    <Input
                        containerStyle={{ flex: 8 }}
                        disabledInputStyle={{ background: '#ddd' }}
                        errorMessage={errorMessage}
                        onChangeText={onChangeName}
                        clearButtonMode="always"
                        rightIcon={<Icon name="pencil" size={20} />}
                    />
                </SInfoDetailView>
                <SInfoDetailView>
                    <Text style={{ flex: 4 }} h4>
                        {t('common.date-of-birth')}
                    </Text>
                    <Input
                        containerStyle={{ flex: 11 }}
                        disabledInputStyle={{ background: '#ddd' }}
                        errorMessage={errorMessage}
                        onChangeText={onChangeDate}
                        clearButtonMode="always"
                        rightIcon={<Icon name="pencil" size={20} />}
                        placeholder="YY/MM/DD"
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
                onPre
                onPress={onConnect}
                title={t('action.connection')}
                disabled={connectionState}
            />
            <Button
                buttonStyle={{ height: 50, marginHorizontal: 25 }}
                onPress={() => {
                    onDisconnect(qrValue)
                }}
                title={t('action.disconnect')}
                disabled={!connectionState}
            />
        </RNView>
    )
}

export default Bluetooth
