import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send as SendIcon } from 'lucide-react';

const socket = io('http://localhost:3001');

interface Message {
  text: string;
  sender: 'admin' | 'user';
}

interface User {
  id: number;
  name: string;
}

export function AdminReports() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users] = useState<User[]>([
    { id: 1, name: 'Usuário 1' },
    { id: 2, name: 'Usuário 2' },
    { id: 3, name: 'Usuário 3' },
  ]);

  useEffect(() => {
    socket.on('chatMessage', (message) => {
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
      socket.emit('chatMessage', { text: newMessage, sender: 'admin' });
      setNewMessage('');
    }
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = parseInt(event.target.value);
    const user = users.find((u) => u.id === userId) || null;
    setSelectedUser(user);
  };

  return (
    <div className="p-4 md:p-8 flex flex-col h-screen">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Chat em Tempo Real</h1>

      <div className="mb-4">
        <label htmlFor="userSelect" className="mr-2 font-semibold">
          Selecionar Usuário:
        </label>
        <select
          id="userSelect"
          className="border rounded p-2 focus:outline-none focus:ring focus:border-blue-300"
          onChange={handleUserChange}
          value={selectedUser?.id || ''}
        >
          <option value="">Selecione um usuário</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="flex flex-col flex-grow border border-gray-300 rounded-lg p-4">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h2 className="text-lg font-semibold">Chat com {selectedUser.name}</h2>
          </div>

          <div className="flex-grow overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 p-3 rounded-lg ${
                  message.sender === 'admin' ? 'bg-blue-100 self-start' : 'bg-gray-100 self-end'
                }`}
              >
                <strong className="block mb-1">
                  {message.sender === 'admin' ? 'Admin' : selectedUser.name}:
                </strong>
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
      )}
    </div>
  );
}