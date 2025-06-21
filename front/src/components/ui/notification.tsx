'use client';

import { useState, useEffect } from 'react';
import { createContext, useContext } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationProps[];
  showNotification: (notification: Omit<NotificationProps, 'id'>) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const showNotification = ({ type, message, duration = 5000 }: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { id, type, message, duration };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }
    
    return id;
  };

  const hideNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
}

function NotificationContainer() {
  const { notifications, hideNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function Notification({ notification, onClose }: { notification: NotificationProps; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Attendre la fin de l'animation avant de fermer
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const alertClasses = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
  };

  return (
    <div
      className={cn(
        'alert shadow-lg transition-all duration-300 ease-in-out',
        alertClasses[notification.type],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px]'
      )}
      role="alert"
    >
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center gap-2">
          {icons[notification.type]}
          <span>{notification.message}</span>
        </div>
        <button onClick={handleClose} className="btn btn-ghost btn-sm btn-circle">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
