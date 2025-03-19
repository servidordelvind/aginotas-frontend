import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send as SendIcon, Trash2 as TrashIcon } from 'lucide-react';

const socket = io('http://localhost:3001');

interface Message {
  text: string;
  sender: 'admin' | 'user';
  timestamp: number;
}

interface User {
  id: number;
  name: string;
  status: 'online' | 'offline'; // Adiciona o campo status
}



export function AdminReports() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Joao', status: 'offline' },
    { id: 2, name: 'Maria', status: 'offline' },
    { id: 3, name: 'Julio', status: 'offline' },
    { id: 4, name: 'Anne', status: 'offline' },
    { id: 5, name: 'Marcus', status: 'offline' },
    { id: 6, name: 'Vinicius', status: 'offline' },
    { id: 7, name: 'Vanda', status: 'online' },
    { id: 7, name: 'Vanda', status: 'online' },
    { id: 8, name: 'Gepeto', status: 'online' },
    { id: 6, name: 'Vinicius', status: 'online' },
    { id: 7, name: 'Vanda', status: 'online' },
    { id: 8, name: 'Gepeto', status: 'online' },
    { id: 6, name: 'Vinicius', status: 'online' },
    { id: 7, name: 'Vanda', status: 'online' },
    { id: 8, name: 'Gepeto', status: 'online' },
  ]);
  const [standardResponses] = useState<string[]>([
    'Em que posso ajudar?',
    'Aguarde um momento enquanto verifico.',
    'Qual o número do seu pedido?',
    'Posso te transferir para um especialista.',
    'Qual seu email para contato?',
  ]);

  useEffect(() => {
    socket.on('chatMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, []);

  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const timestamp = Date.now(); // Obtém o timestamp atual
      socket.emit('chatMessage', { text: newMessage, sender: 'admin', timestamp });
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: newMessage, sender: 'admin', timestamp },
      ]);
      setNewMessage('');
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  
    // Simulação de mensagens iniciais para cada usuário
    const now = Date.now(); // Obtém o timestamp atual
  
    if (user.id === 1) {
      setMessages([
        { text: 'Meu computador não liga, o que faço?', sender: 'user', timestamp: now },
      ]);
    } else if (user.id === 2) {
      setMessages([
        { text: 'Gostaria de cancelar meu pedido.', sender: 'user', timestamp: now },
      ]);
    } else if (user.id === 3) {
      setMessages([
        { text: 'Meu pagamento foi aprovado?', sender: 'user', timestamp: now },
      ]);
    } else {
      setMessages([]); // Limpa as mensagens se nenhum usuário for selecionado
    }
  };

  const handleDeleteUser = (userId: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
      setMessages([]);
    }
  };

  const handleStandardResponse = (response: string) => {
    const now = Date.now(); // Obtém o timestamp atual
    socket.emit('chatMessage', { text: response, sender: 'admin', timestamp: now }); // Envia a mensagem com timestamp
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: response, sender: 'admin', timestamp: now }, // Adiciona a mensagem com timestamp ao estado
    ]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Envia a mensagem quando a tecla Enter é pressionada
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };



  return (
    <div className="flex h-screen bg-gray-100">
      {/* Barra lateral */}
      <div className="w-1/3 h-5/6 bg-white border-r border-gray-300 p-4 shadow-lg flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Atendimentos</h2>
        <ul className="space-y-3 overflow-y-auto">
          {users.map((user) => (
            <li
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 ${selectedUser?.id === user.id ? 'bg-blue-100' : 'hover:bg-gray-200'
                }`}
              onClick={() => handleUserSelect(user)}
            >
              <div className="flex items-center">
                <span className="text-gray-800 font-medium">{user.name}</span>
                <span
                  className={`ml-2 w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                ></span>
              </div>
              <button
                className="text-red-500 hover:text-red-700 transition-all duration-200"
                onClick={() => handleDeleteUser(user.id)}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Área do Chat */}
      {selectedUser && (
        <div className="flex flex-col flex-grow h-5/6 bg-gray-50 shadow-inner">
          {/* Cabeçalho do chat */}
          <div className="bg-blue-600 text-white p-5 rounded-t-lg shadow-md flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat com {selectedUser.name}</h2>
          </div>

          {/* Mensagens */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-xs px-4 py-3 rounded-lg shadow-sm ${message.sender === 'admin' ? 'bg-blue-100 self-start' : 'bg-gray-200 self-end'
                  }`}
              >
                <strong className="block text-gray-700">
                  {message.sender === 'admin' ? 'Admin' : selectedUser.name}:
                </strong>
                <p className="text-gray-800 text-sm">{message.text}</p>
                <span className="text-gray-500 text-xs">
                  {new Date(message.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Respostas rápidas */}
          <div className="flex flex-wrap gap-2 p-4 border-t bg-white shadow-md">
            {standardResponses.map((response, index) => (
              <button
                key={index}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition-all duration-200"
                onClick={() => handleStandardResponse(response)}
              >
                {response}
              </button>
            ))}
          </div>

          {/* Input de mensagem */}
          <div className="flex items-center p-3 border-t bg-gray-100 shadow-lg">
            <input
              type="text"
              className="flex-grow border border-gray-300 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              onKeyDown={handleKeyDown}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-r-lg transition-all duration-300"
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