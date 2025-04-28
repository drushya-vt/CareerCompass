// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import logo5 from "../../resources/logo5.png";
// import arrow from "../../resources/arrow.png";
// import graph from "../../resources/graph.png";
// import send from "../../resources/send.png";
// import save from "../../resources/save.png";

// import { useState, useEffect, useRef, FormEvent } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import LogoutButton from "@/components/LogoutButton";

// interface Message {
//   type: string;
//   text: string;
// }

// interface SavedChat {
//   chatId: string;
//   timestamp: string;
// }

// export default function Chatbot() {
//   const chatRef = useRef<HTMLDivElement>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [userInput, setUserInput] = useState("");
//   const [showPrompts, setShowPrompts] = useState(true);
//   const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
//   const [infoMessage, setInfoMessage] = useState("");
//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
//   const [username, setUsername] = useState<string | null>(null);

//   // On page load
//   useEffect(() => {
//     setUsername(localStorage.getItem("username"));
//     setShowPrompts(true);
//   }, []);

//   useEffect(() => {
//     if (chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!userInput.trim()) return;
//     setMessages((prev) => [...prev, { type: "user", text: userInput }]);
//     const currentInput = userInput;
//     setUserInput("");
//     setShowPrompts(false);

//     try {
//       const res = await fetch(`${API_BASE_URL}/chatbot`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query: currentInput }),
//       });
//       const data = await res.json();
//       setMessages((prev) => [...prev, { type: "bot", text: data.response }]);
//     } catch (error) {
//       console.error("Error:", error);
//       setMessages((prev) => [
//         ...prev,
//         { type: "bot", text: "Sorry, something went wrong. Please try again." },
//       ]);
//     }
//   };

//   const handleExampleClick = async (prompt: string) => {
//     setShowPrompts(false);
//     setUserInput("");
//     setMessages((prev) => [...prev, { type: "user", text: prompt }]);

//     try {
//       const res = await fetch(`${API_BASE_URL}/chatbot`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ query: prompt }),
//       });

//       const data = await res.json();
//       setMessages((prev) => [...prev, { type: "bot", text: data.response }]);
//     } catch (error) {
//       console.error("Error:", error);
//       setMessages((prev) => [
//         ...prev,
//         { type: "bot", text: "Sorry, something went wrong. Please try again." },
//       ]);
//     }
//   };

//   const handleExit = async () => {
//     try {
//       if (!username) {
//         console.error("No username found in localStorage");
//         return;
//       }
//       const res = await fetch(
//         `${API_BASE_URL}/exit?username=${encodeURIComponent(username)}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       await res.json();
//       setInfoMessage("Conversation saved");
//       setMessages([]);
//       setShowPrompts(true);
//     } catch (error) {
//       console.error("Error saving conversation:", error);
//       setInfoMessage("Error saving conversation.");
//     }
//   };

//   const fetchHistory = async () => {
//     try {
//       if (!username) {
//         console.error("No username found in localStorage");
//         return;
//       }
//       const res = await fetch(
//         `${API_BASE_URL}/history?username=${encodeURIComponent(username)}`,
//         {
//           method: "GET",
//         }
//       );
//       const data = await res.json();
//       const chats = data.saved_chats || [];

//       // ✅ Sort chats by latest timestamp first
//       chats.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

//       const previews: SavedChat[] = chats.map((item: any) => ({
//         chatId: item.chat_id,
//         timestamp: item.timestamp,
//       }));
//       setSavedChats(previews);
//     } catch (error) {
//       console.error("Error fetching history:", error);
//       setInfoMessage("Error fetching history.");
//     }
//   };

//   const resumeChat = async (chatId: string) => {
//     try {
//       if (!username) {
//         console.error("No username found in localStorage");
//         return;
//       }
//       const res = await fetch(
//         `${API_BASE_URL}/resume/${chatId}?username=${encodeURIComponent(username)}`,
//         { method: "GET" }
//       );
//       const data = await res.json();
//       setInfoMessage("Chat resumed");

//       const resumedMessages: Message[] = data.conversation.map(
//         (msg: { role: string; content: string }) => {
//           if (msg.role === "system") return { type: "system", text: msg.content };
//           if (msg.role === "user") return { type: "user", text: msg.content };
//           if (msg.role === "assistant") return { type: "bot", text: msg.content };
//           return { type: "user", text: msg.content };
//         }
//       );
//       setMessages(resumedMessages);

//       setShowPrompts(false); // ✅ Hide "Try Asking" when resuming
//     } catch (error) {
//       console.error("Error resuming chat:", error);
//       setInfoMessage("Error resuming chat.");
//     }
//   };

//   const handleNewChat = () => {
//     setMessages([]);
//     setInfoMessage("");
//     setShowPrompts(true);
//     setUserInput("");
//   };

//   const isMessageEmpty = userInput.trim() === "";

//   return (
//     <div className="outer-interface">
//       {/* === Left Nav === */}
//       <div className="chat-side-nav header bg-gradient-to-br from-rose-500 via-violet-500 to-indigo-800 animate-gradient-x bg-[length:400%_400%] flex flex-col">
//         <div className="chat-header flex items-center space-x-4 p-4">
//           <Image src={logo5} alt="CareerCompass Logo" className="w-10 h-30" />
//           <span className="logo-name">CareerCompass</span>
//         </div>

//         <div className="data-visualization-button p-4">
//           <Image src={graph} alt="graph" className="w-10 h-30" />
//           <Link href="/datavisualization" target="_blank" rel="noopener noreferrer">
//             <button type="button" className="data-button">
//               View Career Data Dashboard
//             </button>
//           </Link>
//           <Image src={arrow} alt="arrow" className="w-8 h-auto" />
//         </div>

//         <div className="chat-history flex-1 flex flex-col overflow-hidden p-4">
//           <div className="flex gap-2 mb-4 flex-col">
//             <button onClick={handleNewChat} className="newchat-button">
//               ➕ New Conversation
//             </button>
//             <button onClick={fetchHistory} className="newchat-button">
//               🔄 Refresh History
//             </button>
//           </div>

//           <ul className="chat-history-list flex-1 overflow-y-auto pr-2">
//             {savedChats.map(({ chatId, timestamp }) => (
//               <li key={chatId}>
//                 <button
//                   className="chat-history-item"
//                   onClick={() => resumeChat(chatId)}
//                 >
//                   {new Date(timestamp).toLocaleString()}
//                 </button>
//               </li>
//             ))}
//           </ul>
//           {infoMessage && <p>{infoMessage}</p>}
//         </div>
//       </div>

//       {/* === Main Chat Area === */}
//       <div className="main-chat-interface flex flex-col justify-between">
//         <div className="flex justify-end p-4 bg-white shadow">
//           <LogoutButton />
//         </div>

//         <div className="chat flex-1 overflow-y-auto p-4" ref={chatRef}>
//           {messages.map((msg, index) => (
//             <div key={index} className={msg.type === "user" ? "user-message" : "bot-message"}>
//               {msg.type === "bot" ? (
//                 <div className="prose">
//                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                     {msg.text}
//                   </ReactMarkdown>
//                 </div>
//               ) : (
//                 <p>{msg.text}</p>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* === Example Prompts === */}
//         {showPrompts && (
//           <div className="p-4 border-t bg-white/90 rounded-t-2xl">
//             <h3 className="text-center text-3xl font-semibold text-gray-700 mb-6">
//               💡 Try asking:
//             </h3>
//             <div className="flex flex-wrap gap-3 justify-center">
//               {[
//                 "What careers align with my skills in Python and data analysis?",
//                 "How do I transition from graphic design to UX?",
//                 "What jobs are growing in the healthcare sector?",
//                 "Which roles match my interest in sustainability and tech?",
//               ].map((prompt, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleExampleClick(prompt)}
//                   className="bg-indigo-100 text-black font-semibold text-xl px-4 py-2 rounded-xl shadow hover:bg-indigo-200 transition"
//                 >
//                   {prompt}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* === User Input Section === */}
//         <div className="user-input border-t border-gray-200 p-4 bg-white">
//           <form onSubmit={handleSubmit} className="form-elements flex items-center gap-4">
//             <textarea
//               value={userInput}
//               onChange={(e) => setUserInput(e.target.value)}
//               className="auto-expand user-query flex-1 border border-gray-300 rounded-xl p-2 resize-none"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && !e.shiftKey && !isMessageEmpty) {
//                   e.preventDefault();
//                   handleSubmit(e);
//                 }
//               }}
//               placeholder="Ask me anything about careers, skills, or job trends..."
//               rows={1}
//             />
//             <button
//               type="submit"
//               disabled={isMessageEmpty}
//               className={`transition-opacity duration-200 ${
//                 isMessageEmpty ? "opacity-50 cursor-not-allowed" : "opacity-100"
//               }`}
//             >
//               <Image src={send} alt="Send Button" className="w-10 h-auto" />
//             </button>

//             <button
//               type="button"
//               onClick={handleExit}
//               className="transition-opacity duration-200"
//             >
//               <Image src={save} alt="Save Button" className="w-10 h-auto" />
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
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
import save from "../../resources/save.png";
import LogoutButton from "@/components/LogoutButton";

interface Message {
  type: string;  // 'user' | 'bot'
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

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !username) return;
    
    const currentInput = userInput.trim();
    setMessages((prev) => [...prev, { type: 'user', text: currentInput }]);
    setUserInput('');
    setShowPrompts(false);

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot?username=${encodeURIComponent(username)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentInput }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { type: 'bot', text: "⚠️ Sorry, something went wrong." }]);
    }
  };

  const handleExampleClick = async (prompt: string) => {
    setShowPrompts(false);
    setMessages((prev) => [...prev, { type: 'user', text: prompt }]);
    setUserInput('');

    if (!username) return;

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot?username=${encodeURIComponent(username)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { type: 'bot', text: "⚠️ Sorry, something went wrong." }]);
    }
  };

  const handleExit = async () => {
    if (!username) return;
    try {
      await fetch(`${API_BASE_URL}/exit?username=${encodeURIComponent(username)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      setInfoMessage("✅ Conversation saved.");
      setMessages([]);
      setShowPrompts(true);
    } catch (error) {
      console.error("Error saving chat:", error);
      setInfoMessage("⚠️ Error saving conversation.");
    }
  };

  const fetchHistory = async () => {
    if (!username) return;
    try {
      const res = await fetch(`${API_BASE_URL}/history?username=${encodeURIComponent(username)}`, {
        method: "GET",
      });
      const data = await res.json();
      const chats = (data.saved_chats || []).sort(
        (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const previews: SavedChat[] = chats.map((item: any) => ({
        chatId: item.chat_id,
        timestamp: item.timestamp,
      }));
      setSavedChats(previews);
    } catch (error) {
      console.error("Error fetching history:", error);
      setInfoMessage("⚠️ Error fetching history.");
    }
  };

  const resumeChat = async (chatId: string) => {
    if (!username) return;
    try {
      const res = await fetch(`${API_BASE_URL}/resume/${chatId}?username=${encodeURIComponent(username)}`, {
        method: "GET",
      });
      const data = await res.json();
      setInfoMessage("✅ Chat resumed.");
      const resumedMessages: Message[] = data.conversation.map((msg: { role: string; content: string }) => {
        if (msg.role === 'user') return { type: 'user', text: msg.content };
        if (msg.role === 'assistant') return { type: 'bot', text: msg.content };
        return { type: 'system', text: msg.content };
      });
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
            <button type="button" className="data-button">
              View Career Data Dashboard
            </button>
          </Link>
          <Image src={arrow} alt="arrow" className="w-8 h-auto" />
        </div>

        <div className="chat-history flex-1 overflow-hidden p-4">
          <div className="flex flex-col gap-2 mb-4">
            <button onClick={handleNewChat} className="newchat-button">
              ➕ New Conversation
            </button>
            <button onClick={fetchHistory} className="newchat-button">
              🔄 Refresh History
            </button>
          </div>

          <ul className="chat-history-list flex-1 overflow-y-auto pr-2">
            {savedChats.map(({ chatId, timestamp }) => (
              <li key={chatId}>
                <button
                  className="chat-history-item"
                  onClick={() => resumeChat(chatId)}
                >
                  {new Date(timestamp).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
          {infoMessage && <p className="text-sm mt-2">{infoMessage}</p>}
        </div>
      </div>

      {/* === Main Chat Area === */}
      <div className="main-chat-interface flex flex-col justify-between">
        <div className="flex justify-end p-4 bg-white shadow">
          <LogoutButton />
        </div>

        <div className="chat flex-1 overflow-y-auto p-4" ref={chatRef}>
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
            <h3 className="text-center text-2xl font-bold text-gray-700 mb-4">
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
                  className="bg-indigo-100 text-black font-semibold px-4 py-2 rounded-xl shadow hover:bg-indigo-200 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === User Input === */}
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
            <button type="button" onClick={handleExit} className="transition-opacity duration-200">
              <Image src={save} alt="Save" className="w-10 h-auto" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
