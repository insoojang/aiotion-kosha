import styled from 'styled-components/native'
import { Dimensions } from 'react-native'
import { fontSizeSet } from '../../styles/size'
import { colorSet } from '../../styles/colors'

const screenWidth = Dimensions.get('screen').width
export const S_BluetoothView = styled.View`
  flex:1; 
  width: ${screenWidth}px;
`
S_BluetoothView.displayName = 'S_BluetoothView'

export const SInfoView = styled.View`
  flex: 1;
  padding: 30px 20px;
  justify-content: space-between;
`
SInfoView.displayName = 'SInfoView'

export const SInfoDetailView = styled.View``
SInfoDetailView.displayName = 'SInfoDetailView'

export const SText_label = styled.Text`
  margin-bottom: 10px;
  color: ${colorSet.normalTextColor};
  font-size: ${fontSizeSet.base}px;
  font-weight: bold;
`
SText_label.displayName = 'SText_label'

export const SView_ConnectStateWrap = styled.View`
  border-width: 1px;
  border-color: ${(prop) => prop.connectionState ? 'rgba(77, 245, 11, 0.2)': 'rgba(245, 95, 77, 0.2)'};
  border-radius: 4px;
  background: ${(prop) => prop.connectionState ? 'rgba(77, 245, 11, 0.1)' : 'rgba(245, 95, 77, 0.1)'};
`
SView_ConnectStateWrap.displayName = 'SView_ConnectStateWrap'

export const SText_ConnectState = styled.Text`
  padding: 10px;
  color: ${colorSet.normalTextColor};
  text-align: center;
  font-size: ${fontSizeSet.base}px;
`
SText_ConnectState.displayName = 'SText_ConnectState'

export const SView_buttonGroup = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 20px;

`
SView_buttonGroup.displayName = 'SView_buttonGroup'
