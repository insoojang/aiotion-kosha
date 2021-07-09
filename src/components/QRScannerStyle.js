import styled from 'styled-components/native'
import { fontSizeSet } from '../styles/size'
import { colorSet } from '../styles/colors'
import {
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions'

export const SQRView = styled.View`
    flex: 1;
    align-items: center;
`
SQRView.displayName = 'SQRView'

export const SView_QRScan = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    width: ${responsiveScreenWidth(100)}px;
    height: ${responsiveScreenHeight(100)}px;
`
SView_QRScan.displayname = 'SView_QRScan'

export const SQRSubscription = styled.Text`
    font-size: ${fontSizeSet.md}px;
    width: 70%;
    color: ${colorSet.white};
    text-align: center;
`
SQRSubscription.displayName = 'SQRSubscription'

export const SView_GuidLineWrapper = styled.View`
    margin-bottom: 25px;
    margin-top: 200px;
`
SView_GuidLineWrapper.displayname = 'SView_GuidLineWrapper'
