import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNav from '../navbars/UserNav';

function AdminLayout() {
    return (
        <div className="h-screen flex flex-col">
            <UserNav role="admin" />
            <div className="w-full h-full">
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout