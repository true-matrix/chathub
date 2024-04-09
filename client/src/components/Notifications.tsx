import { useEffect } from 'react';

const NotificationComponent = () => {
  useEffect(() => {
    // Request permission for notifications
    Notification.requestPermission();
  }, []);

  // Function to show notification
  const showNotification = (title: any, body:any) => {
    new Notification(title, { body });
  };

  return { showNotification };
}

export default NotificationComponent;
