import styled from 'styled-components/native'
import { fontSizeSet } from '../../../styles/size'
import { colorSet } from '../../../styles/colors'
import { Text } from 'react-native-elements'

export const SSensorListTitleContainerView = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
`
SSensorListTitleContainerView.displayName = 'SSensorListTitleContainerView'

export const SSensorListTitleView = styled(Text)`
    font-size: ${fontSizeSet.base}px;
    font-weight: bold;
    color: ${colorSet.normalTextColor};
    margin-right: 10px;
`
SSensorListTitleView.displayName = 'SSensorListTitleView'

export const SInfoView = styled.View`
    padding: 10px 20px;
    justify-content: space-between;
`
SInfoView.displayName = 'SInfoView'

export const SInfoDetailView = styled.View``
SInfoDetailView.displayName = 'SInfoDetailView'

export const SText_Label = styled.Text`
    margin: 10px 0;
    color: ${colorSet.normalTextColor};
    font-size: ${fontSizeSet.base}px;
    font-weight: bold;
`
SText_Label.displayName = 'SText_Label'

export const SText_ConnectState = styled.Text`
    padding: 10px;
    color: ${colorSet.normalTextColor};
    text-align: center;
    font-size: ${fontSizeSet.base}px;
`
SText_ConnectState.displayName = 'SText_ConnectState'

export const SView_ConnectStateWrap = styled.View`
    border-width: 1px;
    border-color: ${(prop) =>
        prop.status ? 'rgba(77, 245, 11, 0.2)' : 'rgba(245, 95, 77, 0.2)'};
    border-radius: 4px;
    background: ${(prop) =>
        prop.status ? 'rgba(77, 245, 11, 0.1)' : 'rgba(245, 95, 77, 0.1)'};
`
SView_ConnectStateWrap.displayName = 'SView_ConnectStateWrap'

export const SView_ContractStateWrap = styled.View`
    align-items: center;
    padding: 10px;
    border-width: 1px;
    border-radius: 4px;
    border-color: ${(props) => props.borderColor};
    background: ${(props) => props.backgroundColor};
`
SView_ContractStateWrap.displayName = 'SView_ContractStateWrap'

export const SView_ContractState = styled.Text`
    text-align: center;
    font-size: ${fontSizeSet.base}px;
`
SView_ContractState.displayName = 'SView_ContractState'

export const SView_ButtonGroup = styled.View`
    flex: 10;
    justify-content: center;
    align-items: center;
    margin-bottom: 70px;
`
SView_ButtonGroup.displayName = 'SView_ButtonGroup'
