import React, { useRef, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'
import {
    SQRSubscription,
    SQRView,
    SView_GuidLineWrapper,
} from './QRScannerStyle'
import { i18nt as t } from '../utils/i18n'
import {
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions'
import { useNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { setUuid } from '../redux/reducers'
import { isEmpty } from 'lodash-es'
import { qrErrorCheck } from '../utils/common'

const QrScanner = () => {
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
                let parsingData = JSON.parse(JSON.parse(data))
                if (qrErrorCheck(parsingData)) {
                    throw new Error('QR Code not recognized.')
                }
                onConfirmSensor(parsingData)
            } catch (e) {
                Alert.alert(t('error.qr-recognize'), '', [
                    {
                        text: t('action.ok'),
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
        Alert.alert(t('action.sensor-select'), '', [
            {
                text: t('action.cancel'),
                style: 'cancel',
                onPress: () => {
                    setScanned(false)
                },
            },
            {
                text: t('action.ok'),
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
        <SQRView>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            <SView_GuidLineWrapper
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
            </SView_GuidLineWrapper>
            <SQRSubscription>{t('qr.subscription')}</SQRSubscription>
        </SQRView>
    )
}

export default QrScanner
