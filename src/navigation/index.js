import React, { useRef, useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { SCREEN } from './constants'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { BluetoothTab } from '../screens/tabs'
import { NavigationContainer } from '@react-navigation/native'
import { View, Text } from 'react-native'
import QrScanner from '../components/QRScanner'
import { colorSet } from '../styles/colors'
import BarometerComponent from '../screens/barometer'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Tooltip, ListItem } from 'react-native-elements'
import ScanComponent from '../screens/scan'

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
const ListItemComponent = (navi, tooltip) => {
    return (
        <View style={{ height: 40 }}>
            {/*<ListItem*/}
            {/*    onPress={() => {*/}
            {/*        tooltip?.toggleTooltip()*/}
            {/*        navi.navigate(SCREEN.Barometer)*/}
            {/*    }}*/}
            {/*    contay*/}
            {/*>*/}
            {/*    <Icon name="gauge" size={20} />*/}
            {/*    <Text>기압계</Text>*/}
            {/*    <ListItem.Content style={{ height: 18 }} />*/}
            {/*</ListItem>*/}
            <ListItem
                onPress={() => {
                    tooltip?.toggleTooltip()
                    navi.navigate(SCREEN.Scan)
                }}
            >
                <Icon name="card-search-outline" size={20} />
                <Text>Scan</Text>
                <ListItem.Content style={{ height: 18 }} />
            </ListItem>
        </View>
    )
}

const RootNavigation = () => {
    const tooltipRef = useRef(null)
    return (
        <RootStack.Navigator mode="modal">
            <RootStack.Screen
                name={SCREEN.Main}
                component={MainNavigation}
                options={({ navigation }) => ({
                    animationEnabled: false,
                    headerBackTitleVisible: false,
                    headerTintColor: colorSet.normalTextColor,
                    headerRight: (v) => {
                        return (
                            <Tooltip
                                popover={ListItemComponent(
                                    navigation,
                                    tooltipRef.current,
                                )}
                                ref={tooltipRef}
                                width={110}
                                height={40}
                                backgroundColor={'white'}
                                overlayColor={'rgba(0,0,0,.7)'}
                                withPointer={false}
                                style={{ marginHorizontal: 15 }}
                            >
                                <Icon
                                    name="dots-vertical"
                                    size={20}
                                    style={{ marginHorizontal: 15 }}
                                />
                            </Tooltip>
                        )
                    },
                })}
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
            <RootStack.Screen
                name={SCREEN.Barometer}
                component={BarometerComponent}
                options={{
                    // animationEnabled: false,
                    headerTintColor: colorSet.normalTextColor,
                    headerBackTitleVisible: false,
                }}
            />
            <RootStack.Screen
                name={SCREEN.Scan}
                component={ScanComponent}
                options={{
                    // animationEnabled: false,
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
