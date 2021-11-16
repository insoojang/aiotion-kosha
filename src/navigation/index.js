import React, { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { isEmpty } from 'lodash-es'

import { SCREEN } from './constants'
import { colorSet } from '../styles/colors'
import { TouchableOpacity } from 'react-native'
import { LoginTab, MainTab } from '../screens/tabs'
import { QRComponent } from '../screens/pages/qr'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const BottomTabStack = createMaterialTopTabNavigator()
const MainStack = createStackNavigator()
const RootStack = createStackNavigator()

const MainNavigation = () => {
    const navigation = useNavigation()
    const getUserLoginData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@userData')
            const response = jsonValue !== {} ? JSON.parse(jsonValue) : {}
            if (!isEmpty(response)) {
                navigation.replace(SCREEN.MainTab)
            }
        } catch (e) {
            console.log('[ERROR]: MyInfo.js > getData()')
        }
    }
    useEffect(() => {
        getUserLoginData()
    }, [])

    return (
        <MainStack.Navigator>
            {/*<MainStack.Screen*/}
            {/*    name={SCREEN.LoginTab}*/}
            {/*    component={LoginTab}*/}
            {/*    options={{*/}
            {/*        headerShown: false,*/}
            {/*    }}*/}
            {/*/>*/}
            <MainStack.Screen
                name={SCREEN.MainTab}
                component={MainTab}
                options={{
                    headerBackTitleVisible: false,
                    headerTitleAlign: 'center',
                    headerLeft: null,
                    headerStyle: {
                        shadowColor: 'transparent',
                        shadowOpacity: 0,
                        elevation: 0,
                        borderBottomWidth: 1,
                        borderBottomColor: colorSet.borderColor,
                    },
                }}
            />
        </MainStack.Navigator>
    )
}

const BottomTabNavigation = () => {
    return (
        <BottomTabStack.Navigator>
            <BottomTabStack.Screen
                name={SCREEN.QR}
                component={QRComponent}
                options={{
                    animationEnabled: false,
                    headerShown: false,
                    tabBarLabelStyle: { fontSize: 11 },
                    tabBarIcon: () => <Icon name="qrcode-scan" size={20} />,
                }}
            />
        </BottomTabStack.Navigator>
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
                    headerShown: false,
                    headerTitleAlign: 'center',
                }}
            />
            <RootStack.Screen
                name={SCREEN.Scan}
                component={BottomTabNavigation}
                options={(route) => {
                    return {
                        animationEnabled: false,
                        headerBackTitleVisible: false,
                        headerTitleAlign: 'center',
                        headerLeft: null,
                        headerRight: () => (
                            <TouchableOpacity
                                onPress={() => route.navigation.goBack()}
                                style={{ marginHorizontal: 15 }}
                                hitSlop={{
                                    top: 10,
                                    right: 15,
                                    bottom: 10,
                                    left: 15,
                                }}
                            >
                                <Icon
                                    name="close"
                                    size={20}
                                    style={{ marginHorizontal: 15 }}
                                />
                            </TouchableOpacity>
                        ),
                        headerStyle: {
                            shadowColor: 'transparent',
                            shadowOpacity: 0,
                            elevation: 0,
                            borderBottomWidth: 1,
                            borderBottomColor: colorSet.borderColor,
                        },
                    }
                }}
            />
        </RootStack.Navigator>
    )
}

function AppNavigator() {
    return (
        <NavigationContainer>
            <RootNavigation />
        </NavigationContainer>
    )
}

export default AppNavigator
