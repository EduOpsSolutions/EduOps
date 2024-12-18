import React from 'react'

function PostTagButton({tag, status, onClick}) {
    const isLocked = status === 'locked';

    const buttonClass = tag === 'global' ?  "border-[#CCA421] bg-german-yellow" : "border-[#896B42] bg-[#DDA75D]";
    const buttonText = tag === 'global' ?  "Global" : "Broadcast";
    const buttonIcon = tag === 'global' 
        ? (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-[22px] fill-black stroke-2 me-2">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM8.547 4.505a8.25 8.25 0 1 0 11.672 8.214l-.46-.46a2.252 2.252 0 0 1-.422-.586l-1.08-2.16a.414.414 0 0 0-.663-.107.827.827 0 0 1-.812.21l-1.273-.363a.89.89 0 0 0-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.211.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 0 1-1.81 1.025 1.055 1.055 0 0 1-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.654-.261a2.25 2.25 0 0 1-1.384-2.46l.007-.042a2.25 2.25 0 0 1 .29-.787l.09-.15a2.25 2.25 0 0 1 2.37-1.048l1.178.236a1.125 1.125 0 0 0 1.302-.795l.208-.73a1.125 1.125 0 0 0-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 0 1-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 0 1-1.458-1.137l1.279-2.132Z" clipRule="evenodd" />
            </svg>)
        : (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-[22px] me-2">
                <path d="M21 10.063V4C21 3.44772 20.5523 3 20 3H19C17.0214 4.97864 13.3027 6.08728 11 6.61281V17.3872C13.3027 17.9127 17.0214 19.0214 19 21H20C20.5523 21 21 20.5523 21 20V13.937C21.8626 13.715 22.5 12.9319 22.5 12 22.5 11.0681 21.8626 10.285 21 10.063ZM5 7C3.89543 7 3 7.89543 3 9V15C3 16.1046 3.89543 17 5 17H6L7 22H9V7H5Z"></path>
            </svg>);


    return (
        // Disable the button if it is not in the post modal
        <button 
            type="button" 
            onClick={isLocked ? undefined : onClick}
            className={`flex flex-row items-center py-[5px] px-3 border-2 ${buttonClass}`} 
            disabled={isLocked}
        >
            {buttonIcon}
            <p className="font-semibold">{buttonText}</p>
        </button>
    )
}

export default PostTagButton