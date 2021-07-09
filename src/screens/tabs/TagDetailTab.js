import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import TagDetailScreen from '../tagDetail'
import { S_TagDetailView } from './TagDetailStyle'

const TagDetailTab = (props) => {
    return (
        <S_TagDetailView>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: '100%' }}
            >
                <TouchableOpacity activeOpacity={1}>
                    <TagDetailScreen {...props} />
                </TouchableOpacity>
            </ScrollView>
        </S_TagDetailView>
    )
}

export default TagDetailTab
