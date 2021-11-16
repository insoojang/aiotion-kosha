import styled from 'styled-components/native'
import { Text } from 'react-native-elements'

export const SStateTextView = styled.View`
    justify-content: center;
    margin-bottom: 10px;
`
SStateTextView.displayName = 'SStateTextView'

export const SStateTextInnerView = styled.View`
    background-color: #ffebeb;
    border-color: #ffc2c2;
    border-width: 1px;
    width: 100%;
    padding: 10px;
    align-items: center;
    border-radius: 4px;
`
SStateTextInnerView.displayName = 'SStateTextInnerView'
