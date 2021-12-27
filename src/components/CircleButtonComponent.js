import React from 'react'
import {
    ToggleButtonContainer,
    ToggleButtonInner,
    ToggleButtonTitle,
} from './CircleButtonComponentStyle'
import PowerOff from '../../assets/powerOff.svg'
import { colorSet } from '../styles/colors'

const CircleButtonComponent = (props) => {
    const {
        title,
        titleStyle,
        buttonStyle,
        buttonInnerStyle,
        shape = 'circle',
        disabled,
        onToggle,
        isOn,
        width = 100,
        height = 100,
    } = props

    const powerStyle = (value) => {
        switch (true) {
            case value === true:
                return 'red'
            case value === false:
                return '#1ACA5C'
            default:
                return colorSet.exampleText
        }
    }
    return (
        <>
            <ToggleButtonContainer
                shape={shape}
                height={height}
                width={width}
                style={{
                    ...buttonStyle,
                }}
                onPress={onToggle}
                disabled={disabled}
            >
                <ToggleButtonInner
                    shape={shape}
                    width={width}
                    height={height}
                    isOn={isOn}
                    style={{
                        ...buttonInnerStyle,
                    }}
                >
                    <PowerOff
                        width={width - 90}
                        height={height - 90}
                        fill={
                            disabled ? colorSet.disableText : powerStyle(isOn)
                        }
                    />
                </ToggleButtonInner>
            </ToggleButtonContainer>
            <ToggleButtonTitle
                style={{
                    ...titleStyle,
                    color: disabled
                        ? colorSet.disableText
                        : colorSet.normalTextColor,
                }}
            >
                {title}
            </ToggleButtonTitle>
        </>
    )
}

export default CircleButtonComponent
