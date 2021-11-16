import styled from 'styled-components/native'
import { Text } from 'react-native-elements'
import { colorSet } from '../styles/colors'

export const SButtongroupContainerView = styled.View`
    margin: 15px;
    border-radius: 5px;
    background-color: ${colorSet.primary};
`
SButtongroupContainerView.displayName = 'SButtongroupContainerView'

export const SButtongroupView = styled.View`
    margin: 10px 0;
    padding: 0 5px;
    border-radius: 5px;
    flex-direction: row;
    justify-content: space-between;
`
SButtongroupView.displayName = 'SButtongroupView'

export const STextView = styled.View``
STextView.displayName = 'STextView'

export const STitleText = styled(Text)`
    font-size: 18px;
`
STitleText.displayName = 'STitleText'

export const SSubTitleText = styled(Text)``
SSubTitleText.displayName = 'SSubTitleText'
