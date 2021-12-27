import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    Alert,
    Keyboard,
    NativeModules,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
} from 'react-native'
import NativeEventEmitter from 'react-native/Libraries/EventEmitter/NativeEventEmitter'
import { Camera } from 'expo-camera'
import { useNavigation } from '@react-navigation/native'
import BleManager from 'react-native-ble-manager'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import BackgroundService from 'react-native-background-actions'
import { Audio } from 'expo-av'
import { debounce, isEmpty } from 'lodash-es'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Spinner from 'react-native-loading-spinner-overlay'
import { Barometer } from 'expo-sensors'

import ButtonGroup from '../../../components/ButtonGroup'
import { i18nt } from '../../../utils/i18n'
import StateBar from '../../../components/StateBar'
import { SButtongroupContainerView } from '../../../components/ButtonGroupStyle'
import { Divider } from 'react-native-elements'
import { permissionsAndroid } from '../../../utils/permissions'
import { SCREEN } from '../../../navigation/constants'
import { SuccessAlert, WarnAlert } from '../../../components/Alerts'
import {
    SView_ContractState,
    SInfoDetailView,
    SInfoView,
    SText_Label,
    SText_ConnectState,
    SView_ConnectStateWrap,
    SView_ContractStateWrap,
    SView_ButtonGroup,
} from './MainStyle'
import {
    checkDevice,
    checkNotifyProperties,
    fastenedMessage,
    isEmptyASCII,
    qrErrorCheck,
    typeOfFastened,
} from '../../../utils/common'
import { clearUuid } from '../../../redux/reducers'
import { saveBluetoothData } from '../../../service/api/bluetooth.service'
import { useDispatch, useSelector } from 'react-redux'
import useAppState from '../../../utils/useAppState'
import { jsonParser, sensorDataParser } from '../../../utils/parser'
import { delayFunction, launchFunction, sensorErrorAlert } from './func'
import CircleButtonComponent from '../../../components/CircleButtonComponent'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const Main = () => {
    const [bluetoothState, setBluetoothState] = useState(null)
    const [serverConnectionStatus, setServerConnectionStatus] = useState(false)
    const [fastened, setFastened] = useState('-')
    const [loading, setLoading] = useState(false)
    const [timeoutCount, setTimeoutCount] = useState(0)
    const [soundState, setSoundState] = React.useState()
    const [soundPlay, setSoundPlay] = React.useState(false)
    const [workStatus, setWorkStatus] = React.useState(false)
    const [barometerData, setBarometerData] = React.useState(0)

    const navigation = useNavigation()
    const dispatch = useDispatch()
    const qrValue = useSelector((state) => state.qr)
    const qrValueRef = useRef()
    const appState = useAppState(null)
    const timerRef = useRef(null)
    const workStatusRef = useRef(null)
    const barometerRef = useRef(0)

    const buttonGroupList = [
        {
            title: i18nt('action.connection'),
            icon: 'access-point',
            disabled: serverConnectionStatus,

            event: () => {
                onConnect()
            },
            // route: SCREEN.Scan,
        },
        {
            title: i18nt('action.disconnect'),
            icon: 'stop',
            disabled: !serverConnectionStatus,
            event: () => {
                setLoading(true)
                onAllClear()
            },
        },
    ]

    const clearBluetoothDataTimer = () => {
        if (timerRef?.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    const onClearNoti = async (peripheral) => {
        const info = await BleManager.retrieveServices(peripheral)
        const { characteristic, service } = checkNotifyProperties(info)
        await BleManager.stopNotification(peripheral, service, characteristic)
        console.log('stopNotification')
    }

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
                .then(() => {
                    console.log('onDisconnectService Success')
                })
                .catch((e) => {
                    console.log('[disconnect Error]', e)
                    WarnAlert({
                        message: i18nt('action.connection-fail'),
                        error: e,
                        onPress: () => {
                            setServerConnectionStatus(false)
                        },
                    })
                })
        }
    }, 300)

    const onClear = () => {
        setLoading(false)
        setFastened(null)
        setServerConnectionStatus(false)
        setWorkStatus(false)
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

    const onAllClear = debounce(async () => {
        const { ios, android } = qrValue
        const peripheral = Platform.OS === 'android' ? android : ios
        if (peripheral) {
            const isPeripheralConnected = await BleManager.isPeripheralConnected(
                peripheral,
                [],
            )
            if (isPeripheralConnected) {
                try {
                    await onClearNoti(peripheral)
                    await onDisconnect()
                } catch (e) {
                    console.error('[ERROR] onAllClear : ', e)
                }
                console.log('isPeripheralConnected')
            }
            onDisconnectService()
        }
        delayFunction().then(() => {
            onClear()
        })
    }, 200)

    const onConnect = debounce(() => {
        try {
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

    const getCameraPermission = async () => {
        const { status } = await Camera.requestPermissionsAsync()
        if (status === 'granted') {
            navigation.navigate(SCREEN.Scan)
        } else {
            WarnAlert({
                message: i18nt('error.permission-deny-camera'),
                error: 'Camera Auth',
                // state: setServerConnectionStatus,
            })
        }
    }

    useEffect(() => {
        bleManagerEmitter.addListener('BleManagerDidUpdateState', (args) => {
            if (args?.state !== bluetoothState) {
                setBluetoothState(args.state)
            }
        })
    }, [bluetoothState])

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

    const onConnectAndPrepare = async (uuid) => {
        const { sound } = await Audio.Sound.createAsync(
            require('../../../../assets/alarm_sound.mp3'),
        )
        setSoundState(sound)
        const jsonValue = await AsyncStorage.getItem('@userData')
        const { name, birth } = jsonValue !== {} ? JSON.parse(jsonValue) : {}
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
                'Notify',
            )
            const writeProperties = checkNotifyProperties(info, 'Write')
            if (status === 200) {
                setFastened('01')
                setServerConnectionStatus(true)
                qrValueRef.current = qrValue
                await BleManager.startNotification(
                    uuid,
                    service,
                    characteristic,
                )
                const fastenedQueue = []

                clearBluetoothDataTimer()
                timerRef.current = setInterval(() => {
                    BleManager.write(
                        uuid,
                        writeProperties.service,
                        writeProperties.characteristic,
                        [104, 101, 97, 108, 116, 104],
                    )
                        .then(() => {
                            // Success code
                            console.log('WriteSuccess')
                        })
                        .catch((error) => {
                            // Failure code
                            console.log(error)
                        })
                }, 5000)

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
                            empBirth: birth,
                            connected: true,
                            fastened: fastenedState,
                            battery: convertData?.battery,
                            work: workStatusRef.current
                                ? 'work_start'
                                : 'work_stop',
                            atm: barometerRef.current,
                        }
                        saveBluetoothData({
                            url: server,
                            resourceKey: android,
                            param,
                        })
                            .then(() => {
                                console.log('service Success')
                            })
                            .catch((e) => {
                                onAllClear()
                                console.error(e)
                            })
                    },
                )
            }
        }
    }
    const onTriplePress = () => {
        setTimeoutCount(timeoutCount + 1)
        if (timeoutCount > 1) {
            setTimeoutCount(0)
        }
    }
    const debounceOnConnectAndPrepare = debounce((value) => {
        onConnectAndPrepare(value)
            .then(() => {
                SuccessAlert()
                if (timeoutCount > 1) {
                    setTimeoutCount(0)
                }
                setLoading(false)
            })
            .catch((e) => {
                sensorErrorAlert(e, timeoutCount, onTriplePress)
                onAllClear()
            })
    }, 200)

    useEffect(() => {
        if (workStatusRef.current !== workStatus) {
            workStatusRef.current = workStatus
        }
    }, [workStatus])
    useEffect(() => {
        if (barometerRef.current !== barometerData) {
            barometerRef.current = barometerData
        }
    }, [barometerData])

    useEffect(() => {
        if (!qrErrorCheck(qrValue)) {
            const { ios, android } = qrValue
            //TODO DFU
            // if (serverConnectionStatus) {
            //     fetchVersionData(server)
            // }
            const peripheral = Platform.OS === 'android' ? android : ios
            debounceOnConnectAndPrepare(peripheral)
        }
    }, [qrValue])

    useEffect(() => {
        BleManager.start({ showAlert: false })
        BleManager.checkState()
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', () => {
            // if (serverConnectionStatus) {
            onAllClear()
            // }
        })
        Barometer.setUpdateInterval(10000)
        if (!Barometer.hasListeners()) {
            Barometer.addListener(({ pressure }) => {
                setBarometerData(pressure?.toFixed(3))
            })
        }
        permissionsAndroid()
        return () => {
            Barometer.removeAllListeners()
            // onAllClear()
        }
    }, [])

    //Background mode
    useEffect(() => {
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

    return (
        <>
            <Spinner
                visible={loading}
                // textContent={'체결여부 검사중'}
                overlayColor={'rgba(0, 0, 0, 0.7)'}
                textStyle={{ color: 'white' }}
            />
            <SButtongroupContainerView>
                <ButtonGroup groupList={buttonGroupList} />
            </SButtongroupContainerView>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <SInfoView>
                        {bluetoothState === null || bluetoothState === 'off' ? (
                            <StateBar title={i18nt('alarm.bluetooth-off')} />
                        ) : null}
                        <Divider />
                        <SInfoDetailView>
                            <SText_Label>
                                {i18nt('common.connection-status')}
                            </SText_Label>
                            <SView_ConnectStateWrap
                                status={serverConnectionStatus}
                            >
                                <SText_ConnectState>
                                    {serverConnectionStatus
                                        ? i18nt('sensor.on')
                                        : i18nt('sensor.off')}
                                </SText_ConnectState>
                            </SView_ConnectStateWrap>
                            <SInfoDetailView>
                                <SText_Label>
                                    {i18nt('common.fail-safe')}
                                </SText_Label>
                                <SView_ContractStateWrap
                                    borderColor={
                                        typeOfFastened(fastened).borderColor
                                    }
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
                        </SInfoDetailView>
                    </SInfoView>
                </ScrollView>
            </TouchableWithoutFeedback>
            <SView_ButtonGroup>
                {/*<Button*/}
                {/*    buttonStyle={{*/}
                {/*        height: 50,*/}
                {/*        fontSize: fontSizeSet.base,*/}
                {/*        marginBottom: 15,*/}
                {/*        backgroundColor: colorSet.primary,*/}
                {/*    }}*/}
                {/*    title={*/}
                {/*        workStatus ? i18nt('work.stop') : i18nt('work.start')*/}
                {/*    }*/}
                {/*    disabled={!serverConnectionStatus}*/}
                {/*    onPress={() => {*/}
                {/*        setWorkStatus(!workStatus)*/}
                {/*    }}*/}
                {/*/>*/}
                <CircleButtonComponent
                    width={180}
                    height={180}
                    isOn={workStatus}
                    disabled={!serverConnectionStatus}
                    onToggle={() => {
                        setWorkStatus(!workStatus)
                    }}
                    titleStyle={{ fontSize: 23 }}
                    title={
                        workStatus ? i18nt('work.stop') : i18nt('work.start')
                    }
                />
            </SView_ButtonGroup>
        </>
    )
}

export default Main
