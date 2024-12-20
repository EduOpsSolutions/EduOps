import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNav from '../navbars/UserNav';

function TeacherLayout() {
    return (
        <div className="h-screen flex flex-col">
            <UserNav />
            <div className="w-full h-full">
                <Outlet />
            </div>
        </div>
    )
}

export default TeacherLayout