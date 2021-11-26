import { Alert } from 'react-native'
import { isEmpty } from 'lodash-es'
import { i18nt } from '../utils/i18n'

const SuccessAlert = (message) =>
    Alert.alert(
        !isEmpty(message) ? message : i18nt('action.connection-success'),
        '',
        [
            {
                text: i18nt('action.ok'),
            },
        ],
    )
const WarnAlert = ({ message, error, onPress }) => {
    if (error) {
        console.error('[ERROR] : warnAlert', error)
    }
    Alert.alert(
        !isEmpty(message) ? message : i18nt('action.connection-fail'),
        '',
        [
            {
                text: i18nt('action.ok'),
                onPress: () => {
                    if (onPress) {
                        onPress()
                    }
                },
            },
        ],
    )
}
export { SuccessAlert, WarnAlert }
