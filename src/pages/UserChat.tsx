import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send as SendIcon } from 'lucide-react'; // Importe o ícone do lucide-react

const socket = io('http://localhost:3001');

interface Message {
  text: string;
  sender: 'admin' | 'user';
}

export function UserChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('chatMessage', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('chatMessage', { text: newMessage, sender: 'user' });
      setNewMessage('');
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col h-screen">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h1 className="text-lg font-semibold">Chat com Administrador</h1>
      </div>

      <div className="flex-grow border border-gray-300 rounded-b-lg p-4 mb-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 p-3 rounded-lg ${
              message.sender === 'admin' ? 'bg-blue-100 self-start' : 'bg-gray-100 self-end'
            }`}
          >
            <strong className="block mb-1">{message.sender === 'admin' ? 'Admin' : 'Você'}:</strong>
            <p className="text-sm">{message.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center p-2 border-t border-gray-300">
        <input
          type="text"
          className="border rounded-l-lg p-2 flex-grow focus:outline-none focus:ring focus:border-blue-300"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r-lg"
          onClick={handleSendMessage}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}