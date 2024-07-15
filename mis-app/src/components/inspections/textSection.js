import {Form, Input, Typography} from 'antd';

const { Title, Text} = Typography;
const { TextArea } = Input;


const TextSection = ({title, name, isForm, content}) => {
    return (
        <div style={{ backgroundColor: '#f0f2f5', padding: 20, marginTop: 20 }}>
            <Title level={4} style={{color: '#1A3F76'}}>{title}</Title>
            {isForm ? (
                <Form.Item name={name} rules={[{ required: true, message: 'Пожалуйста, заполните это поле' }]}>
                    <TextArea rows={4} placeholder={'введите ' + title} />
                </Form.Item>
            ) :(
                <Text>{content}</Text>
            )}

        </div>
    )
}

export default TextSection;