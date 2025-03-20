"use client"
import Image from "next/image";
import Link from "next/link";
import logo from "../../resources/logo.png";
import arrow from "../../resources/arrow.png";
import graph from "../../resources/graph.png";
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
          { type: 'bot', text: 'Sorry, something went wrong. Please try again later.' },
        ]);
      }
  
  };

  return (
    <div className="outer-interface">

      <div className="chat-side-nav">
          <div className="chat-header">
          <Image src={logo} alt="CareerCompass Logo" className="w-20 h-30" />
          <p className="logo-name">CareerCompass</p>
          </div>

          <div className="data-visualization-button">
          <button type="submit" className="data-button">
          <Image src={graph} alt="CareerCompass Logo" className="w-20 h-30" />
            View Career Data Dashboard
            <Image src={arrow} alt="CareerCompass Logo" className="w-20 h-20" />
          </button>
          </div>
          <div className="chat-history">

          </div>
       
      </div>


      <div className="main-chat-interface">
        <div className="chat">
          <p>chat here</p>
        </div>
        <div className="user-input">
            
            <form onSubmit={handleSubmit}>
            <input
            type="text"
            value={userInput}
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask me anything about careers, skills, or job trends..."
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"></button>
            </form>
        </div>
      </div>
    </div>
  );
}
