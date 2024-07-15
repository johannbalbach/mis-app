import api from './api';

async function getInspection(id) {
    const response = await api.get(`inspection/${id}`);

    return response.data;
}

async function editInspection(body, id) {
    const response = await api.put(`inspection/${id}`, body);

    return response.data;
}

async function getInspectionChain(id) {
    const response = await api.get(`inspection/${id}/chain`);

    return response.data;
}

const inspectionApi = {
    getInspection: getInspection,
    editInspection: editInspection,
    getInspectionChain: getInspectionChain, 
};

export default inspectionApi;