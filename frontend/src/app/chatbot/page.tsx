'use client';

import { useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import logo5 from "../../resources/logo5.png";
import arrow from "../../resources/arrow.png";
import graph from "../../resources/graph.png";
import send from "../../resources/send.png";
import LogoutButton from "@/components/LogoutButton";

interface Message {
  type: string;  // 'user' | 'bot' | 'system'
  text: string;
}

interface SavedChat {
  chatId: string;
  timestamp: string;
}

export default function Chatbot() {
  const chatRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [showPrompts, setShowPrompts] = useState(true);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [infoMessage, setInfoMessage] = useState("");
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const [username, setUsername] = useState<string | null>(null);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load username on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      alert("Please login first!");
      window.location.href = "/auth/login";
    }
    setShowPrompts(true);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-save conversation after a debounce
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!username || messages.length === 0) return;
      try {
        await fetch(`${API_BASE_URL}/exit?username=${encodeURIComponent(username)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation: messages }),
        });
      } catch (error) {
        console.error("Auto-save error:", error);
      }
    }, 3000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [messages, username]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !username) return;

    const currentInput = userInput.trim();
    setMessages(prev => [...prev, { type: 'user', text: currentInput }]);
    setUserInput('');
    setShowPrompts(false);

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot?username=${encodeURIComponent(username)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentInput }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { type: 'bot', text: "⚠️ Sorry, something went wrong." }]);
    }
  };

  const handleExampleClick = async (prompt: string) => {
    setShowPrompts(false);
    setMessages(prev => [...prev, { type: 'user', text: prompt }]);
    setUserInput('');
    if (!username) return;

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot?username=${encodeURIComponent(username)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { type: 'bot', text: "⚠️ Sorry, something went wrong." }]);
    }
  };

  const fetchHistory = async () => {
    if (!username) return;
    try {
      const res = await fetch(`${API_BASE_URL}/history?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      const rawChats = data.saved_chats || [];

      // Filter out chats with no user messages
      const previews: SavedChat[] = [];
      await Promise.all(
        rawChats.map(async (item: any) => {
          try {
            const convRes = await fetch(
              `${API_BASE_URL}/resume/${item.chat_id}?username=${encodeURIComponent(username)}`
            );
            const convData = await convRes.json();
            const hasUserTurn =
              Array.isArray(convData.conversation) &&
              convData.conversation.some((msg: any) => msg.role === 'user');
            if (hasUserTurn) {
              previews.push({ chatId: item.chat_id, timestamp: item.timestamp });
            }
          } catch (e) {
            console.error("Error checking chat:", item.chat_id, e);
          }
        })
      );

      previews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSavedChats(previews);
    } catch (error) {
      console.error("Error fetching history:", error);
      setInfoMessage("⚠️ Error fetching history.");
    }
  };

  const resumeChat = async (chatId: string) => {
    if (!username) return;
    try {
      const res = await fetch(`${API_BASE_URL}/resume/${chatId}?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setInfoMessage("✅ Chat resumed.");
      const resumedMessages: Message[] = data.conversation.map((msg: any) => ({
        type: msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'bot' : 'system',
        text: msg.content
      }));
      setMessages(resumedMessages);
      setShowPrompts(false);
    } catch (error) {
      console.error("Error resuming chat:", error);
      setInfoMessage("⚠️ Error resuming chat.");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setShowPrompts(true);
    setUserInput('');
    setInfoMessage('');
  };

  const isMessageEmpty = userInput.trim() === '';

  return (
    <div className="outer-interface">
      {/* === Left Side Nav === */}
      <div className="chat-side-nav header bg-gradient-to-br from-rose-500 via-violet-500 to-indigo-800 animate-gradient-x bg-[length:400%_400%] flex flex-col">
        <div className="chat-header flex items-center space-x-4 p-4">
          <Image src={logo5} alt="CareerCompass Logo" className="w-10 h-10" />
          <span className="logo-name font-bold text-xl">CareerCompass</span>
        </div>

        <div className="data-visualization-button p-4">
          <Image src={graph} alt="graph" className="w-10 h-10" />
          <Link href="/datavisualization" target="_blank" rel="noopener noreferrer">
            <button type="button" className="data-button">View Career Data Dashboard</button>
          </Link>
          <Image src={arrow} alt="arrow" className="w-8 h-auto" />
        </div>

        <div className="chat-history flex-1 overflow-hidden p-4">
          <div className="flex flex-col gap-2 mb-4">
            <button onClick={handleNewChat} className="newchat-button">➕ New Conversation</button>
            <button onClick={fetchHistory} className="newchat-button">🔄 Refresh History</button>
          </div>
          <ul className="chat-history-list flex-1 overflow-y-auto pr-2">
            {savedChats.map(({ chatId, timestamp }) => (
              <li key={chatId}>
                <button className="chat-history-item" onClick={() => resumeChat(chatId)}>
                  {new Date(timestamp).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="main-chat-interface flex flex-col justify-between">
        <div className="flex justify-end p-4 bg-white shadow">
          <LogoutButton />
        </div>

        <div className="chat flex-1 overflow-y-auto p-4" ref={chatRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.type === "user"
                  ? "user-message"
                  : msg.type === "bot"
                  ? "bot-message"
                  : "system-message"
              }
            >
              {msg.type === "bot" ? (
                <div className="prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          ))}
        </div>

        {showPrompts && (
          <div className="p-4 border-t bg-white/90 rounded-t-2xl">
            <h3 className="text-center text-2xl font-bold text-gray-700 mb-4">💡 Try asking:</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                "What careers align with my skills in Python and data analysis?",
                "How do I transition from graphic design to UX?",
                "What jobs are growing in the healthcare sector?",
                "Which roles match my interest in sustainability and tech?",
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(prompt)}
                  className="bg-indigo-100 text-black font-semibold px-4 py-2 rounded-xl shadow hover:bg-indigo-200 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="user-input border-t p-4 bg-white">
          <form onSubmit={handleSubmit} className="form-elements flex items-center gap-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="auto-expand user-query flex-1 border border-gray-300 rounded-xl p-2 resize-none"
              placeholder="Ask anything about careers, skills, jobs..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isMessageEmpty) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
            />
            <button type="submit" disabled={isMessageEmpty} className="transition-opacity duration-200">
              <Image src={send} alt="Send" className="w-10 h-auto" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
