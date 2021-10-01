import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { SCREEN } from './constants'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { BluetoothTab } from '../screens/tabs'
import { NavigationContainer } from '@react-navigation/native'
import QrScanner from '../components/QRScanner'
import { colorSet } from '../styles/colors'

const BottomTabStack = createMaterialTopTabNavigator()
const MainStack = createStackNavigator()
const RootStack = createStackNavigator()

const MainNavigation = () => {
    return (
        <MainStack.Navigator headerMode="none">
            <BottomTabStack.Screen
                name={SCREEN.Bluetooth}
                component={BluetoothTab}
            />
        </MainStack.Navigator>
    )
}
const RootNavigation = () => {
    return (
        <RootStack.Navigator mode="modal">
            <RootStack.Screen
                name={SCREEN.Main}
                component={MainNavigation}
                options={{
                    animationEnabled: false,
                    headerBackTitleVisible: false,
                    headerTintColor: colorSet.normalTextColor,
                }}
            />
            <RootStack.Screen
                name={SCREEN.QR}
                component={QrScanner}
                options={{
                    animationEnabled: false,
                    headerTintColor: colorSet.normalTextColor,
                    headerBackTitleVisible: false,
                }}
            />
        </RootStack.Navigator>
    )
}

function AppNavigator(props) {
    return (
        <NavigationContainer>
            <RootNavigation />
        </NavigationContainer>
    )
}

export default AppNavigator
