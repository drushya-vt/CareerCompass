"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import logo5 from "../../resources/logo5.png";
import arrow from "../../resources/arrow.png";
import graph from "../../resources/graph.png";
import send from "../../resources/send.png";
import save from "../../resources/save.jpeg";

import { useState, useEffect, useRef, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LogoutButton from "@/components/LogoutButton";

interface Message {
  type: string;
  text: string; // 'user' | 'bot' | 'system'
}

interface SavedChat {
  chatId: string;
  timestamp: string;
  preview?: string;
}

export default function Chatbot() {
  const chatRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [showPrompts, setShowPrompts] = useState(true);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [infoMessage, setInfoMessage] = useState("");
  const [hasNewTurn, setHasNewTurn] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const [username, setUsername] = useState<string | null>(null);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load username on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
    setShowPrompts(true);
  }, []);

  useEffect(() => {
    if (username) {
      fetchHistory();
    }
  }, [username]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-save conversation after a debounce
  // useEffect(() => {
  //   if (saveTimer.current) clearTimeout(saveTimer.current);
  //   saveTimer.current = setTimeout(async () => {
  //     if (!username || messages.length === 0) return;
  //     try {
  //       await fetch(`${API_BASE_URL}/exit?username=${encodeURIComponent(username)}`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ conversation: messages }),
  //       });
  //     } catch (error) {
  //       console.error("Auto-save error:", error);
  //     }
  //   }, 3000);
  //   return () => {
  //     if (saveTimer.current) clearTimeout(saveTimer.current);
  //   };
  // }, [messages, username]);



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const currentInput = userInput.trim();
    setMessages(prev => [...prev, { type: 'user', text: currentInput }]);
    setUserInput("");
    setShowPrompts(false);

    try {
      const endpoint = username
        ? `${API_BASE_URL}/chatbot?username=${encodeURIComponent(username)}`
        : `${API_BASE_URL}/chatbot`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentInput }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
      setHasNewTurn(true);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { type: 'bot', text: "⚠️ Sorry, something went wrong." }]);
    }
  };

  const handleExampleClick = async (prompt: string) => {
    setShowPrompts(false);
    setUserInput("");
    setMessages(prev => [...prev, { type: 'user', text: prompt }]);

    try {
      const endpoint = username
        ? `${API_BASE_URL}/chatbot?username=${encodeURIComponent(username)}`
        : `${API_BASE_URL}/chatbot`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: prompt }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
      setHasNewTurn(true);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { type: 'bot', text: "⚠️ Sorry, something went wrong." }]);
    }
  };

  const handleExit = async () => {
    try {
      if (!username) {
        console.error("No username found in localStorage");
        return;
      }
      const res = await fetch(
        `${API_BASE_URL}/exit?username=${encodeURIComponent(username)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      await res.json();
      setInfoMessage("Conversation saved");
      setMessages([]);
      setShowPrompts(true);
    } catch (error) {
      console.error("Error saving conversation:", error);
      setInfoMessage("Error saving conversation.");
    }
  };

  const fetchHistory = async () => {
    try {
      if (!username) {
        console.error("No username found in localStorage");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/history?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      const rawChats = data.saved_chats || [];

      // Filter out chats with no user messages
      const previews: SavedChat[] = [];

      await Promise.all(
        rawChats.map(async (item: any) => {
          try {
            const convRes = await fetch(`${API_BASE_URL}/resume/${item.chat_id}?username=${encodeURIComponent(username)}`);
            const convData = await convRes.json();

            const conversation = convData.conversation;
            const hasUserTurn = Array.isArray(conversation) &&
              conversation.some((msg: any) => msg.role === "user");

            if (hasUserTurn) {
              const firstUserMessage = conversation.find((msg: any) => msg.role === "user");
              const sliceLength = getDynamicSliceLength();
              const previewText = firstUserMessage?.content?.slice(0, sliceLength) + "..." || "";

              previews.push({
                chatId: item.chat_id,
                timestamp: item.timestamp,
                preview: previewText || new Date(item.timestamp).toLocaleString()
              });
            }
          } catch (e) {
            console.error("Error checking chat:", item.chat_id, e);
          }
        })
      );

      // Sort most recent first
      previews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setSavedChats(previews);
    } catch (error) {
      console.error("Error fetching history:", error);
      setInfoMessage("Error fetching history.");
    }
  };

  const resumeChat = async (chatId: string) => {
    try {
      if (!username) {
        console.error("No username found in localStorage");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/resume/${chatId}?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setInfoMessage("Chat resumed");

      const resumedMessages: Message[] = data.conversation.map((msg: any) => ({
        type: msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'bot' : 'system',
        text: msg.content
      }));

      setMessages(resumedMessages);
      setHasNewTurn(false);
      setShowPrompts(false); // ✅ Hide "Try Asking" when resuming
    } catch (error) {
      console.error("Error resuming chat:", error);
      setInfoMessage("Error resuming chat.");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInfoMessage("");
    setShowPrompts(true);
    setUserInput("");
    setHasNewTurn(false);
  };

  const isMessageEmpty = userInput.trim() === "";

  // Save button enabled only after a new user-bot turn
  const canSave = hasNewTurn;

  // Delete chat handler
  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/delete/${chatId}?username=${encodeURIComponent(username!)}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete chat");
      setSavedChats((prev) => prev.filter((chat) => chat.chatId !== chatId));
      setInfoMessage("Chat deleted.");
    } catch (error) {
      console.error("Error deleting chat:", error);
      setInfoMessage("Error deleting chat.");
    }
  };


  const getDynamicSliceLength = () => {
    const vw = window.innerWidth;
    const minChars = 20;
    const maxChars = 120;
    const scale = (vw - 320) / (1920 - 320); // scale from min to max width
    return Math.max(
      minChars,
      Math.min(
        maxChars,
        Math.floor(minChars + scale * (maxChars - minChars))
      )
    );
  };

  return (
    <div className="outer-interface">
      {/* === Left Nav === */}
      <div className="chat-side-nav header bg-gradient-to-br from-rose-500 via-violet-500 to-indigo-800 animate-gradient-x bg-[length:400%_400%] flex flex-col">
        <div
          className="chat-header flex items-center space-x-4 p-4 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image src={logo5} alt="CareerCompass Logo" className="w-10 h-30" />
          <span className="logo-name">CareerCompass</span>
        </div>

        <div className="data-visualization-button p-4">
          <Image src={graph} alt="graph" className="w-10 h-30" />
          <Link href="/datavisualization">
            <button type="button" className="data-button">View Career Data Dashboard</button>
          </Link>
          <Image src={arrow} alt="arrow" className="w-8 h-auto" />
        </div>

        <div className="flex gap-4 mt-6 justify-center items-center">
          <button
            onClick={fetchHistory}
            className="px-4 py-2 text-white font-semibold text-sm rounded-lg border border-white hover:bg-white hover:text-[var(--primary-blue)] transition"
          >
            Refresh History
          </button>
          <button
            onClick={handleNewChat}
            className="px-4 py-2 text-white font-semibold text-sm rounded-lg border border-white hover:bg-white hover:text-[var(--primary-blue)] transition"
          >
            New Chat
          </button>
        </div>

        <div className="chat-history flex-1 flex flex-col overflow-hidden p-4 w-full h-full">

          <div className="w-1/2 h-px bg-white/40 mx-auto mb-2" />
          <p className="text-white font-semibold text-sm text-center mt-1 mb-2 w-full px-2">Chat History</p>

          <ul className="chat-history-list flex-1 overflow-y-auto px-0 space-y-0.5">
            {savedChats.map(({ chatId, preview }) => (
              <li key={chatId} className="relative">
                <button
                  className="chat-history-item w-full pr-8"
                  onClick={() => resumeChat(chatId)}
                >
                  <span className="block text-left truncate w-full">{preview}</span>
                </button>
                <button
                  className="absolute top-1/2 -translate-y-3/4 right-1 text-white hover:text-red-500 transition p-1"
                  onClick={() => handleDeleteChat(chatId)}
                  title="Delete chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v1H9V4a1 1 0 011-1z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* === Main Chat Area === */}
      <div className="main-chat-interface flex flex-col justify-between">
        <div className="flex justify-end p-2 bg-transparent shadow-none">
          <LogoutButton />
        </div>

        <div className="chat flex-1 overflow-y-auto p-4 text-sm" ref={chatRef}>
          {messages.map((msg, index) => (
            <div key={index} className={msg.type === "user" ? "user-message" : "bot-message"}>
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

        {/* === Example Prompts === */}
        {showPrompts && (
          <div className="p-4 border-t bg-white/90 rounded-t-2xl">
            <h3 className="text-center text-3xl font-semibold text-gray-700 mb-6">
              💡 Try asking:
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                "What careers align with my skills in Python and data analysis?",
                "How do I transition from graphic design to UX?",
                "What jobs are growing in the healthcare sector?",
                "Which roles match my interest in sustainability and tech?",
              ].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(prompt)}
                  className="bg-indigo-100 text-black font-semibold text-xl px-4 py-2 rounded-xl shadow hover:bg-indigo-200 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === User Input Section === */}
        <div className="user-input px-0 py-0 bg-white">
          <form
            onSubmit={handleSubmit}
            className="form-elements flex items-center gap-1 rounded-xl border border-gray-300 px-4 py-2 bg-gray-50 shadow-sm"
          >
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="auto-expand user-query flex-1 text-sm border-none bg-transparent focus:outline-none resize-none max-h-32 overflow-y-auto"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isMessageEmpty) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask me anything about careers, skills, or job trends..."
              rows={1}
            />
            <button
              type="submit"
              disabled={isMessageEmpty}
              className={`transition-opacity duration-200 ${isMessageEmpty ? "opacity-50 cursor-not-allowed" : "opacity-100"
                }`}
            >
              <Image src={send} alt="Send" className="w-8 h-auto opacity-80 hover:opacity-100 transition" />
            </button>
            
          <button
              type="button"
              className={`transition-opacity duration-200 ${canSave ? "opacity-100" : "opacity-50 cursor-not-allowed"}`}
              onClick={handleExit}
              disabled={!canSave}
            >
              <Image src={save} alt="Save" className="w-8 h-auto opacity-80 hover:opacity-100 transition" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
