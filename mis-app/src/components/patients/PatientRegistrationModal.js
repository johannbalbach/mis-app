import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Row, Col, Typography } from 'antd';
import patientApi from '../../api/patientApi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const dateFormat = 'YYYY-MM-DD';

const { Option } = Select;
const {Title} = Typography;

const PatientRegistrationModal = ({ open, onClose, onSuccess }) => {
    const [form] = Form.useForm();

    const handleFinish = async (values) => {
        const transformedValues = {
            ...values,
            birthday: values.birthdate.toISOString(),
        };
        try {
            await patientApi.createPatient(transformedValues);
            onSuccess();
        } catch (error) {
            console.error('Failed to register patient', error);
        }
    };

    return (
        <Modal
            open={open}
            title={<Title level={3} style={{ fontWeight: 'bold', fontSize: '1.4rem', margin: 0 }}>Регистрация пациента</Title>}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    label={<span style={{ color: '#8c8c8c' }}>Фио</span>}
                    rules={[{ required: true, message: 'Пожалуйста, введите ФИО', }]}
                >
                    <Input placeholder="Иванов Иван Иванович" />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                        name="gender"
                        label={<span style={{ color: '#8c8c8c' }}>Пол</span>}
                        rules={[{ required: true, message: 'Пожалуйста, выберите пол' }]}
                        >
                            <Select placeholder="Выберите пол">
                                <Option value="male">Мужской</Option>
                                <Option value="female">Женский</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                        name="birthdate"
                        label={<span style={{ color: '#8c8c8c' }}>Дата рождения</span>}
                        rules={[{ required: true, message: 'Пожалуйста, выберите дату рождения' }]}
                        >
                            <DatePicker style={{ width: '100%' }} placeholder="Выберите дату" maxDate={dayjs('2023-10-12', dateFormat)}/>
                        </Form.Item>
                    </Col>
                </Row>


                <Form.Item>
                    <Button htmlType="submit" block >
                        Зарегистрировать
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PatientRegistrationModal;
