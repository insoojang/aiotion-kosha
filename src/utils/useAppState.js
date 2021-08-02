import { useEffect, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { isEmpty } from 'lodash-es'

export default function useAppState(initialState) {
    const [state, setState] = useState(
        !isEmpty(initialState) ? initialState : AppState.currentState,
    )

    useEffect(() => {
        AppState.addEventListener('change', setState)
        return () => AppState.removeEventListener('change', setState)
    }, [])

    return state
}
