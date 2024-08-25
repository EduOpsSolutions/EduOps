import React from 'react';
import { Outlet } from 'react-router-dom';
import TeacherNavbar from '../navbars/TeacherNav';

function TeacherLayout() {
    return (
        <div className="h-screen flex flex-col">
            <TeacherNavbar />
            <div className="w-full h-full">
                <Outlet />
            </div>
        </div>
    )
}

export default TeacherLayout