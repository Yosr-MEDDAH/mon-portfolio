import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notify: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notify: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (type: NotificationType, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto px-4 py-3 rounded border shadow-sm text-sm font-sans flex items-center justify-between transition-all bg-surface text-content ${
              n.type === 'success'
                ? 'border-s-4 border-s-mg border-border'
                : n.type === 'error'
                ? 'border-s-4 border-s-red-700 border-border'
                : n.type === 'warning'
                ? 'border-s-4 border-s-amber-600 border-border'
                : 'border-s-4 border-s-mg-border border-border'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {n.type === 'success' && <CheckCircle2 size={15} strokeWidth={1.5} className="text-mg shrink-0" />}
              {n.type === 'error' && <AlertCircle size={15} strokeWidth={1.5} className="text-red-700 shrink-0" />}
              {n.type === 'warning' && <AlertTriangle size={15} strokeWidth={1.5} className="text-amber-600 shrink-0" />}
              {n.type === 'info' && <Info size={15} strokeWidth={1.5} className="text-mg shrink-0" />}
              <span>{n.message}</span>
            </div>
            <button
              onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
              className="ms-3 text-content-muted hover:text-content text-xs p-1 rounded transition-colors flex items-center justify-center"
              aria-label="Close notification"
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotify = () => useContext(NotificationContext);
