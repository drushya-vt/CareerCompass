"use client";
import Image from "next/image";
import Link from "next/link";
import logo5 from "../../resources/logo5.png";
import arrow from "../../resources/arrow.png";
import graph from "../../resources/graph.png";
import send from "../../resources/send.png";
import { useState, useEffect, useRef, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Header from "@/components/Header";

interface Message {
  type: string;
  text: string;
}

export default function Chatbot() {
  const chatRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [showPrompts, setShowPrompts] = useState(true);
  const [savedChats, setSavedChats] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Submit a new chat message using the /chatbot endpoint
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text: userInput }]);
    const currentInput = userInput;
    setUserInput('');

    try {
      const res = await fetch('http://127.0.0.1:8000/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentInput }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    }
  };

  // Auto-submit prompt
  const handleExampleClick = async (prompt: string) => {
    setShowPrompts(false);
    setUserInput(""); // Clear it visually
  
    // Immediately update messages and send prompt
    setMessages((prev) => [...prev, { type: "user", text: prompt }]);
  
    try {
      const res = await fetch("http://127.0.0.1:8000/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: prompt }),
      });
  
      const data = await res.json();
  
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: data.response },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }
  };

  // Handler to save the current conversation
  const handleExit = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setInfoMessage(`Conversation saved as: ${data.file}`);
      setMessages([]); // Optionally clear the messages after exit
    } catch (error) {
      console.error('Error saving conversation:', error);
      setInfoMessage("Error saving conversation.");
    }
  };

  // Fetch the list of saved chat files
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/history', { method: 'GET' });
      const data = await res.json();
      setSavedChats(data.saved_chats || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setInfoMessage("Error fetching history.");
    }
  };

  // Handler to resume a conversation and update UI with its messages
  const resumeChatFromFile = async (fileName: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/resume/${fileName}`, { method: 'GET' });
      const data = await res.json();
      setInfoMessage(data.message || "Chat resumed.");
      const resumedMessages: Message[] = data.conversation.map(
        (msg: { role: string; content: string }) => {
          if (msg.role === "system") {
            return { type: 'system', text: msg.content };
          } else if (msg.role === "user") {
            return { type: 'user', text: msg.content };
          } else if (msg.role === "assistant") {
            return { type: 'bot', text: msg.content };
          }
          return { type: 'user', text: msg.content };
        }
      );
      setMessages(resumedMessages);
    } catch (error) {
      console.error('Error resuming chat:', error);
      setInfoMessage("Error resuming chat.");
    }
  };
  

  const isMessageEmpty = userInput.trim() === "";

  return (
    <div>
      <Header/>
    <div className="outer-interface">
      {/* === Left Nav === */}
      <div className="chat-side-nav header bg-gradient-to-br from-rose-500 via-violet-500 to-indigo-800 animate-gradient-x bg-[length:400%_400%]">
      
        <div className="data-visualization-button">
          <Image src={graph} alt="graph" className="w-10 h-30" />
          <Link href="/datavisualization" target="_blank" rel="noopener noreferrer">
            <button type="button" className="data-button">
              View Career Data Dashboard
            </button>
          </Link>
          <Image src={arrow} alt="arrow" className="w-8 h-auto" />
        </div>
        <div className="chat-history">
          <button onClick={fetchHistory}>Refresh History</button>

          <ul className="chat-history-list">
            {savedChats.map((file, idx) => {
              const readableName = file
                .replace("chat_", "")
                .replace(".json", "")
                .replace(/_/g, " ")
                .replace(/-/g, ":");

              const isActive = infoMessage.includes(file); // check if current chat was resumed

              return (
                <li key={idx}>
                  <button
                    className={`chat-history-item ${isActive ? "active" : ""}`}
                    onClick={() => resumeChatFromFile(file)}
                  >
                    {readableName}
                  </button>
                </li>
              );
            })}
          </ul>
          {infoMessage && <p>{infoMessage}</p>}
        </div>
      </div>

      {/* === Chat Area === */}
      <div className="main-chat-interface flex flex-col justify-between">
        
        {/* === Chat Messages === */}
        <div className="chat flex-1 overflow-y-auto p-4" ref={chatRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.type === "user" ? "user-message" : "bot-message"}
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

        {/* === Example Prompts (Visible Only Initially) === */}
        {showPrompts && (
          <div className="p-4 border-t bg-white/90 rounded-t-2xl">
            <h3 className="text-center text-md text-3xl font-semibold text-gray-700 mb-6">
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

        {/* === User Input === */}
        <div className="user-input border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="form-elements flex items-center gap-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="auto-expand user-query flex-1 border border-gray-300 rounded-xl p-2 resize-none"
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
              className={`transition-opacity duration-200 ${
                isMessageEmpty ? "opacity-50 cursor-not-allowed" : "opacity-100"
              }`}
            >
              <Image src={send} alt="Send Button" className="w-10 h-auto" />
            </button>
          </form>
        </div>
        
        <div className="chat-controls">
          <button onClick={handleExit}>Save Chat / Exit</button>
        </div>
        
      </div>
    </div>
    </div>
  );
}
