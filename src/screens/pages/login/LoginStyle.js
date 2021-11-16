import styled from 'styled-components/native'
import { Text } from 'react-native-elements'

import { fontSizeSet } from '../../../styles/size'
import { colorSet } from '../../../styles/colors'

export const SLoginContainerView = styled.View`
    padding: 40px 30px;
    background-color: ${colorSet.white};
`
SLoginContainerView.displayName = 'SLoginContainerView'

export const SLoginHeaderView = styled.View`
    justify-content: ${(props) =>
        props?.isButton ? 'space-between' : 'flex-end'};
`
SLoginHeaderView.displayName = 'SLoginHeaderView'

export const SLoginInfoText = styled(Text)`
    font-size: ${fontSizeSet.xxl}px;
    font-weight: bold;
    color: ${colorSet.normalTextColor};
    margin: 60px 0 20px;
`
SLoginInfoText.displayName = 'SLoginInfoText'

export const SLoginInfoView = styled.View``
SLoginInfoView.displayName = 'SLoginInfoView'
