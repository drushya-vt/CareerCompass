"use client"
import Image from "next/image";
import Link from "next/link";
import logo from "../../resources/logo.png";
import arrow from "../../resources/arrow.png";
import graph from "../../resources/graph.png";
import send from "../../resources/send.png";
import { useState } from 'react';


interface Message {
    type: string;
    text: string;
}


export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="outer-interface">

      <div className="chat-side-nav">
          <div className="chat-header">
          <div><Image src={logo} alt="CareerCompass Logo" className="w-20 h-30" /></div>
          <div><span className="logo-name">CareerCompass</span></div>
          </div>

          <div className="data-visualization-button">
            <div><Image src={graph} alt="graph" className="w-20 h-30" /></div>
          <div><button type="submit" className="data-button">
            View Career Data Dashboard
          </button></div>
          <div><Image src={arrow} alt="arrow" className="w-10 h-auto" /></div>
          </div>
          <div className="chat-history">

          </div>
       
      </div>


      
      <div className="main-chat-interface">
        <div className="chat">
          {/* Displaying the chat messages */}
          {messages.map((msg, index) => (
            <div key={index} className={msg.type === 'user' ? 'user-message' : 'bot-message'}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="user-input">
            
            <form onSubmit={handleSubmit} className="form-elements">
            <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="auto-expand user-query"
            placeholder="Ask me anything about careers, skills, or job trends..."
            rows={1} // Start with 1 row
            />
            <button type="submit" className=""><Image src={send} alt="Send Button" className="w-20 h-auto" /></button>
            </form>
        </div>
      </div>
    </div>
  );
}
