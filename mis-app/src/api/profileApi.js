import api from './api';

async function logout() {
    await api.post('/doctor/logout');
    localStorage.removeItem('token');
    window.location.href = '/';
}

async function registration(body = null) {
    try {
        const response = await api.post('doctor/register', body);
        localStorage.setItem('token', response.data.token);
        window.location.href = '/';
    } catch (error) {
        console.log(error);
        if (error.response.status === 409){
            alert("пользователь с таким email уже существует");
        }
    }
    
}

async function login(body = null) {
    try {
        const response = await api.post('doctor/login', body);
        localStorage.setItem('token', response.data.token);
    } catch (error) {
        if (error.response.status === 409){
            alert("пользователь с таким email уже существует");
        }
        else if (error.response.status === 400){
            alert("вы ввели неправильный логин или пароль");
        }
    }
;
}

async function getProfile() {
    const response = await api.get('doctor/profile');
    return response.data;
}

async function editProfile(body = null) {
    const response = await api.put('doctor/profile', body);

    return response.data;
}

const profileApi = {
    logout: logout,
    registration: registration,
    login: login,
    getProfile: getProfile, 
    editProfile: editProfile
};

export default profileApi;