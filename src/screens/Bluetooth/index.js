import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Keyboard, NativeEventEmitter, NativeModules, TouchableWithoutFeedback } from 'react-native'
import { Button, Input } from 'react-native-elements'
import BleManager from 'react-native-ble-manager'
import { useNavigation } from '@react-navigation/native'
import { i18nt } from '../../utils/i18n'
import { useDispatch, useSelector } from 'react-redux'
import { debounce, isEmpty } from 'lodash-es'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import {
    SInfoDetailView,
    SInfoView,
    SText_ConnectState,
    SText_Label,
    SView_ButtonGroup,
    SView_ConnectStateWrap,
    SView_ContractState,
    SView_ContractStateWrap,
} from '../tabs/BluetoothStyle'
import Constants from 'expo-constants'
import { SCREEN } from '../../navigation/constants'
import { Camera } from 'expo-camera'
import { clearUuid } from '../../redux/reducers'
import { fastenedMessage, qrErrorCheck } from '../../utils/common'
import { saveBluetooteData } from '../../service/api/bluetooth.service'
import { fontSizeSet } from '../../styles/size'
import { colorSet } from '../../styles/colors'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const Bluetooth = ({}) => {
    const [connectionState, setConnectionState] = useState(false)
    const [fastened, setFastened] = useState('-')
    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const qrValue = useSelector((state) => state.qr)
    const [fastenedTypes, setFastenedTypes] = useState({
        icon: 'account-hard-hat',
        color: '#ccc',
        borderColor: '#ccc',
        backgroundColor: 'rgba(204,204,204, 0.2)'
    })

    const typeOfFastened = (value) => {
        if (isEmpty(value)) {
            setFastenedTypes({...fastenedTypes})
        } else if(value === '11') {
            setFastenedTypes({icon: 'check-circle-outline', color: 'rgb(42 ,200, 63)', borderColor: 'rgba(42 ,200, 63, 0.2)', backgroundColor: 'rgba(42 ,200, 63, 0.1)'})
        } else if(value === '10') {
            setFastenedTypes({icon: 'alert-outline', color: 'rgba(245, 161, 77)', borderColor: 'rgba(245, 161, 77, 0.2)', backgroundColor: 'rgba(245, 161, 77, 0.1)'})
        } else if(value === '01' || value === '00') {
            setFastenedTypes({icon: 'block-helper', color: 'rgb(245, 95, 77)', borderColor: 'rgba(245, 95, 77, 0.2)', backgroundColor: 'rgba(245, 95, 77, 0.1)'})
        }
    }

    const warnAlert = (message, e) => {
        console.error('[ERROR]', e)
        return Alert.alert(
            !isEmpty(message) ? message : i18nt('action.connection-fail'),
            '',
            [
                {
                    text: i18nt('action.ok'),
                    onPress: () => {
                        setConnectionState(false)
                    },
                },
            ],
        )
    }

    const successAlert = (message) =>
        Alert.alert(
            !isEmpty(message) ? message : i18nt('action.connection-success'),
            '',
            [
                {
                    text: i18nt('action.ok'),
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
        debounce((peripheral, message) => {
            if (peripheral?.uuid) {
                BleManager.disconnect(peripheral.uuid)
                    .then(() => {
                        Alert.alert(
                            message || i18nt('action.disconnect-success'),
                            '',
                            [
                                {
                                    text: i18nt('action.ok'),
                                },
                            ],
                        )
                        dispatch(clearUuid())
                    })
                    .catch((e) => {
                        Alert.alert(i18nt('action.connection-fail'), '', [
                            {
                                text: i18nt('action.ok'),
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
            const e = new Error(i18nt('error.device'))
            e.name = 'device'
            throw e
        }
    }

    const checkNameAndDate = () => {
        if (isEmpty(name) || isEmpty(date)) {
            setErrorMessage(i18nt('error.name-date'))
            const e = new Error(i18nt('error.name-date'))
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
            warnAlert(i18nt('error.permission-deny-camera'), 'Camera Auth')
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
                    setFastened('01')
                    bleManagerEmitter.addListener(
                        'BleManagerDidUpdateValueForCharacteristic',
                        ({ value }) => {
                            // Convert bytes array to string
                            const { resourceId, server } = qrValue
                            //fastenedState :
                            // 11 : normal connection
                            // 10 : Abnormal connection
                            // 01 : disConnected
                            // 00 : disConnected
                            const fastenedState = !isEmpty(value)
                                ? String.fromCharCode(...value)
                                : '-'
                            setFastened(fastenedState)
                            const param = {
                                empName: name,
                                empBirth: date,
                                connected: true,
                                fastened: fastenedState,
                            }
                            saveBluetooteData({
                                url: server,
                                resourceId,
                                param,
                            })
                                .then((r) => {
                                    typeOfFastened(value)
                                    console.log('service Success', r)
                                })
                                .catch((e) => {
                                    onDisconnect(qrValue, i18nt('error.server'))
                                })
                        },
                    )
                } catch (e) {
                    onDisconnect(qrValue, i18nt('action.connection-fail'))
                }
                await BleManager.connect(peripheral)
                await BleManager.retrieveServices(peripheral)
                await BleManager.startNotification(
                    peripheral,
                    '0xFFF0',
                    '0xFFF2',
                )
                setFastened('01')
                bleManagerEmitter.addListener(
                    'BleManagerDidUpdateValueForCharacteristic',
                    ({ value }) => {
                        // Convert bytes array to string
                        const { resourceId, server } = qrValue
                        //fastenedState :
                        // 11 : normal connection
                        // 10 : Abnormal connection
                        // 01 : disConnected
                        // 00 : disConnected
                        const fastenedState = !isEmpty(value)
                            ? String.fromCharCode(...value)
                            : '-'
                        setFastened(fastenedState)
                        const param = {
                            empName: name,
                            empBirth: date,
                            connected: true,
                            fastened: fastenedState,
                        }
                        saveBluetooteData({
                            url: server,
                            resourceId,
                            param,
                        })
                            .then((r) => {
                                console.log('service Success', r)
                            })
                            .catch((e) => {
                                onDisconnect(qrValue, i18nt('error.server'))
                            })
                    },
                )
            } else {
                onDisconnect(qrValue)
            }
        } else {
            warnAlert()
        }
        if (isEmpty(peripheral) || connectionState) {
            warnAlert()
            return
        }

        try {
            await BleManager.connect(peripheral)
            await BleManager.retrieveServices(peripheral).then(async () => {
                setTimeout(
                    async () =>
                        await BleManager.startNotification(
                            peripheral,
                            Platform.OS === 'android' ? 'fff0' : '0xFFF0',
                            Platform.OS === 'android' ? 'fff2' : '0xFFF2',
                        ),
                    3000,
                )
            })
            setFastened('01')
            setConnectionState(true)
            successAlert()
            bleManagerEmitter.addListener(
                'BleManagerDidUpdateValueForCharacteristic',
                ({ value }) => {
                    // Convert bytes array to string
                    const { resourceId, server } = qrValue
                    //fastenedState :
                    // 11 : normal connection
                    // 10 : Abnormal connection
                    // 01 : disConnected
                    // 00 : disConnected
                    const fastenedState = !isEmpty(value)
                        ? String.fromCharCode(...value)
                        : '-'
                    setFastened(fastenedState)
                    const param = {
                        empName: name,
                        empBirth: date,
                        connected: true,
                        fastened: fastenedState,
                    }
                    saveBluetooteData({
                        url: server,
                        resourceId,
                        param,
                    })
                        .then((r) => {
                            typeOfFastened(fastenedState)
                            console.log('service Success', r)
                        })
                        .catch((e) => {
                            console.error(e)
                            onClear()
                            onDisconnect(qrValue, i18nt('error.server'))
                        })
                },
            )
        } catch (e) {
            console.error(e)
            onClear()
            onDisconnect(qrValue, i18nt('action.connection-fail'))
        }
    }

    const onDisconnectService = (value) => {
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', () => {
            onClear()
            const { resourceId, server } = value
            const param = {
                empName: name,
                empBirth: date,
                connected: false,
                fastened: '00',
            }
            saveBluetooteData({
                url: server,
                resourceId,
                param,
            })
                .then((r) => {
                    console.log('service Success', r)
                })
                .catch((e) => {
                    warnAlert(i18nt('action.connection-fail'), e)
                })
        })
    }

    useEffect(() => {
        if (!qrErrorCheck(qrValue)) {
            onConnectAndPrepare(qrValue.uuid)
                .then(() => {
                    if (!connectionState) {
                        setConnectionState(true)
                        successAlert()
                    }
                })
                .catch((e) => {
                    warnAlert(null, e)
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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SInfoView>
                    <SInfoDetailView>
                        <SText_Label>{i18nt('common.name')}</SText_Label>
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
                            placeholder={i18nt('common.enter-name')}
                            disabled={connectionState}
                            maxLength={10}
                        />
                    </SInfoDetailView>
                    <SInfoDetailView>
                        <SText_Label>
                            {i18nt('common.date-of-birth')}
                        </SText_Label>
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
                            onChangeText={(value) => {
                                onChangeDate(value)
                                if (value.length >= 6) {
                                    Keyboard.dismiss()
                                }
                            }}
                            clearButtonMode="always"
                            rightIcon={
                                <Icon
                                    name="pencil"
                                    size={20}
                                    color={colorSet.normalTextColor}
                                />
                            }
                            placeholder="YY/MM/DD"
                            disabled={connectionState}
                            keyboardType="numeric"
                            maxLength={7}
                        />
                    </SInfoDetailView>
                    <SInfoDetailView>
                        <SText_Label>
                            {i18nt('common.connection-status')}
                        </SText_Label>
                        <SView_ConnectStateWrap
                            connectionState={connectionState}
                        >
                            <SText_ConnectState>
                                {connectionState
                                    ? i18nt('sensor.on')
                                    : i18nt('sensor.off')}
                            </SText_ConnectState>
                        </SView_ConnectStateWrap>
                    </SInfoDetailView>
                    <SInfoDetailView>
                        <SText_Label>{i18nt('common.fail-safe')}</SText_Label>
                        <SView_ContractStateWrap borderColor={fastenedTypes.borderColor} backgroundColor={fastenedTypes.backgroundColor}>
                            <Icon name={fastenedTypes.icon} size={36} color={fastenedTypes.color}/>
                            <SView_ContractState>
                                {fastenedMessage(fastened)}
                            </SView_ContractState>
                        </SView_ContractStateWrap>
                    </SInfoDetailView>
                </SInfoView>
            </TouchableWithoutFeedback>

            <SView_ButtonGroup>
                <Button
                    buttonStyle={{
                        height: 50,
                        fontSize: fontSizeSet.base,
                        marginBottom: 15,
                        backgroundColor: colorSet.primary,
                    }}
                    onPress={onConnect}
                    title={i18nt('action.connection')}
                    disabled={connectionState}
                />
                <Button
                    type="outline"
                    buttonStyle={{
                        height: 50,
                        fontSize: fontSizeSet.base,
                        borderColor: colorSet.primary,
                    }}
                    titleStyle={{ color: colorSet.primary }}
                    onPress={() => {
                        onDisconnect(qrValue)
                    }}
                    title={i18nt('action.disconnect')}
                    disabled={!connectionState}
                />
            </SView_ButtonGroup>
        </>
    )
}

export default Bluetooth
