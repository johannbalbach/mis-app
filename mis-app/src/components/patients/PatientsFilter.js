import React, {useState} from 'react';
import { Form, Input, Select, Button, Row, Col, Card, Typography, Switch } from 'antd';

const { Option } = Select;
const { Title } = Typography;

const PatientsFilter = ({ onChange }) => {
    const [form] = Form.useForm();
    const [plannedVisitsChecked, setPlannedVisitsChecked] = useState(false);
    const [onlyMineChecked, setOnlyMineChecked] = useState(false);

    const handlePlannedVisitsChange = (checked) => {
        setPlannedVisitsChecked(checked);
    };

    const handleOnlyMineChange = (checked) => {
        setOnlyMineChecked(checked);
    };
    const handleFinish = (values) => {
        onChange(values);
    };

    return (
        <Card
            title={<Title level={3} style={{ fontWeight: 'bold', fontSize: '1.4rem', margin: 0 }}>Фильтры и сортировка</Title>}
            style={{margin: 'auto', marginTop: 10, backgroundColor: '#f0f2f5', borderWidth: '4px', borderRadius: 0 }}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="name" label={<span style={{color: '#8c8c8c'}}>Имя пациента</span>}>
                            <Input placeholder="Введите имя пациента" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="conclusions" label={<span style={{color: '#8c8c8c'}}>Заключения осмотров</span>}>
                            <Select mode="multiple" placeholder="Выберите заключения">
                                <Option value="Recovery">Выздоровление</Option>
                                <Option value="Disease">Болезнь</Option>
                                <Option value="Death">Смерть</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="scheduledVisits" label={<span style={{color: '#8c8c8c'}}>Есть запланированные визиты</span>} layout="horizontal" valuePropName="checked" style={{marginTop: 28}}>
                            <Switch 
                                checked={plannedVisitsChecked}
                                onChange={handlePlannedVisitsChange}
                                style={{
                                    backgroundColor: plannedVisitsChecked ? '#317CB8' : '#D3D3EA',
                                    color: 'white'
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="onlyMine" label={<span style={{color: '#8c8c8c'}}>Мои пациенты</span>} layout="horizontal" valuePropName="checked" style={{marginLeft: 30, marginTop: 28}}>
                            <Switch 
                                checked={onlyMineChecked}
                                onChange={handleOnlyMineChange}
                                style={{
                                    backgroundColor: onlyMineChecked ? '#317CB8' : '#D3D3EA',
                                    color: 'white'
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="sorting" label={<span style={{color: '#8c8c8c'}}>Сортировка</span>}>
                            <Select placeholder="Выберите">
                                <Option value="NameAsc">По имени (А-Я)</Option>
                                <Option value="NameDesc">По имени (Я-А)</Option>
                                <Option value="CreateAsc">По дате создания (старые)</Option>
                                <Option value="CreateDesc">По дате создания (новые)</Option>
                                <Option value="InspectionAsc">По дате осмотров (старые)</Option>
                                <Option value="InspectionDesc">По дате осмотров (новые)</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12} style={{textWrap: 'nowrap'}}>
                        <Form.Item name="pageSize" label={<span style={{color: '#8c8c8c'}}>Число пациентов на странице</span>} style={{width: '24vw'}}>
                            <Select placeholder="Выберите количество">
                                <Option value={5}>5</Option>
                                <Option value={10}>10</Option>
                                <Option value={20}>20</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right'}}>
                        <Button htmlType="submit" style={{marginTop: 28, width: '13vw', backgroundColor: '#317CB8', color: 'white', minWidth: 200}}>Поиск</Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default PatientsFilter;
