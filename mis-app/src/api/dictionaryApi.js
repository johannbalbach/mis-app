import api from './api';

async function getIcd10root() {
    const response = await api.get('dictionary/icd10/roots');
    
    return response.data;
}

async function getIcd10(params = {}) {
    const response = await api.get('dictionary/icd10', {params});
    
    return response.data;
}

async function getSpecialities(params = {}) {
    const response = await api.get('dictionary/speciality', { params });

    return response.data;
}

async function getReport(params = {}){
    const response = await api.get('report/icdrootsreport', {params})

    return response.data;
}

const dictionaryApi = {
    getIcd10root: getIcd10root,
    getIcd10: getIcd10,
    getSpecialities: getSpecialities,
    getReport: getReport
};

export default dictionaryApi;