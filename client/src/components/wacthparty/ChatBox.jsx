import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";

function ChatBox({
  roomCode,
  userId,
  userName,
  socket,
}) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // =========================================================
  // SOCKET CHAT LISTENERS
  // =========================================================

  useEffect(() => {
    if (!socket || !roomCode) return;

    const handleChatHistory = (history) => {
      console.log("Chat history:", history);

      setMessages(
        Array.isArray(history)
          ? history
          : []
      );
    };

    const handleReceiveMessage = (newMessage) => {
      console.log(
        "New chat message:",
        newMessage
      );

      setMessages((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        newMessage,
      ]);
    };

    socket.on(
      "chat-history",
      handleChatHistory
    );

    socket.on(
      "receive-message",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "chat-history",
        handleChatHistory
      );

      socket.off(
        "receive-message",
        handleReceiveMessage
      );
    };
  }, [socket, roomCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    if (!socket) {
      console.error(
        "Socket is not available"
      );
      return;
    }

    const chatMessage = {
      id: `${userId}-${Date.now()}`,
      roomCode,
      userId,
      senderId: userId,
      sender: userName,
      userName,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    // The server broadcasts the message
    // through "receive-message".
    socket.emit(
      "send-message",
      chatMessage
    );

    setMessage("");
  };

  return (
    <div
      className="
        flex
        flex-col
        h-[400px]
        theme-bg
        theme-text
        transition-colors
        duration-500
      "
    >
      {/* =====================================================
          MESSAGES
      ===================================================== */}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <p className="theme-text-muted text-sm">
                No messages yet
              </p>

              <p className="theme-text-secondary text-xs mt-1">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderId =
              msg.userId ||
              msg.senderId ||
              msg.sender?._id ||
              msg.sender?.id;

            const senderName =
              msg.userName ||
              msg.senderName ||
              (typeof msg.sender === "string"
                ? msg.sender
                : msg.sender?.name) ||
              "User";

            const messageText =
              msg.message ||
              msg.text ||
              "";

            const isCurrentUser =
              String(senderId) ===
              String(userId);

            return (
              <div
                key={
                  msg.id ||
                  msg._id ||
                  `${senderId || "user"}-${index}-${messageText}`
                }
                className={`flex ${
                  isCurrentUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    isCurrentUser
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "theme-card theme-text rounded-bl-md"
                  }`}
                >
                  {/* SENDER NAME */}
                  {!isCurrentUser && (
                    <p className="text-xs font-semibold text-blue-400 mb-1">
                      {senderName}
                    </p>
                  )}

                  {/* MESSAGE */}
                  <p className="text-sm break-words">
                    {messageText}
                  </p>

                  {/* TIME */}
                  {msg.createdAt && (
                    <p
                      className={`text-[10px] mt-1 ${
                        isCurrentUser
                          ? "text-blue-200"
                          : "theme-text-muted"
                      }`}
                    >
                      {new Date(
                        msg.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* =====================================================
          MESSAGE INPUT
      ===================================================== */}

      <form
        onSubmit={handleSendMessage}
        className="
          p-3
          theme-border
          border-t
          flex
          items-center
          gap-2
        "
      >
        {/* INPUT */}
        <input
          type="text"
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Type a message..."
          className="
            flex-1
            min-w-0
            theme-input
            theme-text
            theme-border
            border
            rounded-xl
            px-3
            py-2.5
            text-sm
            outline-none
            transition-all
            duration-300
            placeholder:text-gray-400
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
          "
        />

        {/* SEND BUTTON */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="
            w-10
            h-10
            shrink-0
            flex
            items-center
            justify-center
            rounded-xl
            bg-blue-600
            hover:bg-blue-500
            text-white
            disabled:opacity-40
            disabled:cursor-not-allowed
            transition
          "
        >
          <Send
            size={17}
            className="text-white"
            strokeWidth={2.5}
          />
        </button>
      </form>
    </div>
  );
}

export default ChatBox;