import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, Row, Col, Form, Input, Select, Button, DatePicker, Switch, Radio, Typography, message } from 'antd';
import patientApi from '../../api/patientApi';
import inspectionApi from '../../api/inpsectionApi';
import dictionaryApi from '../../api/dictionaryApi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMars, faVenus, faPenToSquare, faMagnifyingGlass, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import TextSection from './textSection';
import ConsultationsSection from './consultationSection';
import DiagnosisSection from './diagnosisSection';

dayjs.extend(customParseFormat);

const dateFormat = 'YYYY-MM-DD';
const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

const CreateInspection = () => {
    const location = useLocation();
    const { patientId, isFollowUpTemp, previousInspection } = location.state || {};
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [patient, setPatient] = useState(null);
    const [inspections, setInspections] = useState([]);
    const [inspectionDate, setInspectionDate] = useState(null);
    const [isFollowUp, setIsFollowUp] = useState(isFollowUpTemp || true);
    const [conclusion, setConclusion] = useState(null);
    const [addedDiagnosis, setAddedDiagnosis] = useState([]);
    const [consultations, setConsultations] = useState([]);

    useEffect(() => {
        const fetchPatientData = async () => {
            const data = await patientApi.getPatientCard(patientId);
            setPatient(data);
        };
        const fetchPreviousInspectionDiagnosis = async () => {
            const data = await dictionaryApi.getIcd10({request: previousInspection.diagnosis.code})

            setAddedDiagnosis([...addedDiagnosis, {
                code: previousInspection.diagnosis.code,
                createTime: previousInspection.diagnosis.createTime,
                comment: previousInspection.diagnosis.description,
                id: data.records[0].id,
                name: previousInspection.diagnosis.name,
                type: previousInspection.diagnosis.type
             }])
        }

        if (previousInspection) {
            fetchPreviousInspectionDiagnosis();            
        }

        fetchPatientData();
        loadInspections();
    }, [patientId]);

    const loadInspections = async (search = '') => {
        setLoading(true);
        const data = await patientApi.searchInspection({ request: search }, patientId);
        setInspections(data);
        setLoading(false);
    };

    const handleSearchInspection = (value) => {
        loadInspections(value);
    };

    const handleInspectionDateChange = (date) => {
        setInspectionDate(date);
    };

    const handleFinish = async (values) => {
        setLoading(true);
    
        if (conclusion === 'Death') {
            let bool = false;
            inspections.forEach(async inspection => {
                const data = await inspectionApi.getInspection(inspection.id);
                if ( data.conclusion === 'Death')
                    bool = true
            })
            if (bool)
            {
                message.error('У пациента не может быть более одного осмотра с заключением “Смерть”.');
                setLoading(false);
                return;
            }
        }

        if (addedDiagnosis.length < 1) {
            message.error('У пациента не может быть пустым поле диагноза');
            setLoading(false);
            return;
        }

        if (!addedDiagnosis.some(d => d.type === 'Main')) {
            message.error('У пациента обязательно должен быть хотя бы один диагноз типа Основной');
            setLoading(false);
            return;
        }

        let payload = {
            date: inspectionDate.toISOString(),
            anamnesis: values.anamnesis,
            complaints: values.complaints,
            treatment: values.treatmentRecommendations,
            conclusion: conclusion,
            diagnoses: addedDiagnosis.map(d => ({
                icdDiagnosisId: d.id,
                description: d.comment,
                type: d.type
            })),
            consultations: consultations.map(c => ({
                specialityId: c.specialty,
                comment: {content: c.comment}
            }))
        };
        if (values.previousInspection){
            payload = {...payload, previousInspectionId: values.previousInspection}
        }
        if (values.nextVisit) {
            payload = {...payload, nextVisitDate: values.nextVisit.toISOString()};
        }
        if (values.deathDate) {
            payload = {...payload, deathDate: values.deathDate.toISOString()};
        }
    
        try {
            await patientApi.createInspection(payload, patientId);
            message.success('Осмотр успешно создан');
            navigate(`/patient/${patientId}`);
        } catch (error) {
            message.error('Ошибка при создании осмотра');
            console.error(error);
        }
    
        setLoading(false);
    };

    const handleCancel = () => {
        window.location.reload();
    };

    const afterTodayDisabledDate = (current) => {
        return current && current > dayjs().endOf('day');
    };

    const beforeTodayDisabledDate = (current) => {
        return current && current < dayjs().endOf('day');
    };

    return (
        <Card style={{ width: '66vw', maxWidth: 1600, minWidth: 800, margin: 'auto', marginTop: 30, borderWidth: 0 }}>
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Row gutter={16}>
                        <Col span={12}>
                            <Title level={1} style={{ fontWeight: 'bold'}} >Создание осмотра</Title>
                        </Col>
                </Row>
                {patient && (
                    <div style={{ backgroundColor: '#f0f2f5', padding: 20 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Title level={3} style={{ fontWeight: 'bold', fontSize: '1.3rem', textWrap: 'nowrap' }}>
                                    {patient.name}
                                    {patient.gender === "Male" ? <FontAwesomeIcon icon={faMars} style={{ marginLeft: 8, color: '#317CB8' }} /> : <FontAwesomeIcon icon={faVenus} style={{ marginLeft: 8, color: '#317CB8' }} />}
                                </Title>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                                <p style={{ marginTop: 4 }}>Дата рождения:  {new Date(patient.birthday).toLocaleDateString()}</p>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="isPrimary" valuePropName="checked">
                                    <Switch checked={!isFollowUp} checkedChildren="Первичный осмотр" unCheckedChildren="Повторный осмотр"
                                     onChange={(checked) => {setIsFollowUp(!checked);}}                                         
                                     style={{
                                            backgroundColor: !isFollowUp ? '#317CB8' : '#D3D3EA',
                                            color: 'white'
                                        }}/>
                                </Form.Item>
                                <Form.Item name="inspectionDate" label={<span style={{color: '#8c8c8c'}}>Дата осмотра</span>} rules={[{ required: true, message: 'Пожалуйста, выберите дату осмотра' }]}>
                                    <DatePicker showTime onChange={handleInspectionDateChange} disabledDate={afterTodayDisabledDate}/>
                                </Form.Item>
                                {isFollowUp && (
                                    <Form.Item 
                                        name="previousInspection" 
                                        label="Предыдущий осмотр" 
                                        rules={[{ required: true, message: 'Пожалуйста, выберите предыдущий осмотр' }]}
                                        initialValue={previousInspection ? previousInspection.id : undefined}
                                    >
                                        <Select 
                                        placeholder="Выберите предыдущий осмотр"
                                        showSearch
                                        onSearch={handleSearchInspection}
                                        loading={loading}
                                        filterOption={false}
                                        >
                                        {inspections.length > 0 ? (
                                            inspections.map(inspection => (
                                            <Option key={inspection.id} value={inspection.id}>
                                                {dayjs(inspection.date).format(dateFormat)} - {inspection.diagnosis.code} - {inspection.diagnosis.name}
                                            </Option>
                                            ))
                                        ) : (
                                            <Option disabled>Нет доступных осмотров</Option>
                                        )}
                                        </Select>
                                    </Form.Item>
                                    )}
                            </Col>
                        </Row>
                    </div>
                )}
                
                <TextSection title='Жалобы' name="complaints" isForm={true}/>
                <TextSection title='Анамнез заболевания' name="anamnesis" isForm={true}/>
                <ConsultationsSection form={form} patientId={patientId} consultations={consultations} setConsultations={setConsultations}/>
                <DiagnosisSection form={form} patientId={patientId} addedDiagnosis={addedDiagnosis} setAddedDiagnosis={setAddedDiagnosis}/>
                <TextSection title='Рекомендации по лечению' name="treatmentRecommendations" isForm={true}/>

                <div style={{ backgroundColor: '#f0f2f5', padding: 20, marginTop: 20 }}>
                    <Title level={4} style={{color: '#1A3F76'}}>Заключение</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="conclusion" label={<span style={{color: '#8c8c8c'}}>Заключение</span>}>
                                <Select onChange={value => setConclusion(value)} placeholder="Выберите заключение">
                                    <Option value="Disease">Болезнь</Option>
                                    <Option value="Death">Смерть</Option>
                                    <Option value="Recovery">Выздоровление</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        {conclusion === 'Disease' && (
                            <Col span={12}>
                                <Form.Item name="nextVisit" label={<span style={{color: '#8c8c8c'}}>Дата и время следующего визита</span>} rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}>
                                    <DatePicker showTime disabledDate={beforeTodayDisabledDate}/>
                                </Form.Item>
                            </Col>
                        )}
                        {conclusion === 'Death' && (
                            <Col span={12}>
                                <Form.Item name="deathDate" label={<span style={{color: '#8c8c8c'}}>Дата и время смерти</span>} rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}>
                                    <DatePicker showTime disabledDate={afterTodayDisabledDate}/>
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                </div>
                <Row gutter={16} style={{ justifyContent: 'center', marginTop: 20 }}>
                    <Col span={5}>
                        <Button htmlType="submit" block style={{backgroundColor: '#317CB8', color: 'white'}}>
                            Сохранить осмотр
                        </Button>
                    </Col>
                    <Col span={3}>
                        <Button type="link" block style={{ backgroundColor: '#D3D3EA', color: 'white' }} onClick={handleCancel}>
                            Отмена
                        </Button>
                    </Col>
                </Row>

            </Form>
        </Card>
    );
};

export default CreateInspection;
