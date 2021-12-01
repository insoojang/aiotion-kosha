import styled, { css } from 'styled-components/native'

import { Platform } from 'react-native'
import { colorSet } from '../styles/colors'
import { fontSizeSet } from '../styles/size'

export const ToggleButtonContainer = styled.TouchableOpacity`
    height: ${(props) => props.height}px;
    width: ${(props) => props.width}px;
    align-items: center;
    justify-content: center;
    font-size: ${fontSizeSet.base}px;
    background: ${colorSet.disableBg};
    border: 2px solid ${colorSet.white};
    border-radius: ${(props) =>
        props.shape === 'circle' ? `${props.width}px` : 0};
    ${Platform.select({
        ios: css`
            box-shadow: 0 0 5px #ccc;
        `,
        android: css`
            elevation: 5;
        `,
    })}
`
ToggleButtonContainer.displayName = 'ToggleButtonContainer'

export const ToggleButtonInner = styled.View.attrs((props) => ({
    borderRadius: props.shape === 'circle' ? 250 : 0,
    height: props.height - 30,
    width: props.width - 30,
    borderWidth: 1.5,
    borderColor: props.isOn ? '#ff8585' : '#87e3a6',
    shadowColor: props.isOn ? 'red' : '#1ACA5C',
    ...Platform.select({
        android: {
            elevation: 5,
        },
    }),
}))`
    align-items: center;
    justify-content: center;
    background: ${colorSet.white};
`
ToggleButtonInner.displayName = 'ToggleButtonInner'

export const ToggleButtonTitle = styled.Text`
    margin-top: 20px;
    font-size: ${fontSizeSet.base}px;
`
ToggleButtonTitle.displayName = 'ToggleButtonTitle'
