"use client"
import Image from "next/image";
import Link from "next/link";
import logo from "../../resources/logo.png";
import arrow from "../../resources/arrow.png";
import graph from "../../resources/graph.png";
import send from "../../resources/send.png";
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';





interface Message {
    type: string;
    text: string;
}


export default function Chatbot() {

  const chatRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setMessages([...messages, { type: 'user', text: userInput }]);
    setUserInput('');

    try {
        // Sending the query to the FastAPI backend
        const res = await fetch('http://127.0.0.1:8000/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: userInput }),
        });
  
        const data = await res.json();
        // Adding the AI's response to the messages
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: data.response },
        ]);
        
      } catch (error) {
        console.error('Error:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: 'Sorry, something went wrong. Please try again.' },
        ]);
      }
  
  };

  const isMessageEmpty = userInput.trim() === '';

  return (
    <div className="outer-interface">

      <div className="chat-side-nav">
          <div className="chat-header">
          <div><Image src={logo} alt="CareerCompass Logo" className="w-20 h-30" /></div>
          <div><span className="logo-name">CareerCompass</span></div>
          </div>
          
          <div className="data-visualization-button">
            <div><Image src={graph} alt="graph" className="w-20 h-30" /></div>
          <div>
          <a href="https://public.tableau.com/views/CareerCompass/Overview?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" 
          
    >
            <button type="submit" className="data-button">
            View Career Data Dashboard
          </button></a></div>
          <div><Image src={arrow} alt="arrow" className="w-10 h-auto" /></div>
          </div>
          <div className="chat-history">

          </div>
       
      </div>


      
      <div className="main-chat-interface">
        <div className="chat" ref={chatRef}>
          {/* Displaying the chat messages */}
          {messages.map((msg, index) => (
  <div key={index} className={msg.type === 'user' ? 'user-message' : 'bot-message'}>
    {msg.type === 'bot' ? (
      <ReactMarkdown>
        {msg.text}
      </ReactMarkdown>
   

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
            rows={1} // Start with 1 row
            />
            <button type="submit" 
            disabled={isMessageEmpty}
            className={`transition-opacity duration-200 ${
          isMessageEmpty ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
        }`}><Image src={send} alt="Send Button" className="w-20 h-auto" /></button>
            </form>
        </div>
      </div>
    </div>
  );
}
