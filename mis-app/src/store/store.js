import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: {
        name: '',
        id: '',
    },
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser(state, action) {
            state.user.name = action.payload.name;
            state.user.id = action.payload.id;
        },
    },
});

const store = configureStore({
    reducer: {
        user: userSlice.reducer,
    },
});

export const { updateUser } = userSlice.actions;
export default store;
