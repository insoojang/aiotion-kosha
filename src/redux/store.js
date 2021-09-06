import { configureStore } from '@reduxjs/toolkit'
// import logger from 'redux-logger'
import qrSlice from './reducers'

export default configureStore({
    reducer: {
        qr: qrSlice,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})
// export default configureStore({
//     reducer: {
//         counter: counterReducer,
//     },
// })
