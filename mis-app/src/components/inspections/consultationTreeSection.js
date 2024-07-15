import React, { useEffect, useState } from 'react';
import { Card, List, Button, Input, Typography, Tooltip, message } from 'antd';
import { EditOutlined, CommentOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import consultationApi from '../../api/consultationsApi';
import { useSelector } from 'react-redux';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ConsultationTreeSection = ({ consultations }) => {
    const [consultationDetails, setConsultationDetails] = useState([]);
    const [editingComment, setEditingComment] = useState(null);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [replyingToComment, setReplyingToComment] = useState(null);
    const [newReplyContent, setNewReplyContent] = useState('');
    const [expandedComments, setExpandedComments] = useState({});
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        const loadConsultations = async () => { 
            const data = await Promise.all(consultations.map(c => consultationApi.getConsultation(c.id)));
            setConsultationDetails(data);
        };

        loadConsultations();
    }, [consultations]);

    const handleToggleExpand = (commentId) => {
        setExpandedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const handleEditComment = (commentId) => {
        setEditingComment(commentId);
    };

    const handleSaveComment = async (commentId) => {
        await consultationApi.editComment({ content: newCommentContent }, commentId);
        const updatedConsultations = consultationDetails.map(consultation => {
            consultation.comments.map(comment => {
                if (comment.id === commentId){
                    comment.modifiedDate = dayjs().toISOString();
                    comment.content = newCommentContent;
                }
            })
            return consultation;
        });
        setConsultationDetails(updatedConsultations);
        setEditingComment(null);
        setNewCommentContent('');
    };

    const handleReply = (commentId) => {
        setReplyingToComment(commentId);
    };

    const handleSaveReply = async (consultationId, parentId, speciality) => {
        try {
            const newComment = await consultationApi.addComment({ content: newReplyContent, parentId }, consultationId);
            const updatedConsultations = consultationDetails.map(consultation => {
                if (consultation.id === consultationId) {
                    return {
                        ...consultation,
                        comments: [...consultation.comments, {
                            id: newComment.id,
                            createTime: dayjs().toISOString(),
                            modifiedDate: null,
                            content: newReplyContent,
                            authorId: user.id,
                            author: user.name,
                            parentId
                        }]
                    };
                }
                return consultation;
            });
            setConsultationDetails(updatedConsultations);
        }
        catch(error) {
            message.error(`Ошибка при создании осмотра. Только ${speciality.name} может писать комментарии`);
            console.error();
        }
        setReplyingToComment(null);
        setNewReplyContent('');
    };

    const renderComment = (comment, isRoot, speciality, level = 1, consultationId, authorName) => {
        const childComments = consultationDetails
            .find(c => c.id === consultationId)?.comments
            .filter(c => c.parentId === comment.id) || [];

        return (
            <div key={comment.id} style={{ marginLeft: 20, position: 'relative' }}>
                {comment.parentId && (
                    <div style={{ 
                        borderLeft: '2px solid #8c8c8c', borderBottom: '2px solid #8c8c8c',
                        height: '40px', width: '10px',
                        position: 'absolute',
                        marginLeft: -10
                    }}></div>
                )}
                <div>
                    <Text style={{ fontWeight: 'bold' }}>{isRoot ? comment.author.name : comment.author}</Text>
                    <Text type="secondary"> ({isRoot ? "автор" : comment.author == authorName ? "автор" : speciality.name})</Text>
                </div>
                <div style={{ marginLeft: 10 }}>
                    <Text>{comment.content}</Text>
                    {comment.modifiedDate != comment.createTime  && (
                        <Tooltip title={`Изменено: ${dayjs(comment.modifiedDate).format('YYYY.MM.DD HH:mm')}`}>
                            <Text type="secondary" style={{ marginLeft: 8 }}>изменено</Text>
                        </Tooltip>
                    )}
                </div>
                <div>
                    <Text type="secondary">{dayjs(comment.createTime).format('YYYY.MM.DD HH:mm')}</Text>
                    {childComments.length > 0 && (<Button type="link" style={{ color: '#317CB8' }} onClick={() => handleToggleExpand(comment.id)}>
                        {expandedComments[comment.id] ? 'Скрыть ответы' : 'Показать ответы'}
                    </Button>)}
                    <Button type="link" style={{ color: '#317CB8' }} onClick={() => handleReply(comment.id)}>
                        Ответить
                    </Button>
                    {(user.id == comment.authorId || user.id == comment.author.id) && (
                        <Button type="link" style={{ color: '#317CB8' }} onClick={() => handleEditComment(comment.id)}>
                            Изменить
                        </Button>
                    )}
                </div>
                {replyingToComment === comment.id && (
                    <div>
                        <TextArea
                            value={newReplyContent}
                            onChange={(e) => setNewReplyContent(e.target.value)}
                        />
                        <div style={{marginTop: 5, marginBottom: 5}}>
                            <Button
                                icon={<SaveOutlined />}
                                onClick={() => handleSaveReply(consultationId, comment.id, speciality)}
                                style={{backgroundColor: '#317CB8', color: 'white'}}
                            >
                                Сохранить ответ
                            </Button>
                            <Button
                                icon={<CloseOutlined />}
                                onClick={() => setReplyingToComment(null)}
                                style={{marginLeft: 5, backgroundColor: '#D3D3EA', color: 'white'}}
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                )}
                {editingComment === comment.id && (
                    <div>
                        <TextArea
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                        />
                        <div style={{marginTop: 5, marginBottom: 5}}>
                            <Button
                                icon={<SaveOutlined />}
                                onClick={() => handleSaveComment(comment.id)}
                                style={{backgroundColor: '#317CB8', color: 'white'}}
                            >
                                Сохранить
                            </Button>
                            <Button
                                icon={<CloseOutlined />}
                                onClick={() => setEditingComment(null)}
                                style={{marginLeft: 5, backgroundColor: '#D3D3EA', color: 'white'}}
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                )}
                {expandedComments[comment.id] && childComments.map(child => renderComment(child, false, speciality, level + 1, consultationId, authorName))}
            </div>
        );
    };

    return (
        <React.Fragment>
            {consultations.map((consultation) => (
                <div key={consultation.id} style={{ backgroundColor: '#f0f2f5', padding: 20, marginTop: 20 }}>
                    <Title level={4} style={{ color: '#1A3F76' }}>Консультации</Title>
                    <div title={consultation.speciality.name}>
                        <div>
                            <Text style={{ fontWeight: 'bold', fontSize: '1.0rem' }}>Автор: {consultation.rootComment.author.name}</Text>
                        </div> 
                        <div>
                            <Text type="secondary">Специализация консультанта: {consultation.speciality.name}</Text>
                        </div> 
                        <div style={{ marginTop: 15 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: '1.0rem' }}>Комментарии:</Text>
                        </div>
                        {renderComment(consultation.rootComment, true, consultation.speciality, 1, consultation.id, consultation.rootComment.author.name)}
                    </div>
                </div>
            ))}
        </React.Fragment>
    );
};

export default ConsultationTreeSection;
