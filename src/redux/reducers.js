import { createSlice } from '@reduxjs/toolkit'

const QR_STATE = {
    android: '',
    ios: '',
    server: '',
}
// “{\“resourceId\“:4222,\“server\“:\“http://192.168.234.24\“,\“ios\“:\“E7465DFB-8E9A-D2BA-65F5-68365089F423\“,\“android\“:\“A4:34:F1:36:F7:3E\“}”
export const qrSlice = createSlice({
    name: 'uuid',
    initialState: QR_STATE,
    reducers: {
        setUuid: (state, action) => action.payload,
        clearUuid: () => QR_STATE,
    },
})

export const { setUuid, clearUuid } = qrSlice.actions

export default qrSlice.reducer

// export interface CounterState {
//     value: number;
// }
//
// const initialState: CounterState = {
//     value: 0,
// }
//
// export const counterSlice = createSlice({
//     name: 'counter',
//     initialState,
//     reducers: {
//         increment: (state) => {
//             // Redux Toolkit allows us to write "mutating" logic in reducers. It
//             // doesn't actually mutate the state because it uses the Immer library,
//             // which detects changes to a "draft state" and produces a brand new
//             // immutable state based off those changes
//             state.value += 1
//         },
//         decrement: (state) => {
//             state.value -= 1
//         },
//         incrementByAmount: (state, action: PayloadAction<number>) => {
//             state.value += action.payload
//         },
//     },
// })
//
// // Action creators are generated for each case reducer function
// export const { increment, decrement, incrementByAmount } = counterSlice.actions
//
// export default counterSlice.reducer
