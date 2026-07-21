import React from "react";
import {
  Download,
  Crown,
  Bell,
  ShieldCheck,
  CheckCheck,
} from "lucide-react";

import Button from "../components/common/Button";

const notifications = [
  {
    title: "Download Completed",
    message: "React Full Course download completed successfully.",
    time: "2 minutes ago",
    icon: Download,
    color: "text-blue-500",
  },
  {
    title: "Daily Limit Reached",
    message: "You have reached your free download limit. Upgrade to Premium.",
    time: "1 hour ago",
    icon: Crown,
    color: "text-yellow-500",
  },
  {
    title: "New Video Added",
    message: "Node JS Masterclass is now available.",
    time: "Yesterday",
    icon: Bell,
    color: "text-green-500",
  },
  {
    title: "Security Alert",
    message: "Your account was accessed successfully.",
    time: "2 days ago",
    icon: ShieldCheck,
    color: "text-red-500",
  },
];

function Notifications() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Notifications
          </h1>

          <p className="text-gray-400 mt-2">
            Stay updated with your downloads, account activity and latest videos.
          </p>

        </div>

        <Button
          variant="primary"
          icon={<CheckCheck size={18} />}
        >
          Mark All as Read
        </Button>

      </div>

      {/* Notification List */}

      <div className="space-y-5">

        {notifications.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer"
            >

              <div className="flex gap-5">

                {/* Icon */}

                <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center">

                  <Icon
                    size={28}
                    className={item.color}
                  />

                </div>

                {/* Content */}

                <div className="flex-1">

                  <div className="flex justify-between items-center">

                    <h2 className="text-xl font-semibold">
                      {item.title}
                    </h2>

                    <span className="text-sm text-gray-500">
                      {item.time}
                    </span>

                  </div>

                  <p className="text-gray-400 mt-2">
                    {item.message}
                  </p>

                </div>

                {/* Unread Indicator */}

                <div className="w-3 h-3 rounded-full bg-blue-500 mt-2"></div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Notifications;