import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Card, Typography, Row, Col } from 'antd';
import { useDispatch } from 'react-redux';
import profileApi from '../../api/profileApi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { setUser } from '../../store/actions/updateUser';

dayjs.extend(customParseFormat);

const dateFormat = 'YYYY-MM-DD';
const { Option } = Select;
const { Title } = Typography;

const ProfileForm = () => {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await profileApi.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        console.log(values);
        const transformedValues = {
            name: values.name,
            email: values.email,
            birthday: values.birthdate.toISOString(),
            gender: values.gender,
            phone: values.phone,
        };

        try {
            await profileApi.editProfile(transformedValues);
            dispatch(setUser({name: transformedValues.name, id: profile.id}));
        } catch (error) {
            console.error('Profile update failed', error);
        }
    };

    return (
        <Card
            title={<Title level={3} style={{ fontWeight: 'bold', fontSize: '2rem', margin: 0 }}>Профиль</Title>}
            style={{ width: '33vw', maxWidth: 700, margin: 'auto', marginTop: 50, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)', backgroundColor: '#f0f2f5', borderWidth: '4px' }}
        >
            {!loading && (
                <Form
                    name="profile"
                    onFinish={handleSubmit}
                    layout="vertical"
                    initialValues={{
                        name: profile.name,
                        gender: profile.gender,
                        birthdate: dayjs(profile.birthday),
                        phone: profile.phone,
                        email: profile.email
                    }}
                >
                    <Form.Item
                        name="name"
                        label={<span style={{ color: '#8c8c8c' }}>Имя</span>}
                        rules={[{ required: true, message: 'Пожалуйста, введите имя!' }]}
                    >
                        <Input placeholder="Иванов Иван Иванович" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="gender"
                                label={<span style={{ color: '#8c8c8c' }}>Пол</span>}
                                rules={[{ required: true, message: 'Пожалуйста, выберите пол!' }]}
                            >
                                <Select placeholder="Пол">
                                    <Option value="male">Мужской</Option>
                                    <Option value="female">Женский</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="birthdate"
                                label={<span style={{ color: '#8c8c8c' }}>Дата рождения</span>}
                                rules={[{ required: true, message: 'Пожалуйста, выберите дату рождения!' }]}
                            >
                                <DatePicker style={{ width: '100%' }} placeholder="Дата рождения" maxDate={dayjs('2023-10-12', dateFormat)}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="phone"
                        label={<span style={{ color: '#8c8c8c' }}>Телефон</span>}
                        rules={[
                            { required: true, message: 'Пожалуйста, введите телефон!' },
                            { pattern: /^\+\d+(?:\s*(?:\d{1,4}|\(\d{1,4}\))){1,5}(?:\s*-\s*\d{2})?$/, message: 'Пожалуйста, введите корректный номер телефона!' }
                        ]}
                    >
                        <Input placeholder="+7 (xxx) xxx xx-xx" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label={<span style={{ color: '#8c8c8c' }}>Email</span>}
                        rules={[
                            { required: true, message: 'Пожалуйста, введите Email!' },
                            { type: 'email', message: 'Пожалуйста, введите корректный email!'}
                        ]}
                    >
                        <Input placeholder="name@example.com" />
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="submit" block style={{backgroundColor: '#317CB8', color: 'white' }}>
                            Сохранить изменения
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
};

export default ProfileForm;
