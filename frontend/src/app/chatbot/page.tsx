// "use client"
// import Image from "next/image";
// // import Link from "next/link";
// import logo from "../../resources/logo.png";
// import arrow from "../../resources/arrow.png";
// import graph from "../../resources/graph.png";
// import send from "../../resources/send.png";
// import { useState } from 'react';
// import { useEffect, useRef } from 'react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';





// interface Message {
//     type: string;
//     text: string;
// }


// export default function Chatbot() {

//   const chatRef = useRef<HTMLDivElement>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [userInput, setUserInput] = useState('');

//   useEffect(() => {
//     if (chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!userInput.trim()) return;
//     setMessages([...messages, { type: 'user', text: userInput }]);
//     setUserInput('');

//     try {
//         // Sending the query to the FastAPI backend
//         const res = await fetch('http://127.0.0.1:8000/query', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ query: userInput }),
//         });
  
//         const data = await res.json();
//         // Adding the AI's response to the messages
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { type: 'bot', text: data.response },
//         ]);
        
//       } catch (error) {
//         console.error('Error:', error);
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { type: 'bot', text: 'Sorry, something went wrong. Please try again.' },
//         ]);
//       }
  
//   };

//   const isMessageEmpty = userInput.trim() === '';

//   return (
//     <div className="outer-interface">

//       <div className="chat-side-nav">
//           <div className="chat-header">
//           <div><Image src={logo} alt="CareerCompass Logo" className="w-10 h-30" /></div>
//           <div><span className="logo-name">CareerCompass</span></div>
//           </div>
          
//           <div className="data-visualization-button">
//             <div><Image src={graph} alt="graph" className="w-10 h-30" /></div>
//           <div>
//           <a href="https://public.tableau.com/views/CareerCompass/Overview?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" 
          
//     >
//             <button type="submit" className="data-button">
//             View Career Data Dashboard
//           </button></a></div>
//           <div><Image src={arrow} alt="arrow" className="w-8 h-auto" /></div>
//           </div>
//           <div className="chat-history">

//           </div>
       
//       </div>


      
//       <div className="main-chat-interface">
//         <div className="chat" ref={chatRef}>
//           {/* Displaying the chat messages */}
//           {messages.map((msg, index) => (
//   <div key={index} className={msg.type === 'user' ? 'user-message' : 'bot-message'}>
//     {msg.type === 'bot' ? (
//       <div className="prose">
//       <ReactMarkdown remarkPlugins={[remarkGfm]}>
//         {msg.text}
       
//       </ReactMarkdown>
//     </div>
   

//     ) : (
//       <p>{msg.text}</p>
      
//     )}
//   </div>
// ))}
//         </div>

//         <div className="user-input">
            
//             <form onSubmit={handleSubmit} className="form-elements">
//             <textarea
//             value={userInput}
//             onChange={(e) => setUserInput(e.target.value)}
//             className="auto-expand user-query"
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' && !e.shiftKey && !isMessageEmpty) {
//                 e.preventDefault(); 
//                 handleSubmit(e);    
//               }
//             }}
//             placeholder="Ask me anything about careers, skills, or job trends..."
//             rows={1} // Start with 1 row
//             />
//             <button type="submit" 
//             disabled={isMessageEmpty}
//             className={`transition-opacity duration-200 ${
//           isMessageEmpty ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
//         }`}><Image src={send} alt="Send Button" className="w-10 h-auto" /></button>
//             </form>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client"
import Image from "next/image";
import logo from "../../resources/logo.png";
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
  const [userInput, setUserInput] = useState('');
  const [savedChats, setSavedChats] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

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
  const resumeChat = async () => {
    if (!resumeFile.trim()) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/resume/${resumeFile.trim()}`, { method: 'GET' });
      const data = await res.json();
      setInfoMessage(data.message || "Chat resumed.");
      // Map the returned conversation to the messages state.
      // Each object in "conversation" is expected to have "role" and "content"
      const resumedMessages: Message[] = data.conversation.map(
        (msg: { role: string; content: string }) => {
          // Optionally, you can ignore the system message if you don't want it displayed.
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

  const isMessageEmpty = userInput.trim() === '';

  return (
    <div>
      <Header/>
    <div className="outer-interface">
      <div className="chat-side-nav">
        <div className="chat-header">
          <div>
            <Image src={logo} alt="CareerCompass Logo" className="w-10 h-30" />
          </div>
          <div>
            <span className="logo-name">CareerCompass</span>
          </div>
        </div>
        <div className="data-visualization-button">
          <div>
            <Image src={graph} alt="graph" className="w-10 h-30" />
          </div>
          <div>
            <a href="https://public.tableau.com/views/CareerCompass/Overview?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link">
              <button type="button" className="data-button">
                View Career Data Dashboard
              </button>
            </a>
          </div>
          <div>
            <Image src={arrow} alt="arrow" className="w-8 h-auto" />
          </div>
        </div>
        <div className="chat-history">
          <button onClick={fetchHistory}>Refresh History</button>
          <ul>
            {savedChats.map((file, idx) => (
              <li key={idx}>{file}</li>
            ))}
          </ul>
          <div>
            <input
              type="text"
              placeholder="Enter filename to resume (e.g., chat_2025-04-16_11-30-00.json)"
              value={resumeFile}
              onChange={(e) => setResumeFile(e.target.value)}
            />
            <button onClick={resumeChat}>Resume Chat</button>
          </div>
          {infoMessage && <p>{infoMessage}</p>}
        </div>
      </div>

      <div className="main-chat-interface">
        <div className="chat" ref={chatRef}>
          {messages.map((msg, index) => (
            <div key={index} className={msg.type === 'user' ? 'user-message' : msg.type === 'bot' ? 'bot-message' : 'system-message'}>
              {msg.type === 'bot' ? (
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
        <div className="user-input">
          <form onSubmit={handleSubmit} className="form-elements">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="auto-expand user-query"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isMessageEmpty) {
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
              className={`transition-opacity duration-200 ${isMessageEmpty ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
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
  );
}

