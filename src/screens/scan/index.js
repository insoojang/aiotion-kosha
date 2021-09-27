import React, { useEffect, useState } from 'react'
import Spinner from 'react-native-loading-spinner-overlay'
import {
    Keyboard,
    NativeEventEmitter,
    NativeModules,
    Platform,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native'
import { SView_ButtonGroup } from '../tabs/BluetoothStyle'
import { colorSet } from '../../styles/colors'
import { responsiveHeight } from 'react-native-responsive-dimensions'
import { S_BarometerTabView } from '../tabs/BarometerStyle'
import { Button, ListItem, Text } from 'react-native-elements'
import { fontSizeSet } from '../../styles/size'
import { i18nt } from '../../utils/i18n'
import BleManager from 'react-native-ble-manager'
import { SScanView } from '../tabs/ScanStyle'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const ScanComponent = () => {
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(false)

    const peripherals = new Map()
    useEffect(() => {
        bleManagerEmitter.addListener(
            'BleManagerDiscoverPeripheral',
            (args) => {
                console.log(args, 'filst@@@')
                if (args && args.name?.startsWith('NKIA')) {
                    console.log('@@@@@@', args)
                    peripherals.set(args.id, args)
                    setList(Array.from(peripherals.values()))
                }
                // The id: args.id
                // The name: args.name
            },
        )
    }, [])

    return (
        <>
            <Spinner
                visible={loading}
                textContent={'Scanning...'}
                overlayColor={'rgba(0, 0, 0, 0.7)'}
                textStyle={{ color: 'white' }}
            />
            <S_BarometerTabView>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{
                        width: '100%',
                        backgroundColor: colorSet.white,
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{ height: responsiveHeight(100) - 91 }}
                    >
                        <Spinner visible={false} />
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <SScanView>
                                {list.length !== 0 ? (
                                    list.map((l, i) => (
                                        <ListItem key={i} bottomDivider>
                                            <ListItem.Content>
                                                <ListItem.Title>
                                                    {l.name}
                                                </ListItem.Title>
                                                <ListItem.Subtitle>
                                                    {`${
                                                        Platform.OS ===
                                                        'android'
                                                            ? 'Mac Address'
                                                            : 'ID'
                                                    } : ${l.id}`}
                                                </ListItem.Subtitle>
                                            </ListItem.Content>
                                        </ListItem>
                                    ))
                                ) : (
                                    <Text>NKIA Sensor not found</Text>
                                )}
                            </SScanView>
                        </TouchableWithoutFeedback>
                        <SView_ButtonGroup>
                            <Button
                                buttonStyle={{
                                    height: 50,
                                    fontSize: fontSizeSet.base,
                                    marginBottom: 15,
                                    backgroundColor: colorSet.primary,
                                }}
                                onPress={() => {
                                    BleManager.scan([], 10, true).then(() => {
                                        // Success code
                                        setLoading(true)
                                        console.log('Scan started')
                                    })
                                    setTimeout(() => {
                                        setLoading(false)
                                    }, 5000)
                                }}
                                title={'Scan'}
                            />
                        </SView_ButtonGroup>
                    </TouchableOpacity>
                </ScrollView>
            </S_BarometerTabView>
        </>
    )
}

export default ScanComponent
