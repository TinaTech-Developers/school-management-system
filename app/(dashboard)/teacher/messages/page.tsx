"use client";

import { useEffect, useRef, useState } from "react";

interface User {
  _id: string;
  name: string;
  role?: string;
}

interface Message {
  _id: string;
  senderId: User;
  receiverId: User;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  user: User;
  lastMessage?: Message;
  unreadCount?: number;
}

export default function TeacherMessages() {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [mergedUsers, setMergedUsers] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 🔥 Get current teacher
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data._id));
  }, []);

  // 🔥 Fetch ALL users
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        // Remove teacher from list
        const filtered = data.filter((u: User) => u._id !== currentUserId);
        setUsers(filtered);
      });
  }, [currentUserId]);

  // 🔥 Fetch teacher conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const res = await fetch("/api/teacher/messages/conversations");
      const data = await res.json();
      setConversations(data);
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Merge all users with conversations
  useEffect(() => {
    const merged = users.map((user) => {
      const existing = conversations.find((c) => c.user._id === user._id);

      if (existing) return existing;

      return {
        _id: user._id,
        user,
        lastMessage: undefined,
        unreadCount: 0,
      };
    });

    setMergedUsers(merged);
  }, [users, conversations]);

  // 🔥 Filter search
  const filteredUsers = mergedUsers.filter((c) =>
    c.user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 🔥 Fetch messages
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      const res = await fetch(
        `/api/teacher/messages?userId=${selectedUser._id}`,
      );
      const data = await res.json();
      if (!data.success) return;

      setMessages((prev) => {
        const newMessages = data.messages;
        const lastMsg = newMessages[newMessages.length - 1];

        if (
          lastMsg &&
          lastMsg.senderId._id !== currentUserId &&
          (!prev.length || lastMsg._id !== prev[prev.length - 1]?._id)
        ) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 1200);
        }

        return newMessages;
      });
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  // 🔥 Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      const res = await fetch("/api/teacher/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser._id,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } finally {
      setSending(false);
    }
  };

  // 🔥 Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 Merge all users with conversations + sort by latest message
  useEffect(() => {
    const merged = users.map((user) => {
      const existing = conversations.find((c) => c.user._id === user._id);

      if (existing) return existing;

      return {
        _id: user._id,
        user,
        lastMessage: undefined,
        unreadCount: 0,
      };
    });

    // ✅ SORT by newest message
    merged.sort((a, b) => {
      const dateA =
        a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;

      const dateB =
        b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;

      return dateB - dateA; // newest first
    });

    setMergedUsers(merged);
  }, [users, conversations]);

  return (
    <div className="w-full mx-auto">
      <h1 className="text-xl font-bold text-gray-800 pb-4">Your Chat</h1>

      <div className="md:flex flex-col md:flex-row gap-6 space-y-4">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-gray-100 rounded-lg shadow p-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600"
          />

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredUsers.map((c) => (
              <div
                key={c.user._id}
                onClick={() => setSelectedUser(c.user)}
                className={`p-3 rounded cursor-pointer flex justify-between items-center ${
                  selectedUser?._id === c.user._id ?
                    "bg-indigo-200"
                  : "hover:bg-gray-100"
                }`}
              >
                <div>
                  <p className="font-semibold text-gray-700 text-sm">
                    {c.user.name}
                  </p>

                  {c.lastMessage && (
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {c.lastMessage.content}
                    </p>
                  )}
                </div>

                {c.unreadCount! > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <p className="text-gray-400 text-sm">No users found.</p>
            )}
          </div>
        </div>

        {/* Chat Window (UNCHANGED DESIGN) */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow p-4 h-[80vh]">
          <p className="font-bold text-gray-700 mb-2 border-b pb-2">
            {selectedUser ?
              `Chatting with ${selectedUser.name}`
            : "Select a user to chat"}
          </p>

          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
            {messages.length === 0 && selectedUser && (
              <p className="text-gray-400 text-sm">No messages yet.</p>
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((m) => {
              const isMine = m.senderId._id === currentUserId;

              return (
                <div
                  key={m._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-xs text-sm ${
                      isMine ?
                        "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p>{m.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-80">
                      <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                      {isMine && (
                        <span
                          className={
                            m.read ? "text-green-500 text-sm" : "text-gray-300"
                          }
                        >
                          {m.read ? "✔✔" : "✔"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {selectedUser && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border px-3 py-2 text-gray-600 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={sending}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
