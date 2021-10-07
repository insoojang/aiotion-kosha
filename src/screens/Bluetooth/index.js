import React, { useCallback, useEffect, useState } from 'react'
import {
    Alert,
    NativeEventEmitter,
    NativeModules,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native'
import { Button, Input } from 'react-native-elements'
import BleManager from 'react-native-ble-manager'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { debounce, isEmpty } from 'lodash-es'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Camera } from 'expo-camera'

import { i18nt } from '../../utils/i18n'
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
import { SCREEN } from '../../navigation/constants'
import { clearUuid } from '../../redux/reducers'
import {
    checkDevice,
    checkNotifyProperties,
    fastenedMessage,
    isEmptyASCII,
    qrErrorCheck,
    typeOfFastened,
} from '../../utils/common'
import {
    getFirmwareVersion,
    saveBluetooteData,
} from '../../service/api/bluetooth.service'
import { fontSizeSet } from '../../styles/size'
import { colorSet } from '../../styles/colors'
import Spinner from 'react-native-loading-spinner-overlay'
import useAppState from '../../utils/useAppState'
import BackgroundService from 'react-native-background-actions'
import { jsonParser, sensorDataParser } from '../../utils/parser'
import { successAlert, warnAlert } from './alert'
import { permissionsAndroid } from '../../utils/permissions'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const Bluetooth = () => {
    const [connectionState, setConnectionState] = useState(false)
    const [fastened, setFastened] = useState('-')
    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [bluetoothState, setBluetoothState] = useState(null)
    const [firmwareVersion, setFirmwareVersion] = useState(0)

    const dispatch = useDispatch()
    const navigation = useNavigation()
    const qrValue = useSelector((state) => state.qr)
    const qrValueRef = useRef()
    const appState = useAppState(null)
    const onClearNoti = async (peripheral) => {
        const info = await BleManager.retrieveServices(peripheral)
        const { status, characteristic, service } = checkNotifyProperties(info)
        await BleManager.stopNotification(peripheral, service, characteristic)
    }
    const onClear = () => {
        setLoading(false)
        setFastened(null)
        setConnectionState(false)
        BackgroundService.stop()
        bleManagerEmitter.removeAllListeners(
            'BleManagerDidUpdateValueForCharacteristic',
        )
        bleManagerEmitter.removeAllListeners('BleManagerDidUpdateState')
        // bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral')
    }
    const onAllClear = debounce(() => {
        const { ios, android } = qrValue
        const peripheral = Platform.OS === 'android' ? android : ios
        if (peripheral) {
            onClearNoti(peripheral).then(() => {
                onDisconnect()
                onClear()
            })
        } else {
            onDisconnect()
            onClear()
        }
        onDisconnectService()
    }, 200)
    const onConnect = debounce(() => {
        try {
            checkNameAndDate()
            checkDevice()
            getCameraPermission()
                .then(() => {
                    console.log('Success Camera Permission.')
                })
                .catch((e) => {
                    console.error('[ERROR] : getCameraPermission', e)
                })
        } catch (e) {
            console.error('[ERROR] : onConnect', e)
        }
    }, 200)

    const onDisconnect = useCallback(
        debounce((message) => {
            if (isEmpty(qrValueRef) || isEmpty(qrValueRef.current)) {
                return
            }
            const { ios, android } = qrValueRef?.current
            if (android && ios) {
                BleManager.disconnect(Platform.OS === 'android' ? android : ios)
                    .then(() => {
                        console.log('onDisconnect')
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
                        console.error('[Error] : BleManager.disconnect', e)
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
            warnAlert({
                message: i18nt('error.permission-deny-camera'),
                error: 'Camera Auth',
                state: setConnectionState,
            })
        }
    }

    const fetchBluetoothData = ({ server, resourceKey, param }) => {
        saveBluetooteData({
            url: server,
            resourceKey,
            param,
        })
            .then((r) => {
                console.log('service Success')
            })
            .catch((e) => {
                onAllClear()
                console.error(e)
            })
    }

    const fetchVersionData = (server) => {
        getFirmwareVersion(server)
            .then((response) => {
                if (response?.data?.version) {
                    setFirmwareVersion(response.data.version)
                } else {
                    warnAlert({ message: i18nt('error.firmware-version') })
                }
            })
            .catch((e) => {
                warnAlert({
                    message: i18nt('error.firmware-version'),
                    error: e,
                })
            })
    }

    const onDisconnectService = debounce(() => {
        if (isEmpty(qrValueRef) || isEmpty(qrValueRef.current)) {
            return
        }
        const { android, server } = qrValueRef?.current
        if (android && !isEmpty(server)) {
            const param = {
                empName: '-',
                empBirth: '-',
                connected: false,
                fastened: '00',
            }
            saveBluetooteData({
                url: server,
                resourceKey: android,
                param,
            })
                .then((r) => {
                    i18nt('action.disconnect-success')
                    console.log('onDisconnectService Success')
                })
                .catch((e) => {
                    warnAlert({
                        message: i18nt('action.connection-fail'),
                        error: e,
                        state: setConnectionState,
                    })
                })
        }
    }, 300)

    useEffect(() => {
        if (bluetoothState === 'off') {
            Alert.alert(i18nt('action.bluetooth-off'))
            onAllClear()
        }
        bleManagerEmitter.addListener('BleManagerDidUpdateState', (args) => {
            if (args?.state !== bluetoothState) {
                setBluetoothState(args.state)
            }
        })
    }, [bluetoothState])

    const debounceOnConnectAndPrepare = debounce((value) => {
        onConnectAndPrepare(value)
            .then((v) => {
                successAlert()
            })
            .catch((e) => {
                console.error(`[ERROR] : ${i18nt(`error.sensor-error-${e}`)}`)
                onAllClear()
            })
        setTimeout(() => {
            BleManager.isPeripheralConnected(value, []).then((state) => {
                setLoading(false)
                if (state === false && connectionState === false) {
                    warnAlert({
                        message: i18nt('action.connection-fail'),
                    })
                }
            })
        }, 5000)
    }, 200)
    useEffect(() => {
        if (!qrErrorCheck(qrValue)) {
            const { ios, android, server } = qrValue
            if (connectionState) {
                fetchVersionData(server)
            }
            const peripheral = Platform.OS === 'android' ? android : ios
            debounceOnConnectAndPrepare(peripheral)
        }
    }, [qrValue])

    //First Start Logic
    useEffect(() => {
        BleManager.start({ showAlert: false })
        BleManager.checkState()
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', () => {
            if (connectionState) {
                onAllClear()
            }
        })
        permissionsAndroid()
        return () => {
            onAllClear()
        }
    }, [])

    //Background mode
    React.useEffect(() => {
        if (!isEmpty(appState)) {
            if (
                appState === 'background' &&
                !isEmpty(fastened) &&
                (fastened === '10' || fastened === '11')
            ) {
                console.log('background Mode', fastened)
                // const sleep = (time) =>
                //     new Promise((resolve) => setTimeout(() => resolve(), time))
                // const { server, android } = qrValue
                // const param = {
                //     empName: name,
                //     empBirth: date,
                //     connected: true,
                //     fastened: fastened,
                //     battery: '125v',
                // }
                //
                // const backGroundTask = async (taskData) => {
                //     const { delay } = taskData
                //     //  background task 무한유지 로직
                //     for (let i = 0; BackgroundService.isRunning(); i++) {
                //         fetchBluetoothData({
                //             server,
                //             resourceKey: android,
                //             param,
                //         })
                //         await sleep(delay)
                //     }
                // }
                // BackgroundService.start(backGroundTask, backgroundOptions)
            } else {
                BackgroundService.stop()
            }
        }
    }, [appState])

    const onConnectAndPrepare = async (uuid) => {
        await BleManager.connect(uuid)
        const info = await BleManager.retrieveServices(uuid)
        const { status, characteristic, service } = checkNotifyProperties(info)

        if (status === 200) {
            setFastened('01')
            setConnectionState(true)
            qrValueRef.current = qrValue
            await BleManager.startNotification(uuid, service, characteristic)
            bleManagerEmitter.addListener(
                'BleManagerDidUpdateValueForCharacteristic',
                ({ value }) => {
                    const asciiCode = isEmptyASCII(value)

                    const result = JSON.stringify(
                        String.fromCharCode(...asciiCode),
                    )
                    // Convert bytes array to string
                    const { server, android } = qrValue
                    //fastenedState :
                    // 11 : normal connection
                    // 10 : Abnormal connection
                    // 01 : disConnected
                    // 00 : disConnected
                    const convertData = jsonParser(result)
                    console.log(convertData, '@@@@@@@@@@@@@@@@@@@@@')
                    const fastenedState = !isEmpty(result)
                        ? sensorDataParser(convertData)
                        : '-'
                    setFastened(fastenedState)
                    const param = {
                        empName: name,
                        empBirth: date,
                        connected: true,
                        fastened: fastenedState,
                        battery: convertData?.battery,
                    }
                    fetchBluetoothData({ server, resourceKey: android, param })
                },
            )
        }
    }

    return (
        <>
            <Spinner
                visible={loading}
                // textContent={'체결여부 검사중'}
                overlayColor={'rgba(0, 0, 0, 0.7)'}
                textStyle={{ color: 'white' }}
            />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SInfoView>
                    <SInfoDetailView>
                        <SText_Label>{i18nt('common.name')}</SText_Label>
                        <Input
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
                            returnKeyType="go"
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
                        <SView_ContractStateWrap
                            borderColor={typeOfFastened(fastened).borderColor}
                            backgroundColor={
                                typeOfFastened(fastened).backgroundColor
                            }
                        >
                            <Icon
                                name={typeOfFastened(fastened).icon}
                                size={36}
                                color={typeOfFastened(fastened).color}
                            />
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
                    onPress={onAllClear}
                    title={i18nt('action.disconnect')}
                    disabled={!connectionState}
                />
            </SView_ButtonGroup>
        </>
    )
}

export default Bluetooth
