import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Button, Typography, Modal, Form, Input } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import inspectionApi from '../../api/inpsectionApi';
import ConsultationSection from './consultationSection';
import DiagnosisSection from './diagnosisSection';
import TextSection from './textSection';
import ConsultationTreeSection from './consultationTreeSection';
import EditInspectionModal from './editInspectionModal';
import { useSelector } from 'react-redux';

dayjs.extend(customParseFormat);

const dateFormat = 'YYYY-MM-DD';
const { Title, Text } = Typography;
const { TextArea } = Input;


const InspectionDetails = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        const data = await inspectionApi.getInspection(id);
        setData(data);
        setLoading(false);
    };

    const handleEdit = () => {
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const handleModalSuccess = () => {
        fetchData();
        setIsModalVisible(false);
    };

    return (
        <Card style={{ width: '66vw', maxWidth: 1600, minWidth: 800, margin: 'auto', marginTop: 30, borderWidth: 0 }}>
            {data && (
                <>
                    <div style={{ backgroundColor: '#f0f2f5', padding: 20, marginBottom: 20 }}>
                        <Row justify="space-between" align="middle">
                            <Col span={18}>
                                <Title level={2} style={{ color: '#1A3F76' }}>
                                    Амбулаторный осмотр от {dayjs(data.date).format('YYYY.MM.DD')} – {dayjs(data.date).format('HH:mm')}
                                </Title>
                            </Col>
                            <Col span={6} style={{ textAlign: 'right' }}>
                                {user.id == data.doctor.id && (<Button onClick={handleEdit} style={{backgroundColor: '#317CB8', color: 'white'}}>Редактировать осмотр</Button>)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}><Text style={{fontWeight: 'bold'}}>Пациент: {data.patient.name}</Text></Col>
                            <Col span={24}><Text>Пол: {data.patient.gender}</Text></Col>
                            <Col span={24}><Text>Дата рождения: {dayjs(data.patient.birthday).format('YYYY.MM.DD')}</Text></Col>
                            <Col span={24}><Text style={{ color: '#8c8c8c' }}>Медицинский работник: {data.doctor.name}</Text></Col>
                        </Row>
                    </div>

                    <TextSection title="Жалобы" content={data.complaints} isForm={false} />
                    <TextSection title="Анамнез заболевания" content={data.anamnesis} isForm={false} />
                    <ConsultationTreeSection consultations={data.consultations} />
                    <DiagnosisSection addedDiagnosis={data.diagnoses} />
                    <TextSection title="Рекомендация по лечению" content={data.treatment} isForm={false} />

                    <div style={{ backgroundColor: '#f0f2f5', padding: '16px', marginTop: 16 }}>
                        <Title level={4} style={{ color: '#1A3F76' }}>Заключение</Title>
                        <Text style={{ fontWeight:'bold', fontSize: '1.0rem' }}>{data.conclusion === 'Disease' ? 'Болезнь' : data.conclusion === 'Recovery' ? 'Выздоровление' : 'Смерть'}</Text>
                        {data.conclusion === 'Disease' && data.nextVisitDate && (
                            <Text><br />Дата следующего визита: {dayjs(data.nextVisitDate).format('YYYY.MM.DD HH:mm')}</Text>
                        )}
                        {data.conclusion === 'Death' && data.deathDate && (
                            <Text><br />Дата и время смерти: {dayjs(data.deathDate).format('YYYY.MM.DD HH:mm')}</Text>
                        )}
                    </div>
                </>
            )}  
            
            <EditInspectionModal
                isVisible={isModalVisible}
                handleCancel={handleModalCancel}
                handleSuccess={handleModalSuccess}
                inspectionId={id}
            />
        </Card>
    );
};

export default InspectionDetails;
