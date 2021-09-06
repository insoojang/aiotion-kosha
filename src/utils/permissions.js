const { Platform, PermissionsAndroid } = require('react-native')
const permissionsAndroid = () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
        PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ).then((result) => {
            if (result) {
                console.log('Permission is OK')
            } else {
                PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ).then((result) => {
                    if (result) {
                        console.log('User accept')
                    } else {
                        console.log('User refuse')
                    }
                })
            }
        })
    }
}
export { permissionsAndroid }
