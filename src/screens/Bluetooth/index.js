import React, { useCallback, useEffect, useState } from 'react'
import {
    Alert,
    NativeEventEmitter,
    NativeModules,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    PermissionsAndroid,
    AppState,
} from 'react-native'
import { Button, Input } from 'react-native-elements'
import BleManager from 'react-native-ble-manager'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { debounce, isEmpty } from 'lodash-es'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Constants from 'expo-constants'
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
    fastenedMessage,
    qrErrorCheck,
    typeOfFastened,
} from '../../utils/common'
import { saveBluetooteData } from '../../service/api/bluetooth.service'
import { fontSizeSet } from '../../styles/size'
import { colorSet } from '../../styles/colors'
import Spinner from 'react-native-loading-spinner-overlay'
import useAppState from '../../utils/useAppState'
import * as TaskManager from 'expo-task-manager'
import { registerTaskAsync, unregisterTaskAsync } from 'expo-background-fetch'
import { BackgroundFetchResult } from 'expo-background-fetch/build/BackgroundFetch.types'
const BACKGROUND_FETCH_TASK = 'background-fetch'
const LAST_FETCH_DATE_KEY = 'background-fetch-date'

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
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const qrValue = useSelector((state) => state.qr)
    const qrValueRef = useRef()
    const timerRef = useRef(null)
    const appState = useAppState(null)

    const onClear = () => {
        setLoading(false)
        setFastened(null)
        setConnectionState(false)
        clearBluetoothDataTimer()
    }

    const warnAlert = (message, e) => {
        console.error('[ERROR] : warnAlert', e)
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
    const fetchBluetoothData = ({ server, resourceId, param }) => {
        saveBluetooteData({
            url: server,
            resourceId,
            param,
        })
            .then((r) => {
                console.log('service Success', r)
            })
            .catch((e) => {
                console.error(e)
                onDisconnect(i18nt('error.server'))
                onClear()
            })
    }

    const clearBluetoothDataTimer = () => {
        if (timerRef?.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    const onConnectAndPrepare = async (peripheral) => {
        if (isEmpty(peripheral) || connectionState) {
            setLoading(false)
            // warnAlert()
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
            qrValueRef.current = qrValue
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
                    fetchBluetoothData({ server, resourceId, param })
                    clearBluetoothDataTimer()
                    timerRef.current = setInterval(() => {
                        fetchBluetoothData({ server, resourceId, param })
                    }, 1000 * 60)
                },
            )
        } catch (e) {
            console.error(e)
            setLoading(false)

            // onDisconnect(qrValue, i18nt('action.connection-fail'))
            // onClear()
        }
    }

    const onDisconnectService = () => {
        onClear()
        const { resourceId, server } = qrValueRef?.current
        if (resourceId && !isEmpty(server)) {
            const param = {
                empName: '-',
                empBirth: '-',
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
        }
    }
    useEffect(() => {
        if (bluetoothState === 'off') {
            Alert.alert(i18nt('action.bluetooth-off'))
        }
        bleManagerEmitter.addListener('BleManagerDidUpdateState', (args) => {
            setBluetoothState(args.state)
            // The new state: args.state
        })
    }, [bluetoothState])

    useEffect(() => {
        if (!qrErrorCheck(qrValue)) {
            const { ios, android } = qrValue
            setLoading(true)
            onConnectAndPrepare(Platform.OS === 'android' ? android : ios)
                .then(() => {
                    setLoading(false)
                })
                .catch((e) => {
                    console.error(e)
                    onDisconnect(i18nt('action.connection-fail'))
                    onClear()
                })
        }
    }, [qrValue])

    useEffect(() => {
        BleManager.start({ showAlert: false })
        BleManager.checkState()
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', () => {
            onDisconnectService()
        })
        AppState.addEventListener('change', (state) => {
            console.log('Change State----', state)
            console.log('AppState.currentState----', AppState.currentState)
        })

        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ).then((result) => {
                if (result) {
                    console.log('Permission is OK')
                } else {
                    PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    ).then((result) => {
                        if (result) {
                            console.log('User accept')
                        } else {
                            console.log('User refuse')
                        }
                    })
                }
            })
        }
        return () => {
            onDisconnect()
            onClear()
            bleManagerEmitter.removeListener(
                'BleManagerDisconnectPeripheral',
                () => {
                    onDisconnectService()
                },
            )
        }
    }, [])

    // const checkStatusAsync = async () => {
    //     const status = await getStatusAsync()
    //     const isRegistered = await TaskManager.isTaskRegisteredAsync(
    //         BACKGROUND_FETCH_TASK,
    //     )
    // }
    //
    // TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    //     const now = Date.now()
    //
    //     console.log(
    //         `Got background fetch call at date: ${new Date(now).toISOString()}`,
    //     )
    //
    //     return BackgroundFetchResult.NewData
    // })
    //
    // useEffect(() => {
    //     if (appState === 'active') {
    //         console.log('active--------------', appState)
    //         TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK).then(
    //             async (isRegistered) => {
    //                 if (isRegistered) {
    //                     await unregisterTaskAsync(BACKGROUND_FETCH_TASK)
    //                 } else {
    //                     console.log('@@@@@@@@@@@@@@@@@@@@@@@@@')
    //                     await registerTaskAsync(BACKGROUND_FETCH_TASK, {
    //                         minimumInterval: 60, // 1 minute
    //                         stopOnTerminate: false,
    //                         startOnBoot: true,
    //                     })
    //                 }
    //                 console.log('isRegistered-----------------', isRegistered)
    //             },
    //         )
    //         // refreshLastFetchDateAsync()
    //     }
    // }, [appState])
    return (
        <>
            <Spinner visible={loading} />
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
                        onDisconnect()
                        onClear()
                    }}
                    title={i18nt('action.disconnect')}
                    disabled={!connectionState}
                />
            </SView_ButtonGroup>
        </>
    )
}

export default Bluetooth
