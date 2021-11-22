import React, { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { isEmpty } from 'lodash-es'

import { SCREEN } from './constants'
import { colorSet } from '../styles/colors'
import { Alert, TouchableOpacity } from 'react-native'
import { LoginTab, MainTab } from '../screens/tabs'
import QRComponent from '../screens/pages/qr/QRComponent'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { i18nt } from '../utils/i18n'

const MainStack = createStackNavigator()
const RootStack = createStackNavigator()

const MainNavigation = () => {
    const navigation = useNavigation()
    const getUserLoginData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@userData')
            const response = jsonValue !== {} ? JSON.parse(jsonValue) : {}
            if (!isEmpty(response)) {
                navigation.navigate(SCREEN.MainTab)
            }
        } catch (e) {
            console.log('[ERROR]: MyInfo.js > getData()')
        }
    }
    useEffect(() => {
        getUserLoginData()
    }, [])
    const onClickBack = (routeValue) => {
        Alert.alert(i18nt('login.back-login'), '', [
            {
                text: i18nt('action.cancel'),
                style: 'cancel',
            },
            {
                text: i18nt('action.ok'),
                onPress: async () => {
                    try {
                        await AsyncStorage.removeItem('@userData')
                        routeValue.navigation.goBack()
                    } catch (e) {
                        console.error('[ERROR]', e)
                    }
                },
            },
        ])
    }
    return (
        <MainStack.Navigator>
            <MainStack.Screen
                name={SCREEN.LoginTab}
                component={LoginTab}
                options={{
                    headerShown: false,
                }}
            />
            <MainStack.Screen
                name={SCREEN.MainTab}
                component={MainTab}
                options={(route) => {
                    return {
                        headerBackTitleVisible: false,
                        headerTitleAlign: 'center',
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => {
                                    onClickBack(route)
                                }}
                                style={{ marginHorizontal: 15 }}
                                hitSlop={{
                                    top: 10,
                                    right: 15,
                                    bottom: 10,
                                    left: 15,
                                }}
                            >
                                <Icon
                                    name="chevron-left"
                                    size={30}
                                    style={{ marginHorizontal: 5 }}
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
                    headerShown: false,
                    headerTitleAlign: 'center',
                }}
            />
            <RootStack.Screen
                name={SCREEN.Scan}
                component={QRComponent}
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
