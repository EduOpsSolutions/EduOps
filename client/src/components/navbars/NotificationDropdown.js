import React, { useState } from "react";
import John_logo from "../../assets/images/John.jpg";

const ICONS = {
  BELL: (
    <path
      fill="white"
      d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
    />
  ),
  EYE: (
    <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
  )
};

const RESPONSIVE_STYLES = {
  compact: {
    dropdown: "w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px]",
    trigger: "h-[40px]",
    bellIcon: "20",
    header: "py-2 px-2 sm:py-3 sm:px-4 text-sm sm:text-lg",
    item: "p-2 sm:p-3 text-xs sm:text-base gap-2 sm:gap-3",
    avatar: "w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11",
    smallText: "text-xs sm:text-sm",
    viewAll: "py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm",
    eyeIcon: "w-3 h-3 sm:w-4 sm:h-4"
  },
  normal: {
    dropdown: "w-[400px]",
    trigger: "h-[48px]", 
    bellIcon: "25",
    header: "py-3 px-4 text-lg",
    item: "p-3 text-base gap-3",
    avatar: "w-11 h-11",
    smallText: "text-sm",
    viewAll: "py-3 px-4 text-sm",
    eyeIcon: "w-4 h-4"
  }
};

const NOTIFICATION_TYPES = {
  MESSAGE: { prefix: "New message from", isSystem: false },
  SYSTEM: { prefix: "Course reminder from", isSystem: true }
};

// Sample data
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    sender: "Jese Leos",
    message: "Hey, what's up? All set for the presentation?",
    time: "a few moments ago",
    type: 'MESSAGE'
  },
  {
    id: 2,
    sender: "Admin", 
    message: "Enrollment for A1 German Basic Course ends tomorrow",
    time: "2 hours ago",
    type: 'SYSTEM'
  }
];

const getStyles = (isCompact) => RESPONSIVE_STYLES[isCompact ? 'compact' : 'normal'];

const NotificationDropdown = ({ isCompact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const styles = getStyles(isCompact);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={toggleDropdown}
        className={`${styles.trigger} flex items-center cursor-pointer hover:opacity-80 transition-opacity`}
        title="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          width={styles.bellIcon}
          height={styles.bellIcon}
        >
          {ICONS.BELL}
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`absolute ${isCompact ? 'right-1 sm:right-0' : 'right-0'} mt-2 ${styles.dropdown} bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto`}
          style={{ minWidth: isCompact ? '250px' : '300px' }}
        >
          <div className={`${styles.header} mb-1 font-semibold text-black flex justify-center border-b border-gray-200`}>
            Notifications
          </div>

          {SAMPLE_NOTIFICATIONS.map((notification, index) => {
            const notificationType = NOTIFICATION_TYPES[notification.type];
            
            return (
              <div key={notification.id}>
                <div className={`${styles.item} text-black hover:bg-gray-100 cursor-pointer transition-colors`}>
                  <div className={`flex items-start ${styles.item}`}>
                    <div className="shrink-0">
                      <img
                        className={`rounded-full ${styles.avatar} border-2 border-german-red`}
                        src={John_logo}
                        alt={`${notification.sender} avatar`}
                      />
                    </div>
                    
                    <div className={`w-full min-w-0 ${isCompact ? 'ml-2 sm:ml-3' : 'ml-3'}`}>
                      <div className={`text-left text-gray-700 ${styles.smallText} mb-1`}>
                        {notificationType.prefix}{" "}
                        <span className="font-semibold text-black">{notification.sender}</span>
                      </div>
                      
                      <div className={`text-left text-gray-600 ${styles.smallText} mb-1.5 ${isCompact ? 'line-clamp-3' : 'line-clamp-2'}`}>
                        "{notification.message}"
                      </div>
                      
                      <div className="text-left text-xs text-dark-red-2 font-medium">
                        {notification.time}
                      </div>
                    </div>
                  </div>
                </div>
                {index < SAMPLE_NOTIFICATIONS.length - 1 && (
                  <hr className="border-gray-200 m-0" />
                )}
              </div>
            );
          })}

          <hr className="border-gray-200 m-0" />
          <div className={`${styles.viewAll} flex justify-center items-center text-dark-red-2 font-semibold hover:bg-gray-100 cursor-pointer transition-colors`}>
            <svg
              className={`${styles.eyeIcon} me-2 text-dark-red-2`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 14"
            >
              {ICONS.EYE}
            </svg>
            View all
          </div>
        </div>
      )}     
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationDropdown;