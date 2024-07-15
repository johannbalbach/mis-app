import React from 'react';
import { Col, Row, Typography } from 'antd';

const { Title } = Typography;

const MainContent = () => {
  return (
    <Row justify="center" align="middle">
      <Col xs={22} md={20} xxl={18}>
        <Row justify="center" align="middle" style={{ padding: '24px', marginBottom: '48px' }}>
          <Title level={2} style={{ textAlign: 'center', color: '#1A3F76' }}>
            Добро пожаловать в медицинскую информационную систему
          </Title>
        </Row>
      </Col>
    </Row>
  );
};

export default MainContent;
