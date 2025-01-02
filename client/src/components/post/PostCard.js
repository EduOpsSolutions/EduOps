import React from 'react';
import PostTagButton from '../buttons/PostTagButton';

const PostCard = ({ profilePic, postedBy, department, title, content, tag, status, createdAt, updatedAt }) => {
    return (
        <div className="mb-10 bg-white rounded-3xl py-10 px-12 shadow-[0_15px_20px_rgba(0,0,0,0.369)]">
            <div className="grid grid-cols-[auto_1fr_auto] items-center mb-6 gap-x-6">
                <img src={profilePic} alt={`${postedBy} logo`} className="size-20 border-[3px] border-german-yellow rounded-full" />
                <div>
                    <div className="font-bold">{postedBy}</div>
                    <p>{department}</p>
                </div>
            </div>
            <div className="text-3xl mb-[15px]">{title}</div>
            <div className="text-justify mb-9">{content}</div>
            <div className="flex flex-row justify-between items-end">
                <PostTagButton tag={tag} status={status} />
                <div className="font-light">{createdAt}</div>
            </div>
        </div>
    );
};

export default PostCard;
