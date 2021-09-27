import styled from 'styled-components/native'
import { Dimensions } from 'react-native'
import { fontSizeSet } from '../../styles/size'
import { colorSet } from '../../styles/colors'

const screenWidth = Dimensions.get('screen').width
export const S_BarometerTabView = styled.View`
    flex: 1;
    width: ${screenWidth}px;
`
S_BarometerTabView.displayName = 'S_BarometerTabView'
