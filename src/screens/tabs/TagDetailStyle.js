import styled from 'styled-components/native'
import { Dimensions } from 'react-native'
import { fontSizeSet } from '../../styles/size'
import { Text } from 'react-native-elements'

const screenWidth = Dimensions.get('screen').width
export const S_TagDetailView = styled.View`
    height: 100%;
    width: ${screenWidth}px;
    background-color: #ffffff;
    align-items: center;
`
S_TagDetailView.displayName = 'S_TagDetailView'
