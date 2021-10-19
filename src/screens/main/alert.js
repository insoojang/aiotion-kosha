import { Alert } from 'react-native'
import { isEmpty } from 'lodash-es'
import { i18nt } from '../../utils/i18n'

const successAlert = (message) =>
    Alert.alert(
        !isEmpty(message) ? message : i18nt('action.connection-success'),
        '',
        [
            {
                text: i18nt('action.ok'),
            },
        ],
    )
const warnAlert = ({ message, error, state, content }) => {
    if (error) {
        console.error('[ERROR] : warnAlert', error)
    }
    Alert.alert(
        !isEmpty(message) ? message : i18nt('action.connection-fail'),
        content || '',
        [
            {
                text: i18nt('action.ok'),
                onPress: () => {
                    if (state) {
                        state(false)
                    }
                },
            },
        ],
    )
}
export { successAlert, warnAlert }
