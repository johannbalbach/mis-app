import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import profileApi from '../../api/profileApi';
import styles from '../global.scss';

const { Title } = Typography;

const LoginForm = () => {
    const [loginError, setLoginError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            await profileApi.login(values);
            setLoginError(false);
            navigate('/');
        } catch (error) {
            setLoginError(true);
        }
    };

    useEffect(() => {
        if (loginError) {
            const timer = setTimeout(() => {
                setLoginError(false);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [loginError]);

    return (
        <Card
            title={<Title level={3} style={{ fontWeight: 'bold', fontSize: '2rem', margin: 0 }}>Вход</Title>}
            style={{ width: '33vw', maxWidth: 600, margin: 'auto', marginTop: 150, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)', backgroundColor: '#f0f2f5', borderWidth: '4px' }}
        >
            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={handleSubmit}
                layout="vertical"
            >
                <Form.Item
                    name="email"
                    label={<span style={{ color: '#8c8c8c' }}>Email</span>}
                    rules={[
                        { required: true, message: 'Пожалуйста, введите Email!' },
                        { type: 'email', message: 'Пожалуйста, введите корректный email!', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }
                    ]}
                >
                    <Input placeholder="name@example.com" />
                </Form.Item>
                <Form.Item
                    name="password"
                    label={<span style={{ color: '#8c8c8c' }}>Пароль</span>}
                    rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button htmlType="submit" block style={{ backgroundColor: loginError ? 'red' : '#317CB8', color: 'white' }}>
                        {loginError ? 'Неправильный логин или пароль' : 'Войти'}
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Link to="/register">
                        <Button type="link" block style={{ backgroundColor: '#D3D3EA', color: 'white' }}>
                            Регистрация
                        </Button>
                    </Link>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default LoginForm;
