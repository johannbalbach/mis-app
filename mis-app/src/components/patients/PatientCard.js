import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Pagination, Select, Radio, Typography, Form } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMars, faVenus, faPenToSquare, faMagnifyingGlass, faChevronDown, faChevronRight, faPlus } from '@fortawesome/free-solid-svg-icons';
import patientApi from '../../api/patientApi';
import dictionaryApi from '../../api/dictionaryApi';
import inspectionApi from '../../api/inpsectionApi';

const { Option } = Select;
const { Title, Text } = Typography;

const PatientCard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, size: 4, count: 0 });
    const [filters, setFilters] = useState({});
    const [groupByRepeats, setGroupByRepeats] = useState(false);
    const [diagnosis, setDiagnosis] = useState([]);
    const [expandedInspections, setExpandedInspections] = useState({});
    const [form] = Form.useForm();

    useEffect(() => {
        loadDiagnosis();
    }, []);

    useEffect(() => {
        const fetchPatient = async () => {
            const data = await patientApi.getPatientCard(id);
            setPatient(data);
        };

        const fetchInspections = async () => {
            setLoading(true);
            const data = await patientApi.getInspectionsList({ ...filters, grouped: groupByRepeats, page: pagination.current, size: pagination.size }, id);
            setInspections(data.inspections);
            setPagination({ ...pagination, count: data.pagination.count, size: data.pagination.size, current: data.pagination.current });
            setLoading(false);
        };

        fetchPatient();
        fetchInspections();
    }, [id, filters, pagination.current, pagination.size, groupByRepeats]);

    const handlePaginationChange = (page, pageSize) => {
        setPagination({ ...pagination, current: page, size: pageSize });
    };

    const handleFiltersChange = (changedFilters) => {
        setGroupByRepeats(changedFilters.groupByRepeats);
        setFilters({ ...filters, ...changedFilters });
        setPagination({ ...pagination, current: 1, size: changedFilters.size || 4 });
    };
    
    const loadDiagnosis = async () => {
        setLoading(true);
        const temp = await dictionaryApi.getIcd10root();
        setDiagnosis(temp);
        setLoading(false);
    };

    const handleSearch = (value) => {
        loadDiagnosis(value);
    };

    const fetchInspectionChain = async (inspectionId) => {
        setLoading(true);
        const chainData = await inspectionApi.getInspectionChain(inspectionId);
        setLoading(false);
        return chainData;
    };

    const toggleInspectionChain = async (inspection) => {
        if (expandedInspections[inspection.id]) {
            setExpandedInspections(prev => {
                const newState = { ...prev };
                delete newState[inspection.id];
                return newState;
            });
        } else {
            const chainData = await fetchInspectionChain(inspection.id);
            setExpandedInspections(prev => ({
                ...prev,
                [inspection.id]: chainData
            }));
        }
    };

    const handleAddInspection = (inspection) => {
        const state = { patientId: id };
        if (inspection) {
            state.isFollowUp = true;
            state.previousInspection = inspection;
        }
        navigate('/inspection/create', { state });
    };

    const renderInspectionCard = (inspection, level = 0) => (
        <div key={inspection.id} style={{ marginTop: level === 0 ? 16 : 0, marginLeft: level > 3 ? 60 : level * 20 }}>
            <Card style={{ background: inspection.conclusion === 'Death' ? '#FEEFE9' : '#f0f2f5', marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Text type="secondary" style={{ backgroundColor: '#8182A0', color: 'white', borderRadius: '10%', padding: '0.2em 0.5em' }}>
                            {new Date(inspection.date).toLocaleDateString()}
                        </Text>
                        <Text style={{ fontWeight: 'bold', marginLeft: 5 }}>Амбулаторный осмотр</Text>
                    </Col>
                    <Col span={12} style={{ flexDirection: 'inherit', alignItems: 'end', textAlign: 'end' }}>
                        <>
                            {inspection.hasNested && groupByRepeats && inspection.previousId==null ? (
                                <>
                                <Button type="link" onClick={() => navigate(`/inspection/${inspection.id}`)} style={{color: '#317CB8' }}>
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                    Детали осмотра
                                </Button>
                                <Button type="link" onClick={() => toggleInspectionChain(inspection)} style={{color: '#317CB8' }}>
                                    <FontAwesomeIcon icon={expandedInspections[inspection.id] ? faChevronDown : faChevronRight} />
                                </Button>
                                </>
                            ) : (
                                <>
                                    {!inspection.hasNested && (
                                        <Button type="link" onClick={() => handleAddInspection(inspection)} style={{color: '#317CB8' }}>
                                            <FontAwesomeIcon icon={faPenToSquare}/>
                                            Добавить осмотр
                                        </Button>
                                    )}
                                    <Button type="link" onClick={() => navigate(`/inspection/${inspection.id}`)} style={{color: '#317CB8' }}>
                                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                                        Детали осмотра
                                    </Button>
                                </>
                            )}
                        </>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Text>Заключение: {inspection.conclusion}</Text>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Text>Основной диагноз: {inspection.diagnosis.name} ({inspection.diagnosis.code})</Text>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Text style={{ color: '#8c8c8c' }}>Медицинский работник: {inspection.doctor}</Text>
                    </Col>
                </Row>
            </Card>
            {expandedInspections[inspection.id] && (
                expandedInspections[inspection.id].map((nestedInspection, index) => (
                    <div key={nestedInspection.id}>
                        {<div style={{ 
                            borderLeft: '2px solid #8c8c8c', borderBottom: '2px solid #8c8c8c',
                            height: '40px', width: '10px',
                            position: 'absolute',
                            marginLeft: index > 2 ? 40 : index * 20
                             }}></div>}
                        {renderInspectionCard(nestedInspection, index + 1)}
                    </div>
                ))
            )}
        </div>
    );

    return (
        <Card style={{ width: '80vw', maxWidth: 1600, minWidth: 800, margin: 'auto', marginTop: 30, borderWidth: 0 }}>
            <Row gutter={16} style={{ margin: 'auto' }}>
                <Col span={12}>
                    <Title level={3} style={{ fontWeight: 'bold', fontSize: '2.3rem', textWrap: 'nowrap' }}>Медицинская карта пациента</Title>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                    <Button onClick={() => handleAddInspection()} style={{ marginTop: 20, backgroundColor: '#317CB8', color: 'white' }}>
                        <FontAwesomeIcon icon="fa-solid fa-plus" />
                        Добавить осмотр
                    </Button>
                </Col>
            </Row>
            {patient && (
                <Row gutter={16} style={{ marginTop: 20 }}>
                    <Col span={12}>
                        <Title level={3} style={{ fontWeight: 'bold', fontSize: '1.3rem', textWrap: 'nowrap' }}>
                            {patient.name}
                            {patient.gender === "Male" ? <FontAwesomeIcon icon={faMars} style={{ marginLeft: 8, color: '#317CB8' }} /> : <FontAwesomeIcon icon={faVenus} style={{ marginLeft: 8, color: '#317CB8' }} />}
                        </Title>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                        <p style={{ marginTop: 4 }}>Дата рождения: {new Date(patient.birthday).toLocaleDateString()}</p>
                    </Col>
                </Row>
            )}
            <Card style={{ marginTop: 16, backgroundColor: '#f0f2f5' }}>
                <Form form={form} layout="vertical" onFinish={handleFiltersChange}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="icdRoots" label={<span style={{color: '#8c8c8c'}}>МКБ-10</span>}>
                                <Select
                                    placeholder="Выбрать"
                                    showSearch
                                    onSearch={handleSearch}
                                    loading={loading}
                                    filterOption={false}
                                >
                                    {diagnosis.map(diagnos => (
                                        <Option key={diagnos.id} value={diagnos.id}>{diagnos.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12} style={{ marginTop: 30, textAlign: 'right', textWrap: 'nowrap', flexDirection: 'inherit' }}>
                            <Form.Item name="groupByRepeats">
                                <Radio.Group checked={groupByRepeats}>
                                    <Radio value={true}>
                                        Сгруппировать по повторным
                                    </Radio>
                                    <Radio value={false}>
                                        Показать все
                                    </Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12} style={{ textWrap: 'nowrap' }}>
                            <Form.Item name="size" label={<span style={{color: '#8c8c8c'}}>Число осмотров на странице</span>} style={{ width: '24vw' }}>
                                <Select placeholder="Выберите количество">
                                    <Option value={2}>2</Option>
                                    <Option value={4}>4</Option>
                                    <Option value={8}>8</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <Button type="primary" htmlType="submit" style={{ marginTop: 28, width: '13vw', backgroundColor: '#317CB8', color: 'white' }}>Поиск</Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
            <div style={{ marginTop: 16 }}>
                <Title level={4}>Осмотры</Title>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    {inspections.length > 0 ? (
                        inspections.map(inspection => (
                            <Col xs={24} lg={12} key={inspection.id}>
                                {renderInspectionCard(inspection)}
                            </Col>
                        ))
                    ) : (
                        <Title level={5} style={{ marginLeft: 6 }}>Нет доступных осмотров</Title>
                    )}
                </Row>
                <Pagination
                    current={pagination.current}
                    pageSize={pagination.size}
                    total={pagination.count * pagination.size}
                    onChange={handlePaginationChange}
                    showSizeChanger={false}
                    style={{ textAlign: 'center', marginTop: 16 }}
                />
            </div>
        </Card>
    );
};

export default PatientCard;
