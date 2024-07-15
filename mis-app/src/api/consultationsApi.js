import api from './api';

async function getConsultationsList(params = {}) {
    const response = await api.get(`consultation`, {params});

    return response.data;
}

async function getConsultation(id) {
    const response = await api.get(`consultation/${id}`);

    return response.data;
}

async function addComment(body, id) {
    const response = await api.post(`consultation/${id}/comment`, body);

    return response.data;
}

async function editComment(body, id) {
    const response = await api.put(`consultation/comment/${id}`, body);

    return response.data;
}

const consultationsApi = {
    getConsultation: getConsultation,
    editComment: editComment,
    addComment: addComment, 
    getConsultationsList: getConsultationsList
};

export default consultationsApi;