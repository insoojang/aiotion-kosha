import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { responsiveWidth } from 'react-native-responsive-dimensions'
import { SButtongroupView, STextView, STitleText } from './ButtonGroupStyle'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { colorSet } from '../styles/colors'

const wrapperWidth = responsiveWidth(100) - 40

const ButtonGroup = (props) => {
    const { groupList = {} } = props
    const navigation = useNavigation()
    const buttonNum = groupList?.length

    return buttonNum !== 0 ? (
        <SButtongroupView>
            {groupList.map((data, index) => {
                return (
                    <TouchableOpacity
                        disabled={data?.disabled}
                        style={{
                            alignItems: 'center',
                            width: wrapperWidth / buttonNum,
                            borderRightWidth: index + 1 < buttonNum ? 1 : 0,
                            borderColor: colorSet.primaryDisable,
                            // paddingVertical: 7,
                        }}
                        key={index}
                        onPress={() => {
                            if (data?.route) {
                                navigation.navigate(data?.route)
                            } else if (data?.event) {
                                data.event()
                            }
                        }}
                    >
                        <Icon
                            name={data?.icon}
                            size={27}
                            style={{ marginBottom: 3 }}
                            color={data?.disabled ? 'gray' : 'white'}
                        />
                        <STextView>
                            <STitleText
                                style={{
                                    color: data?.disabled ? 'gray' : 'white',
                                }}
                            >
                                {data?.title}
                            </STitleText>
                        </STextView>
                    </TouchableOpacity>
                )
            })}
        </SButtongroupView>
    ) : null
}

export default ButtonGroup
