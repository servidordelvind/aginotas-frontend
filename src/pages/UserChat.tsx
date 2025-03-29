import React, { useState, useEffect, useRef } from 'react';
import { Send as SendIcon } from 'lucide-react';
import { io } from 'socket.io-client';

// Conexão com o servidor de socket
const socket = io('http://localhost:3000'); // Altere a URL para a produção conforme necessário.

interface Message {
  text: string;
  sender: 'admin' | 'user';
  adminId?: number;
  timestamp: number;
}

interface Admin {
  id: number;
  name: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<number | null>(null); // ID do usuário
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('chatMessage', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('update_ticket', (ticket: any) => {
      setMessages(ticket.messages);
    });

    socket.on('user_typing', (data) => {
      if (data.userId !== userId) {
        setIsTyping(true);
      }
    });

    socket.on('stop_typing', () => {
      setIsTyping(false);
    });

    return () => {
      socket.off('chatMessage');
      socket.off('update_ticket');
      socket.off('user_typing');
      socket.off('stop_typing');
    };
  }, [userId]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedAdmin) {
      const timestamp = Date.now();
      const message: Message = {
        text: newMessage,
        sender: 'user',
        adminId: selectedAdmin.id,
        timestamp: timestamp,
      };

      socket.emit('send_message', { ticketId: selectedAdmin.id, sender: 'user', message: newMessage });

      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage('');
    }
  };

  const handleAdminSelect = (admin: Admin) => {
    setSelectedAdmin(admin);
    setMessages([]);
    const now = Date.now();
    socket.emit('open_ticket', { userId, message: 'Olá, preciso de ajuda!' });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newMessage.trim()) {
      handleSendMessage();
      event.preventDefault();
    }
  };

  const handleTyping = () => {
    socket.emit('user_typing', { userId });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/5 border-r border-gray-300 p-4">
        {/* Seleção do Admin */}
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded"
          onClick={() => handleAdminSelect({ id: 1, name: 'Carlos' })}
        >
          Procurar Suporte Disponível
        </button>
      </div>

      <div className="flex-grow flex flex-col p-4">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg shadow-md sticky top-0">
          <h1 className="text-lg font-semibold">
            {selectedAdmin ? `Chat com ${selectedAdmin.name}` : 'Suporte'}
          </h1>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-xs p-3 rounded-lg shadow-md ${
                message.sender === 'admin' ? 'bg-blue-100 self-start' : 'bg-gray-200 self-end'
              }`}
            >
              <strong className="block mb-1">
                {message.sender === 'admin' ? selectedAdmin?.name : 'Você'}:
              </strong>
              <p className="text-sm">{message.text}</p>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
          {isTyping && <div className="text-gray-500">O admin está digitando...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center p-3 border-t border-gray-300 bg-gray-50">
          <input
            type="text"
            className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Digite sua mensagem..."
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-lg"
            onClick={handleSendMessage}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}






























/* import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
import { Send as SendIcon } from 'lucide-react';

// const socket = io('http://localhost:3001');

interface Message {
  text: string;
  sender: 'admin' | 'user';
  adminId?: number;
  timestamp: number;
}

interface Admin {
  id: number;
  name: string;
}

function TypingAnimation() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots.length < 3) {
          return prevDots + '.';
        } else {
          return '';
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <div className="text-gray-500">Digitando{dots}</div>;
}

export function UserChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [admins, setAdmins] = useState<Admin[]>([
    { id: 1, name: 'Carlos' },
    { id: 2, name: 'Ana' },
    { id: 3, name: 'Pedro' },
    { id: 4, name: 'Julia' },
  ]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAdminList, setShowAdminList] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // socket.on('chatMessage', (message: Message) => {
    //   setMessages((prevMessages) => [...prevMessages, message]);
    // });

    // return () => {
    //   socket.off('chatMessage');
    // };
  }, []);

  const handleSendMessage = () => {

    //novidades
    // if (newMessage.trim() && selectedAdmin) {
    //   const timestamp = Date.now();
    //   const message: Message = {
    //     text: newMessage,
    //     sender: 'user',
    //     adminId: selectedAdmin.id,
    //     timestamp: timestamp,
    //   };
    //   socket.emit('chatMessage', message);
    //   setMessages((prevMessages) => [...prevMessages, message]);
    //   setNewMessage('');
    // }
  };

  const handleAdminSelect = (admin: Admin) => {
    // setIsTransitioning(true);
    // setTimeout(() => {
    //   setSelectedAdmin(admin);
    //   setMessages([]);
    //   const now = Date.now();

    //   setIsTyping(true);
    //   setTimeout(() => {
    //     if (admin.id === 1) {
    //       setMessages([{ text: 'Olá, como posso ajudar?', sender: 'admin', timestamp: now }]);
    //     } else if (admin.id === 2) {
    //       setMessages([{ text: 'Em que posso ser útil?', sender: 'admin', timestamp: now }]);
    //     } else if (admin.id === 3) {
    //       setMessages([{ text: 'Qual a sua dúvida?', sender: 'admin', timestamp: now }]);
    //     } else {
    //       setMessages([{ text: 'Em que posso ser útil?', sender: 'admin', timestamp: now }]);
    //     }
    //     setIsTyping(false);
    //   }, 1500);

    //   setIsTransitioning(false);
    //   setShowAdminList(true);
    // }, 2000);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // if (event.key === 'Enter' && newMessage.trim() && selectedAdmin) {
    //   handleSendMessage();
    //   event.preventDefault();
    // }
  };

  const handleRandomAdminSelect = () => {
    // setIsTransitioning(true);
    // setTimeout(() => {
    //   const randomIndex = Math.floor(Math.random() * admins.length);
    //   const randomAdmin = admins[randomIndex];
    //   handleAdminSelect(randomAdmin);
    //   setIsTransitioning(false);
    // }, 2000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-2xl font-semibold">
            Entrando em contato com o suporte disponível...
          </div>
        </div>
      )}

      <div className="w-1/5 border-r border-gray-300 p-4">
        {!showAdminList ? (
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded"
            onClick={handleRandomAdminSelect}
          >
            Procurar Suporte Disponível
          </button>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Suporte Selecionado</h2>
            <ul className="space-y-2">
              {selectedAdmin && (
                <li
                  key={selectedAdmin.id}
                  className="p-3 rounded bg-blue-100"
                >
                  {selectedAdmin.name}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col p-4">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg shadow-md sticky top-0">
          <h1 className="text-lg font-semibold">
            {selectedAdmin ? `Chat com ${selectedAdmin.name}` : 'Suporte'}
          </h1>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-xs p-3 rounded-lg shadow-md ${
                message.sender === 'admin' ? 'bg-blue-100 self-start' : 'bg-gray-200 self-end'
              }`}
            >
              <strong className="block mb-1">
                {message.sender === 'admin' ? selectedAdmin?.name : 'Você'}:
              </strong>
              <p className="text-sm">{message.text}</p>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
          {isTyping && <TypingAnimation />}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center p-3 border-t border-gray-300 bg-gray-50">
          <input
            type="text"
            className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-lg"
            onClick={handleSendMessage}>
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} */