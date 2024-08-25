import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNav from '../navbars/AdminNav';

function TeacherLayout() {
    return (
        <div className="h-screen flex flex-col">
            <AdminNav />
            <div className="w-full h-full">
                <Outlet />
            </div>
        </div>
    )
}

export default TeacherLayout