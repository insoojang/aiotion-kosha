import React from 'react'
import Spinner from 'react-native-loading-spinner-overlay'
import {
    Keyboard,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native'
import { SInfoView } from '../tabs/BluetoothStyle'
import { colorSet } from '../../styles/colors'
import { responsiveHeight } from 'react-native-responsive-dimensions'
import { S_BarometerTabView } from '../tabs/BarometerStyle'

const BarometerComponent = () => {
    return (
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
                    <Spinner
                        visible={false}
                        // textContent={'체결여부 검사중'}
                        // overlayColor={'rgba(0, 0, 0, 0.7)'}
                        // textStyle={{ color: 'white' }}
                    />
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <SInfoView>
                            <Text>123</Text>
                        </SInfoView>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </ScrollView>
        </S_BarometerTabView>
    )
}

export default BarometerComponent
