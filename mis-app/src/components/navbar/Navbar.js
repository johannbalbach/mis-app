import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Layout, Space, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import profileApi from '../../api/profileApi';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/actions/updateUser';

const { Header } = Layout;

const Navbar = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const user = useSelector((state) => state.user.user);
    const token = localStorage.getItem('token');
    const isAuthenticated = token != null;

    useEffect(() => {
        if (isAuthenticated) {
            profileApi.getProfile().then((profile) => {
                dispatch(setUser(profile));
            });
        }
    }, [isAuthenticated, dispatch, user]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        dispatch(setUser(''));
    };

    const profileMenuItems = [
        { key: 'profile', label: (<Link to="/profile">Профиль</Link>) },
        { key: 'logout', label: (<Link to="/">Выход</Link>), onClick: handleLogout }
    ];

    const menuItems = [
        { key: 'patients', label: <Link to="/patients">Пациенты</Link> },
        { key: 'consultations', label: <Link to="/consultations">Консультации</Link> },
        { key: 'reports', label: <Link to="/reports">Отчеты и статистика</Link> },
    ];

    const userMenu = (
        <Menu items={profileMenuItems} />
    );

    const truncateUserName = (name) => {
        const maxLength = 20;
        return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
    };

    return (
        <Header className="navbar" style={{ backgroundColor: '#1A3F76', display: 'flex', paddingInline: 48 }}>
            <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
                <img src={'/svg/24.svg'} style={{ width: '32px', height: '32px' }} alt='logo' />
            </div>
            <Link to="/" style={{ textAlign: 'right', color: 'white', flexDirection: 'column', marginLeft: '48px' }}>
                <div style={{ width: '100px', height: '20px', marginTop: '-10px' }}>
                    Try not to
                </div>
                <div style={{ width: '100px', height: '20px', fontWeight: 'bold' }}>
                    DIE
                </div>
            </Link>
            {isAuthenticated && (
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[location.pathname.split('/')[1]]}
                    items={menuItems}
                    style={{ marginLeft: '64px', backgroundColor: '#1A3F76', alignItems: 'start' }}
                />
            )}
            <div style={{ marginLeft: 'auto', marginRight: '16px', textDecorationColor: '#fffff', alignItems: 'start' }}>
                {isAuthenticated ? (
                    <Dropdown overlay={userMenu} trigger={['click']}>
                        <Typography.Link onClick={e => e.preventDefault()} style={{ maxWidth: 200, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Space style={{color: 'white'}}>
                                {truncateUserName(user?.name || '')}
                                <DownOutlined />
                            </Space>
                        </Typography.Link>
                    </Dropdown>
                ) : (
                    <Link to="/login">
                        <Button type="link" style={{ fontWeight: 'bold', color: 'white' }}>Вход</Button>
                    </Link>
                )}
            </div>
        </Header>
    );
};

export default Navbar;
