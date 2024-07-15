import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Pagination, Button, Modal, Form, Input, Select, DatePicker, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import queryString from 'query-string';
import patientApi from '../../api/patientApi';
import PatientsFilter from './PatientsFilter';
import PatientRegistrationModal from './PatientRegistrationModal';

const { Option } = Select;
const {Title} = Typography;

const PatientsList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [filters, setFilters] = useState({});
    const [modalVisible, setModalVisible] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const query = queryString.parse(location.search);
            const params = {
                page: query.page || 1,
                size: query.pageSize || 5,
                ...query,
            };
            const data = await patientApi.getPatientsList(params);
            setPatients(data.patients);
            setPagination({ ...pagination, total: data.pagination.count, current: data.pagination.current, pageSize: data.pagination.size });
            setLoading(false);
        };
        fetchData();
    }, [location.search]);

    const handlePaginationChange = (page, pageSize) => {
        navigate({
            pathname: '/patients',
            search: queryString.stringify({ ...filters, page, pageSize: pageSize }),
        });
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        navigate({
            pathname: '/patients',
            search: queryString.stringify({ ...newFilters, page: 1, pageSize: newFilters.pageSize }),
        });
    };

    return (
        <Card
        style={{ width: '66vw', maxWidth: 1600, minWidth: 800, margin: 'auto', marginTop: 50, borderWidth: 0}}
        >
            <Row gutter={16} style={{margin: 'auto'}}>
                <Col span={12}>
                    <Title level={3} style={{ fontWeight: 'bold', fontSize: '2.5rem'}}>Пациенты</Title>
                </Col>
                <Col span={12} style={{ textAlign: 'right'}}>
                    <Button onClick={() => setModalVisible(true)} style={{marginTop: 20, backgroundColor: '#317CB8', color: 'white', padding: 18}}>
                        <FontAwesomeIcon icon="fa-solid fa-user-plus" />
                         Регистрация нового пациента
                    </Button>
                </Col>
            </Row>
            <PatientsFilter onChange={handleFiltersChange} />
            <Row gutter={16} style={{marginTop: 50}}>
                {patients.map(patient => (
                    <Col xs={24} lg={12} key={patient.id} style={{ marginBottom: 16 }}>
                        <Card
                            onClick={() => navigate(`/patient/${patient.id}`)}
                            style={{margin: 'auto', marginTop: 10, backgroundColor: '#f0f2f5', borderWidth: '4px', borderRadius: 0}}
                        >
                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem'}}>{patient.name}</p>
                            <span style={{ color: '#8c8c8c'}}>Пол – </span> <span>{patient.gender == 'Male' ? 'Мужской' : 'Женский'}</span>
                            <br></br>
                            <span style={{ color: '#8c8c8c'}}>Дата рождения – </span> <span> {JSON.stringify(patient.birthday).slice(1, 11)}</span>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total * pagination.pageSize}
                onChange={handlePaginationChange}
                showSizeChanger={false}
                style={{ textAlign: 'center', marginTop: 16 }}
            />
            <PatientRegistrationModal
                open={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    handlePaginationChange(1, pagination.pageSize);  // обновить список пациентов
                }}
            />
        </Card>
    );
};

export default PatientsList;
