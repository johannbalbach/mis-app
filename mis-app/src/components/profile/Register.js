import React, {useState, useEffect} from 'react';
import { Form, Input, Button, Select, DatePicker, Card, Typography, Row, Col } from 'antd';
import profileApi from '../../api/profileApi';
import dictionaryApi from '../../api/dictionaryApi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const dateFormat = 'YYYY-MM-DD';

const { Option } = Select;
const { Title } = Typography;

const RegisterForm = () => {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSpecialties();
    }, []);

    const loadSpecialties = async (search = '', page = 1, size = 10) => {
        setLoading(true);
        const { specialties } = await dictionaryApi.getSpecialities({ name: search, page, size });
        setSpecialties(specialties);
        setLoading(false);
    };

    const handleSearch = (value) => {
        loadSpecialties(value);
    };

    const handleSubmit = async (values) => {
        const transformedValues = {
            name: values.name,
            password: values.password,
            email: values.email,
            birthday: values.birthdate.toISOString(),
            gender: values.gender,
            phone: values.phone,
            speciality: values.specialty
        };
        
        try {
            await profileApi.registration(transformedValues);
        } catch (error) {
            console.error('Registration failed', error);
        }
    };

    return (
        <Card
            title={<Title level={3} style={{ fontWeight: 'bold', fontSize: '2rem', margin: 0 }}>Регистрация</Title>}
            style={{ width: '33vw', maxWidth: 700, margin: 'auto', marginTop: 50, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)', backgroundColor: '#f0f2f5', borderWidth: '4px' }}
        >
            <Form
                name="register"
                onFinish={handleSubmit}
                layout="vertical"
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
                            rules={[{ required: true, message: 'Пожалуйста, выберите дату рождения!' },
                                { type: 'birthdate', message: 'Пожалуйста, введите корректную дату рождения!', pattern: '^(19\d\d|20\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$' }
                            ]}
                        >
                            <DatePicker style={{ width: '100%' }} placeholder="Дата рождения"  maxDate={dayjs('2023-10-12', dateFormat)}/>
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
                    name="specialty"
                    label={<span style={{ color: '#8c8c8c' }}>Специальность</span>}
                    rules={[{ required: true, message: 'Пожалуйста, выберите специальность!' }]}
                >
                    <Select
                        placeholder="Специальность"
                        showSearch
                        onSearch={handleSearch}
                        loading={loading}
                        filterOption={false}
                    >
                        {specialties.map(specialty => (
                            <Option key={specialty.id} value={specialty.id}>{specialty.name}</Option>
                        ))}
                    </Select>
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
                <Form.Item
                    name="password"
                    label={<span style={{ color: '#8c8c8c' }}>Пароль</span>}
                    rules={[{ required: true, message: 'Пожалуйста, введите пароль!' },
                        { message: 'Пароль должен содержать хотя-бы одну цифру и 6 знаков', pattern: /^(?=.*\d).{6,}$/ }
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button htmlType="submit" block style={{backgroundColor: '#317CB8', color: 'white' }}>
                        Зарегистрироваться
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default RegisterForm;
