import React, { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
} from "lucide-react";
import Button from "../components/common/Button";
import {
  getNotifications,
  markAllNotificationsRead,
} from "../api/notificationApi";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();

      if (response.data.success) {
        setNotifications(
          response.data.notifications
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();

      setNotifications(
        notifications.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        p-4
        sm:p-6
        lg:p-8
        transition-colors
        duration-500
      "
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div
          className="
            flex
            flex-col
            md:flex-row
            justify-between
            items-start
            md:items-center
            gap-4
            mb-8
          "
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold theme-text tracking-tight">
              Notifications
            </h1>

            <p className="theme-text-secondary mt-1.5 text-sm sm:text-base">
              Stay updated with your downloads, account activity and latest videos.
            </p>
          </div>

          <Button
            variant="primary"
            icon={<CheckCheck size={18} />}
            onClick={handleMarkAllRead}
            className="shrink-0"
          >
            Mark All as Read
          </Button>
        </div>

      {/* Notification List */}
      <div className="space-y-5">
        {loading ? (
          <div
            className="
              theme-card
              theme-border
              border
              rounded-2xl
              p-6
              transition-colors
              duration-500
            "
          >
            <p className="theme-text-secondary">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="
              theme-card
              theme-border
              border
              rounded-2xl
              p-8
              text-center
              transition-colors
              duration-500
            "
          >
            <Bell
              size={40}
              className="
                mx-auto
                mb-4
                theme-text-muted
              "
            />

            <p className="theme-text-secondary">
              No notifications available.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            return (
              <div
                key={item._id}
                className="
                  theme-card
                  theme-border
                  border
                  rounded-2xl
                  p-6
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:border-blue-500
                  hover:shadow-xl
                  hover:shadow-blue-500/20
                  cursor-pointer
                "
              >
                <div className="flex gap-5">
                  {/* Icon */}
                  <div
                    className="
                      w-14
                      h-14
                      rounded-xl
                      bg-blue-500/10
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                    "
                  >
                    <Bell
                      size={28}
                      className="text-blue-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:justify-between
                        sm:items-center
                        gap-2
                      "
                    >
                      <h2
                        className="
                          text-xl
                          font-semibold
                          theme-text
                        "
                      >
                        {item.title}
                      </h2>

                      <span
                        className="
                          text-sm
                          theme-text-muted
                          whitespace-nowrap
                        "
                      >
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <p
                      className="
                        theme-text-secondary
                        mt-2
                      "
                    >
                      {item.message}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!item.isRead && (
                    <div
                      className="
                        w-3
                        h-3
                        rounded-full
                        bg-blue-500
                        mt-2
                        flex-shrink-0
                      "
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
}

export default Notifications;