import { updateUser } from '../store';

export const setUser = (user) => (dispatch) => {
    dispatch(updateUser(user));
};