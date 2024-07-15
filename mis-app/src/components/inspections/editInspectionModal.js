import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Input, Select, Button, DatePicker, Switch, Typography, message } from 'antd';
import inspectionApi from '../../api/inpsectionApi';
import dictionaryApi from '../../api/dictionaryApi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import TextSection from './textSection';
import DiagnosisSection from './diagnosisSection';

dayjs.extend(customParseFormat);

const { Option } = Select;
const { Title } = Typography;

const EditInspectionModal = ({ isVisible, handleCancel, handleSuccess, inspectionId }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [inspectionData, setInspectionData] = useState(null);
    const [conclusion, setConclusion] = useState(null);
    const [addedDiagnosis, setAddedDiagnosis] = useState([]);
    

    useEffect(() => {
        const fetchInspectionData = async () => {
            setLoading(true);
            const data = await inspectionApi.getInspection(inspectionId);
            setInspectionData(data);
            setConclusion(data.conclusion);
            const diagnosesWithId = await Promise.all(
                data.diagnoses.map(async (diagnosis) => {
                    const response = await dictionaryApi.getIcd10({ request: diagnosis.code });
                    return {
                        id: response.records[0].id,
                        code: diagnosis.code,
                        createTime: diagnosis.createTime,
                        comment: diagnosis.description,
                        name: diagnosis.name,
                        type: diagnosis.type,
                    };
                })
            );
            setAddedDiagnosis(diagnosesWithId);
            setLoading(false);
        };

        if (inspectionId) {
            fetchInspectionData();
        }
    }, [inspectionId]);

    const handleFinish = async (values) => {
        setLoading(true);

        if (conclusion === 'Death' && inspectionData?.conclusion !== 'Death') {
            const previousInspections = await inspectionApi.getPatientInspections(inspectionData.patient.id);
            if (previousInspections.some(inspection => inspection.conclusion === 'Death')) {
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
            anamnesis: values.anamnesis,
            complaints: values.complaints,
            treatment: values.treatmentRecommendations,
            conclusion: conclusion,
            diagnoses: addedDiagnosis.map(d => ({
                icdDiagnosisId: d.id,
                description: d.comment,
                type: d.type
            })),
        };

        if (values.nextVisit) {
            payload = {...payload, nextVisitDate: values.nextVisit.toISOString()};
        }

        if (values.deathDate) {
            payload = {...payload, deathDate: values.deathDate.toISOString()};
        }

        try {
            await inspectionApi.editInspection(payload, inspectionId);
            message.success('Осмотр успешно обновлен');
            handleCancel();
            navigate(`/inspection/${inspectionId}`);
            handleSuccess();
        } catch (error) {
            message.error('Ошибка при обновлении осмотра');
            console.error(error);
        }

        setLoading(false);
    };

    return (
        <Modal
            title="Редактировать осмотр"
            open={isVisible}
            onCancel={handleCancel}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={inspectionData}>
                <TextSection title='Жалобы' name="complaints" isForm={true} />
                <TextSection title='Анамнез заболевания' name="anamnesis" isForm={true} />
                <DiagnosisSection form={form} addedDiagnosis={addedDiagnosis} setAddedDiagnosis={setAddedDiagnosis} />
                <TextSection title='Рекомендации по лечению' name="treatmentRecommendations" isForm={true} />

                <div style={{ backgroundColor: '#f0f2f5', padding: 20, marginTop: 20 }}>
                    <Title level={4} style={{ color: '#1A3F76' }}>Заключение</Title>
                    <Form.Item name="conclusion" label="Заключение">
                        <Select onChange={value => setConclusion(value)} placeholder="Выберите заключение">
                            <Option value="Disease">Болезнь</Option>
                            <Option value="Death">Смерть</Option>
                            <Option value="Recovery">Выздоровление</Option>
                        </Select>
                    </Form.Item>
                    {conclusion === 'Disease' && (
                        <Form.Item name="nextVisit" label="Дата и время следующего визита">
                            <DatePicker showTime disabledDate={(current) => current && current < dayjs().endOf('day')} />
                        </Form.Item>
                    )}
                    {conclusion === 'Death' && (
                        <Form.Item name="deathDate" label="Дата и время смерти">
                            <DatePicker showTime disabledDate={(current) => current && current > dayjs().endOf('day')} />
                        </Form.Item>
                    )}
                </div>

                <Form.Item style={{ textAlign: 'center', marginTop: 20 }}>
                    <Button type="primary" htmlType="submit" loading={loading} style={{backgroundColor: '#317CB8', color: 'white'}}>
                        Сохранить изменения
                    </Button>
                    <Button type="default" onClick={handleCancel} style={{ marginLeft: 8, backgroundColor: '#D3D3EA', color: 'white' }}>
                        Отмена
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditInspectionModal;
