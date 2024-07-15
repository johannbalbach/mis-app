import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Select, Radio, Button, Input, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus} from '@fortawesome/free-solid-svg-icons';
import dictionaryApi from '../../api/dictionaryApi';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DiagnosisSection = ({form, patientId, addedDiagnosis, setAddedDiagnosis}) => {
    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState([]);
    const isForm = form ? true : false;

    useEffect(() => {
        loadDiagnosis();
    }, [patientId]);

    const loadDiagnosis = async (search = '', page = 1, size = 10) => {
        setLoading(true);
        const data = await dictionaryApi.getIcd10({request: search}, page, size);
        setDiagnosis(data.records);
        setLoading(false);
    };

    const handleSearchDiagnosis = (value) => {
        loadDiagnosis(value);
    };
    
    const handleAddDiagnosis = () => {
        let diagnosisData = form.getFieldValue('diagnosis');
        if (diagnosisData) {
            const selectedDiagnosis = diagnosis.find(d => d.id === diagnosisData.code);
            diagnosisData = { ...diagnosisData, name: selectedDiagnosis.name, code: selectedDiagnosis.code, id: selectedDiagnosis.id };
            setAddedDiagnosis([...addedDiagnosis, diagnosisData]);
            form.resetFields(['diagnosis']);
        }
    };

    return (
        <div style={{ backgroundColor: '#f0f2f5', padding: 20, marginTop: 20 }}>
            <Title level={4} style={{ color: '#1A3F76' }}>Диагнозы</Title>
            <div>
                {addedDiagnosis.map((diag, index) => (
                    <div key={index} style={{marginBottom: 15, padding: 0, backgroundColor: '#f0f2f5'}}>
                        <p style={{marginBottom: 5, fontWeight: 'bold', fontSize: '1.0rem'}}>({diag.code}) {diag.name}</p>
                        <p style={{marginBottom: 0, color: '#8c8c8c'}}>Тип в осмотре: {diag.type}</p>
                        <p style={{marginBottom: 0, color: '#8c8c8c'}}>Расшифровка: {isForm ? diag.comment : diag.description}</p>
                    </div>
                ))}
            </div>
            {isForm && (
                <>
                <Form.Item name={['diagnosis', 'code']} label={<span style={{color: '#8c8c8c'}}>Болезни</span>}>
                    <Select
                        placeholder="Выберите диагноз"
                        showSearch
                        onSearch={handleSearchDiagnosis}
                        loading={loading}
                        filterOption={false}
                    >
                        {diagnosis.map(diagnos => (
                            <Option key={diagnos.id} value={diagnos.id}><span style={{fontWeight:'bold'}}>({diagnos.code}) – </span>{diagnos.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name={['diagnosis', 'comment']}>
                    <Input placeholder="Введите комментарий" />
                </Form.Item>
                <Col span={12}>
                    <Form.Item name={['diagnosis', 'type']} label={<span style={{color: '#8c8c8c'}}>Тип диагноза в осмотре</span>}>
                        <Radio.Group>
                            <Radio value="Main">Основной</Radio>
                            <Radio value="Concomitant">Сопутствующий</Radio>
                            <Radio value="Complication ">Осложнение</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Col>
                <Button onClick={handleAddDiagnosis} style={{backgroundColor: '#317CB8', color: 'white'}}>
                    <FontAwesomeIcon icon="fa-solid fa-plus" />
                    Добавить диагноз
                </Button>
                </>
            )}
        </div>
    );
};

export default DiagnosisSection;
