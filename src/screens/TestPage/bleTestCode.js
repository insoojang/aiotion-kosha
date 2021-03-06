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
    saveBluetoothData,
} from '../../service/api/bluetooth.service'
import { fontSizeSet } from '../../styles/size'
import { colorSet } from '../../styles/colors'
import Spinner from 'react-native-loading-spinner-overlay'
import useAppState from '../../utils/useAppState'
import BackgroundService from 'react-native-background-actions'
import { jsonParser, sensorDataParser } from '../../utils/parser'
import { successAlert, warnAlert } from './alert'
import { permissionsAndroid } from '../../utils/permissions'
import { Audio } from 'expo-av'

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
    const [timeoutCount, setTimeoutCount] = useState(0)
    const [soundState, setSoundState] = React.useState()
    const [soundPlay, setSoundPlay] = React.useState(false)
    const timerRef = useRef(null)

    const dispatch = useDispatch()
    const navigation = useNavigation()
    const qrValue = useSelector((state) => state.qr)
    const qrValueRef = useRef()
    const appState = useAppState(null)

    const clearBluetoothDataTimer = () => {
        if (timerRef?.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

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
        clearBluetoothDataTimer()
        bleManagerEmitter.removeAllListeners(
            'BleManagerDidUpdateValueForCharacteristic',
        )
        bleManagerEmitter.removeAllListeners('BleManagerDidUpdateState')
        if (!isEmpty(soundState)) {
            soundState.unloadAsync().then(() => {
                console.log('sound unloadAsync')
            })
        }
        // bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral')
    }

    const onTriplePress = () => {
        setTimeoutCount(timeoutCount + 1)
        if (timeoutCount > 1) {
            setTimeoutCount(0)
        }
    }

    const onAllClear = debounce(async () => {
        const { ios, android } = qrValue
        const peripheral = Platform.OS === 'android' ? android : ios
        const test = await BleManager.isPeripheralConnected(peripheral, [])
        if (peripheral) {
            const isPeripheralConnected = await BleManager.isPeripheralConnected(
                peripheral,
                [],
            )
            if (isPeripheralConnected) {
                await onClearNoti(peripheral)
                onDisconnect()
            }
            onDisconnectService()
        }
        delayFunction().then(() => {
            onClear()
        })
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
        saveBluetoothData({
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
            saveBluetoothData({
                url: server,
                resourceKey: android,
                param,
            })
                .then((r) => {
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
                if (timeoutCount > 1) {
                    setTimeoutCount(0)
                }
                setLoading(false)
            })
            .catch((e) => {
                if (e === '408') {
                    warnAlert({
                        message: i18nt(`error.sensor-error-${e}`),
                        content:
                            timeoutCount === 2
                                ? i18nt(`action.bluetooth-reset`)
                                : '',
                        state: onTriplePress(),
                    })
                } else if (e === '404' || e === '500') {
                    warnAlert({
                        message: i18nt(`error.sensor-error-${e}`),
                    })
                } else {
                    warnAlert({
                        message: i18nt(`action.connection-fail`),
                    })
                }
                console.error(`[ERROR] : ${i18nt(`error.sensor-error-${e}`)}`)
                onAllClear()
            })
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
                //     //  background task ???????????? ??????
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
    const launchFunction = async (promise) => {
        let timerId = null

        clearTimeout(timerId)
        let timeout = new Promise((resolve, reject) => {
            timerId = setTimeout(() => {
                reject('408')
            }, 5000)
        })

        return Promise.race([promise(), timeout])
    }

    const delayFunction = async () => {
        let closeTimerId = null

        return new Promise((resolve) => {
            closeTimerId = setTimeout(() => {
                resolve()
            }, 3000)
        })
    }

    const onConnectAndPrepare = async (uuid) => {
        const { sound } = await Audio.Sound.createAsync(
            require('../../../assets/alarm_sound.mp3'),
        )
        setSoundState(sound)

        const clearConnect = await BleManager.isPeripheralConnected(uuid, [])
        if (clearConnect) {
            await BleManager.disconnect(uuid)
        }
        setLoading(true)
        await launchFunction(() => BleManager.connect(uuid))
        const isPeripheralConnected = await BleManager.isPeripheralConnected(
            uuid,
            [],
        )
        if (isPeripheralConnected) {
            const info = await BleManager.retrieveServices(uuid)
            const { status, characteristic, service } = checkNotifyProperties(
                info,
            )
            if (status === 200) {
                setFastened('01')
                setConnectionState(true)
                qrValueRef.current = qrValue
                await BleManager.startNotification(
                    uuid,
                    service,
                    characteristic,
                )
                const fastenedQueue = []

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
                        const fastenedState = !isEmpty(result)
                            ? sensorDataParser(convertData)
                            : '-'
                        setFastened(fastenedState)
                        console.log(convertData, '@@@@@@@@@@@@@@@@@')
                        if (fastenedQueue.length > 2) {
                            fastenedQueue.shift()
                            fastenedQueue.push(fastenedState)
                        } else {
                            fastenedQueue.push(fastenedState)
                        }

                        if (fastenedState === '10') {
                            if (
                                !soundPlay &&
                                fastenedQueue.every((v) => v === '10')
                            ) {
                                playSound(sound)
                            } else {
                                stopSound(sound)
                            }
                        }

                        if (fastenedState !== '10' || !isEmpty(sound)) {
                            stopSound(sound)
                        }
                        const param = {
                            empName: name,
                            empBirth: date,
                            connected: true,
                            fastened: fastenedState,
                            battery: convertData?.battery,
                        }
                        fetchBluetoothData({
                            server,
                            resourceKey: android,
                            param,
                        })
                    },
                )
            }
        }
    }
    const playSound = async (sound) => {
        if (!soundPlay) {
            setSoundPlay(true)

            await sound?.setIsLoopingAsync(true)
            await sound?.playAsync()
        }
    }
    const stopSound = async (sound) => {
        await sound?.stopAsync()
        setSoundPlay(false)
    }
    return (
        <>
            <Spinner
                visible={loading}
                // textContent={'???????????? ?????????'}
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
                    onPress={() => {
                        setLoading(true)
                        onAllClear()
                    }}
                    title={i18nt('action.disconnect')}
                    disabled={!connectionState}
                />
            </SView_ButtonGroup>
        </>
    )
}

export default Bluetooth
