import { i18nt } from '../../utils/i18n'

const backgroundOptions = {
    taskName: i18nt('title.main'),
    taskTitle: i18nt('title.main'),
    taskDesc: i18nt('title.description'),
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#ff00ff',
    // linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
    parameters: {
        delay: 1000 * 60,
    },
}

export { backgroundOptions }
