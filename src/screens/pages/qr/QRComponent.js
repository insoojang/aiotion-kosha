import React, { useRef, useState } from 'react'
import { View, SafeAreaView, Alert, StyleSheet } from 'react-native'
import { isEmpty } from 'lodash-es'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { useNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import {
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions'

import {
    SGuidLineWrapperView,
    SQRSubscription,
    SQRView,
} from './QRComponentStyle'
import { i18nt } from '../../../utils/i18n'
import { jsonParser } from '../../../utils/parser'
import { qrErrorCheck } from '../../../utils/common'
import { SMainTabContainerView } from '../../tabs/TabStyle'
import { setUuid } from '../../../redux/reducers'

const QRComponent = () => {
    const [scanned, setScanned] = useState(false)
    const guidLineLayout = useRef({})
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const isScanArea = (cornerPoints) => {
        const guidLine = [
            {
                x: guidLineLayout.current.x,
                y: guidLineLayout.current.y,
            },
            {
                x: guidLineLayout.current.x + guidLineLayout.current.width,
                y: guidLineLayout.current.y,
            },
            {
                x: guidLineLayout.current.x + guidLineLayout.current.width,
                y: guidLineLayout.current.y + guidLineLayout.current.height,
            },
            {
                x: guidLineLayout.current.x,
                y: guidLineLayout.current.y + guidLineLayout.current.height,
            },
        ]

        return (
            cornerPoints[0].x > guidLine[0].x &&
            cornerPoints[0].y > guidLine[0].y &&
            cornerPoints[1].x < guidLine[1].x &&
            cornerPoints[1].y > guidLine[1].y &&
            cornerPoints[2].x < guidLine[2].x &&
            cornerPoints[2].y < guidLine[2].y &&
            cornerPoints[3].x > guidLine[3].x &&
            cornerPoints[3].y < guidLine[3].y
        )
    }

    const handleBarCodeScanned = (props, gallery) => {
        const { data, cornerPoints } = props
        if (!gallery && !isScanArea(cornerPoints)) {
            return
        }
        setScanned(true)
        if (!isEmpty(data)) {
            try {
                let parsingData = jsonParser(data)
                if (qrErrorCheck(parsingData)) {
                    throw new Error('QR Code not recognized.')
                }
                onConfirmSensor(parsingData)
            } catch (e) {
                Alert.alert(i18nt('error.qr-recognize'), '', [
                    {
                        text: i18nt('action.ok'),
                        onPress: () => {
                            setScanned(false)
                        },
                    },
                ])
                console.error('[ERROR]', e)
            }
        }
    }

    const onConfirmSensor = (value) => {
        Alert.alert(i18nt('action.sensor-select'), '', [
            {
                text: i18nt('action.cancel'),
                style: 'cancel',
                onPress: () => {
                    setScanned(false)
                },
            },
            {
                text: i18nt('action.ok'),
                onPress: () => {
                    try {
                        dispatch(setUuid(value))
                        navigation.goBack()
                    } catch (e) {
                        console.error('[ERROR]', e)
                    }
                },
            },
        ])
    }

    return (
        <SMainTabContainerView>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: '#000000',
                }}
            >
                <SQRView>
                    <BarCodeScanner
                        onBarCodeScanned={
                            scanned ? undefined : handleBarCodeScanned
                        }
                        style={StyleSheet.absoluteFillObject}
                    />
                    style={StyleSheet.absoluteFillObject}
                    />
                    <SGuidLineWrapperView
                        onLayout={(event) => {
                            guidLineLayout.current = event.nativeEvent.layout
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: 'white',
                                borderWidth: 1,
                                width: responsiveScreenWidth(47),
                                height: responsiveScreenHeight(21),
                            }}
                        />
                    </SGuidLineWrapperView>
                    <SQRSubscription>
                        {i18nt('qr.subscription')}
                    </SQRSubscription>
                </SQRView>
            </SafeAreaView>
        </SMainTabContainerView>
    )
}

export default QRComponent
