import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Select, Switch, Input, Button, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import dictionaryApi from '../../api/dictionaryApi';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ConsultationsSection = ({form, patientId, consultations, setConsultations}) => {
    const [loading, setLoading] = useState(false);
    const [specialties, setSpecialties] = useState([]);
    const [isConsultationNeeded, setIsConsultationNeeded] = useState(true);

    useEffect(() => {
        loadSpecialties();
        
    }, [patientId]);

    const loadSpecialties = async (search = '', page = 1, size = 10) => {
        setLoading(true);
        const data = await dictionaryApi.getSpecialities({ name: search, page, size });
        setSpecialties(data.specialties);
        setLoading(false);
    };

    const handleSearch = (value) => {
        loadSpecialties(value);
    };

    const handleAddConsultation = () => {
        const consultation = form.getFieldValue('consultation');
        if (consultation) {
            setConsultations([...consultations, consultation]);
            form.resetFields(['consultation']);
        }
    };

    return (
        <div style={{ backgroundColor: '#f0f2f5', padding: 20, marginTop: 20 }}>
            <Title level={4} style={{color: '#1A3F76'}}>Консультация</Title>
            <div>
                {consultations.map((consultation, index) => (
                    <div key={index} style={{marginBottom: 15, padding: 0, backgroundColor: '#f0f2f5'}}>
                        <p style={{marginBottom: 5, fontWeight: 'bold'}}>Специальность: {specialties.find(s => s.id === consultation.specialty)?.name}</p>
                        <p style={{marginBottom: 0, color: '#8c8c8c'}}>Комментарий: {consultation.comment}</p>
                    </div>
                ))}
            </div>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name={['consultation', 'required']} label="" layout="horizontal" valuePropName="checked">
                        <Switch checked={!isConsultationNeeded} 
                        onChange={(checked) => {setIsConsultationNeeded(!checked)}}
                        style={{
                            backgroundColor: !isConsultationNeeded ? '#317CB8' : '#D3D3EA',
                            color: 'white'
                        }}
                        /> <span style={{marginLeft: 10}}> Требуется консультация </span> 
                    </Form.Item>
                </Col>
                {!isConsultationNeeded && (
                    <Col span={16}>
                        <Form.Item name={['consultation', 'specialty']}>
                            <Select placeholder="Специальность" showSearch onSearch={handleSearch} loading={loading}>
                                {specialties.map(specialty => (
                                    <Option key={specialty.id} value={specialty.id}>{specialty.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                )}
            </Row>
            {!isConsultationNeeded && (
                <>
                    <Form.Item name={['consultation', 'comment']} label={<span style={{color: '#8c8c8c'}}>Комментарий</span>}>
                        <TextArea rows={4} placeholder="Введите комментарий" />
                    </Form.Item>
                    <Button onClick={handleAddConsultation} style={{backgroundColor: '#317CB8', color: 'white'}}>
                        <FontAwesomeIcon icon="fa-solid fa-plus" />
                        Добавить консультацию
                    </Button>
                </>
            )}
        </div>
    );
};

export default ConsultationsSection;
