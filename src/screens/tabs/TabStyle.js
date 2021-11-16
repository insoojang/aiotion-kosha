import styled from 'styled-components/native'
import { Dimensions } from 'react-native'
import { Text } from 'react-native-elements'
import { fontSizeSet } from '../../styles/size'
import { colorSet } from '../../styles/colors'

const screenWidth = Dimensions.get('screen').width
export const SMainTabContainerView = styled.View`
    flex: 1;
    width: ${screenWidth}px;
`
SMainTabContainerView.displayName = 'SMainTabContainerView'

export const SCopyrightText = styled(Text)`
    text-align: center;
    font-size: ${fontSizeSet.xs}px;
    color: ${colorSet.disableText};
`
SCopyrightText.displayName = 'SCopyrightText'
