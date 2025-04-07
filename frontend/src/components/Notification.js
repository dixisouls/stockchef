import React, { useState, useEffect, createContext, useContext } from "react";

// Single notification component
const Notification = ({ message, type = "info", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        startExit();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const startExit = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 300); // Match animation duration
  };

  if (!visible) return null;

  return (
    <div
      className={`notification notification-${type} ${
        exiting ? "notification-exit" : ""
      }`}
    >
      <div className="notification-content">{message}</div>
      <button
        className="notification-close"
        onClick={startExit}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

// NotificationContext for global notifications
export const NotificationContext = createContext({
  showNotification: () => {},
  removeNotification: () => {},
});

// Provider component to wrap app
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification, removeNotification }}
    >
      {children}
      <div className="notification-container">
        {notifications.map(({ id, message, type, duration }) => (
          <Notification
            key={id}
            message={message}
            type={type}
            duration={duration}
            onClose={() => removeNotification(id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => useContext(NotificationContext);

export default Notification;
