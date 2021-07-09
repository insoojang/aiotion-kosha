import { colorSet } from '../styles/colors'

export const TOAST_ERROR_CONFIG = {
    toastStyles: {
        bg: 'white',
        borderRadius: 5,
    },
    iconColor: 'red',
    iconName: 'info',
    closeButtonStyles: {
        px: 2,
        bg: 'transparent',
        borderRadius: 14,
    },
    closeIconColor: colorSet.normalTextColor,
    duration: 0,
    accentColor: 'red',
    position: 10,
}

export const TOAST_CLOSE_CONFIG = {
    toastStyles: {
        bg: 'transparent',
        borderRadius: 16,
        borderColor: 'transparent',
    },
    color: 'transparent',
    iconColor: 'transparent',
    iconName: 'info',
    closeButtonStyles: {
        px: 0,
        bg: 'transparent',
    },
    closeIconColor: 'transparent',
    hideAccent: true,
    duration: 100,
}

export const TOAST_SUCCESS_CONFIG = {
    toastStyles: {
        bg: 'white',
        borderRadius: 5,
    },
    iconColor: '#2fc9a3',
    iconName: 'check',
    closeButtonStyles: {
        px: 2,
        bg: 'transparent',
        borderRadius: 14,
    },
    closeIconColor: colorSet.normalTextColor,
    duration: 0,
    accentColor: '#2fc9a3',
    position: 10,
}
