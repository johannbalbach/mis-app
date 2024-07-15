import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Select, Table, Typography, Form, Tag, message } from 'antd';
import dayjs from 'dayjs';
import dictionaryApi from '../../api/dictionaryApi';

const { Option } = Select;
const { Title } = Typography;

const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    return (
        <Tag
            color="#1A3F76"
            style={{ color: 'white', marginRight: 3 }}
            closable={closable}
            onClose={onClose}
        >
            {label}
        </Tag>
    );
};

const ReportsPage = () => {
    const [start, setStart] = useState(dayjs());
    const [end, setEnd] = useState(dayjs());
    const [diagnosis, setDiagnosis] = useState([]);
    const [icdRoots, setIcdRoots] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const sortedDiagnosis = [...diagnosis].sort((a, b) => a.code.localeCompare(b.code));

    useEffect(() => {
        loadDiagnosis();
    }, []);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);

            const params = new URLSearchParams();
            params.append('start', start.toISOString());
            params.append('end', end.toISOString());
            icdRoots.forEach(root => params.append('icdRoots', root));

            try {
                const data = await dictionaryApi.getReport(params);
                setReportData(data);
                message.success('Отчёт успешно создан');
            } catch (error) {
                message.error('Ошибка при создании отчёта, попробуйте поменять даты');
                console.error(error);
            }

            setLoading(false);
        };

        if (start && end) {
            fetchReports();
        }
    }, [start, end, icdRoots]);

    const handleFiltersChange = (changedFilters) => {
        setStart(changedFilters.start);
        setEnd(changedFilters.end);
        setIcdRoots(changedFilters.icdRoots || []);
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

    const columns = [
        {
            title: 'Пациент',
            dataIndex: 'patientName',
            key: 'patientName',
            ellipsis: true,
        },
        {
            title: 'Дата рождения',
            dataIndex: 'patientBirthdate',
            key: 'patientBirthdate',
            render: (date) => date == '' ? '' : dayjs(date).format('YYYY-MM-DD'),
            ellipsis: true,
        },
        {
            title: 'Пол',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender) => gender == 'Male' ? 'Мужской' : gender == 'Female' ? 'Женский' : '',
            ellipsis: true,
        },
        ...(reportData?.filters?.icdRoots || []).map((root) => ({
            title: root,
            dataIndex: 'visitsByRoot',
            key: root,
            render: (visits, record) => record.isSummary ? reportData.summaryByRoot[root] || 0 : visits[root] || 0,
            ellipsis: true,
        })),
    ];
    
    const dataSource = [
        ...(reportData?.records || []),
        {
            key: 'summary',
            isSummary: true,
            patientName: 'Итог: ',
            patientBirthdate: '',
            gender: '',
            ...Object.fromEntries((reportData?.filters?.icdRoots || []).map(root => [root, reportData.summaryByRoot[root] || 0]))
        }
    ];

    return (
        <Card style={{ width: '80vw', maxWidth: 1600, minWidth: 800, margin: 'auto', marginTop: 30, borderWidth: 0, backgroundColor: '#f0f2f5'}}>
            <Form form={form} layout="vertical" onFinish={handleFiltersChange}>
                <Title level={3}>Статистика осмотров</Title>
                <div style={{ marginBottom: 20 }}>
                    <Form.Item name="start" label={<span style={{color: '#8c8c8c'}}>Дата с</span>} rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}>
                        <DatePicker showTime />
                    </Form.Item>
                    <Form.Item name="end" label={<span style={{color: '#8c8c8c'}}>Дата по</span>} rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}>
                        <DatePicker showTime />
                    </Form.Item>
                    <Form.Item name="icdRoots" label={<span style={{color: '#8c8c8c'}}>МКБ-10</span>}>
                    <Select
                        mode="multiple"
                        placeholder="Выберите корневые элементы МКБ-10"
                        showSearch
                        onSearch={handleSearch}
                        loading={loading}
                        filterOption={false}
                        tagRender={tagRender}
                        optionLabelProp="label"
                    >
                        {sortedDiagnosis.map(diagnos => (
                            <Option key={diagnos.id} value={diagnos.id} label={diagnos.code}>
                                {diagnos.code} - {diagnos.name}
                            </Option>
                        ))}
                    </Select>
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{ marginBottom: 20, backgroundColor: '#317CB8', color: 'white'  }}
                    >
                        Сгенерировать отчет
                    </Button>
                </div>

                {reportData && (
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        rowKey={(record) => record.isSummary ? 'summary' : record.patientName}
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        bordered
                    />
                )}
            </Form>
        </Card>
    );
};

export default ReportsPage;
