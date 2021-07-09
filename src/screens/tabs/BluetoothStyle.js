import styled from 'styled-components/native'
import { Dimensions } from 'react-native'

const screenWidth = Dimensions.get('screen').width
export const S_BluetoothView = styled.View`
    height: 100%;
    width: ${screenWidth}px;
    background-color: #ffffff;
    align-items: center;
`
S_BluetoothView.displayName = 'S_BluetoothView'

export const SInfoView = styled.View`
    padding: 10px;
`

SInfoView.displayName = 'SInfoView'

export const SInfoDetailView = styled.View`
    flex: 1;
    flex-direction: row;
    align-items: center;
`

SInfoDetailView.displayName = 'SInfoDetailView'
