import api from './api';

async function createPatient(body) {
    const response = await api.post('patient', body);

    return response.data;
}

async function getPatientsList(params = {}) {
    const response = await api.get('patient', {params});

    return response.data;
}

async function createInspection(body, id) {
    const response = await api.post(`patient/${id}/inspections`, body);

    return response.data;
}

async function getInspectionsList(params = {}, id) {
    const response = await api.get(`patient/${id}/inspections`, {params});

    return response.data;
}

async function getPatientCard(id) {
    const response = await api.get(`patient/${id}`);

    return response.data;
}

async function searchInspection(params = {}, id) {
    const response = await api.get(`patient/${id}/inspections/search`, {params});

    return response.data;
}

const patientApi = {
    createPatient: createPatient,
    getPatientsList: getPatientsList,
    createInspection: createInspection,
    getInspectionsList: getInspectionsList, 
    getPatientCard: getPatientCard,
    searchInspection: searchInspection
};

export default patientApi;