import React from 'react'
import { SafeAreaView } from 'react-native'

import { SMainTabContainerView } from './TabStyle'
import { Main } from '../pages/main'


const MainTab = () => {
    return (
        <SMainTabContainerView>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                }}
            >
                <Main />
            </SafeAreaView>
        </SMainTabContainerView>
    )
}

export default MainTab
