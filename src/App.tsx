import React, { CSSProperties, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

// Define the structure of each message
interface Message {
  sender: 'user' | 'ai';
  text: string;
}

// Define the response type from the backend
interface ChatResponse {
  reply: string | string[]; // Reply can be a single string or an array of strings
}

function App() {
  const [input, setInput] = useState(''); // User's input
  const [messages, setMessages] = useState<Message[]>([]); // Chat history
  const [loading, setLoading] = useState(false); // Loading state
  const [userId, setUserId] = useState(() => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = uuidv4(); // Generate a new session ID
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }); // Default to random ID or wallet address
  const chatContainerRef = useRef<HTMLDivElement>(null); // Reference to the chat container

  // Set the page title
  useEffect(() => {
    document.title = 'ChainSense - Your Secure Assistant';
  }, []);

  // Add a welcome message on initial load
  useEffect(() => {
    const welcomeMessage: Message = {
      sender: 'ai',
      text: `
        Hey there! I'm Linky, your secure assistant, here to help you explore insights, brainstorm ideas, or even chat about your next big project. 🌟
        
        Just so you know, every conversation we have can be safely stored on Auto Drive (https://ai3.storage/drive), powered by the Autonomys blockchain. This means your records are securely encrypted and always accessible.
  
        If you ever want to save our chat, simply type '/save password'. To revisit past memories, type '/load CID password', and I'll load that conversation right into my local memory. Let's dive in and make some magic happen! ✨
      `,
    };
    setMessages([welcomeMessage]);
  }, []);

  // Handle MetaMask login
  const handleMetaMaskLogin = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];

      if (Array.isArray(accounts) && accounts.length > 0) {
        const walletAddress = accounts[0]; // Get the first wallet address
        setUserId(walletAddress); // Set userId to wallet address
        localStorage.setItem('sessionId', walletAddress); // Persist wallet address in local storage
        alert(`Wallet connected: ${walletAddress}`);
      } else {
        alert('No accounts found. Please check your MetaMask wallet.');
      }
    } catch (error) {
      console.error('MetaMask login failed:', error);
      alert('Failed to connect MetaMask. Please try again.');
    }
  };

  // Disconnect wallet and revert to session ID
  const handleDisconnectWallet = () => {
    const sessionId = uuidv4();
    localStorage.setItem('sessionId', sessionId);
    setUserId(sessionId); // Revert to session ID
    alert('Wallet disconnected. Using temporary session ID.');
  };

  // Function to send a message and get AI response
  const sendMessage = async () => {
    if (input.trim() === '') return; // Do nothing if the input is empty

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message to chat history
    setInput(''); // Clear the input field
    setLoading(true); // Set loading state

    try {
      const response = await axios.post<ChatResponse>('https://chainsense-backend.onrender.com/api/chat', 
        { message: input, userId }, // Include userId in the request
        { headers: { 'Content-Type': 'application/json' } }
      );

      const replies = Array.isArray(response.data.reply) ? response.data.reply : [response.data.reply];

      replies.forEach((text) => {
        const aiMessage: Message = { sender: 'ai', text };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      });
    } catch (error) {
      console.error('Error communicating with AI:', error);
      const errorMessage: Message = { sender: 'ai', text: 'Sorry, something went wrong.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handle pressing Enter to send the message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Clear chat history but retain the welcome message
  const handleClearChat = () => {
    const welcomeMessage: Message = {
      sender: 'ai',
      text: `
        Hey there! I'm Linky, your secure assistant, here to help you explore insights, brainstorm ideas, or even chat about your next big project. 🌟
        
        Just so you know, every conversation we have can be safely stored on Auto Drive (https://ai3.storage/drive), powered by the Autonomys blockchain. This means your records are securely encrypted and always accessible.
  
        If you ever want to save our chat, simply type '/save password'. To revisit past memories, type '/load CID password', and I'll load that conversation right into my local memory. Let's dive in and make some magic happen! ✨
      `,
    };
    setMessages([welcomeMessage]); // Reset to only include the welcome message
  };
  
  

  // Scroll to the bottom of the chat when a new message is added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const styles: { [key: string]: CSSProperties } = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
    },
    title: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    chatContainer: {
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      height: '300px',
      overflowY: 'scroll',
      backgroundColor: '#f9f9f9',
    },
    userMessage: {
      textAlign: 'right',
      margin: '10px 0',
    },
    aiMessage: {
      textAlign: 'left',
      margin: '10px 0',
    },
    messageText: {
      display: 'inline-block',
      padding: '10px',
      borderRadius: '12px',
      maxWidth: '80%',
      wordWrap: 'break-word',
    },
    inputContainer: {
      display: 'flex',
      gap: '10px',
      marginTop: '10px',
    },
    input: {
      flex: 1,
      padding: '10px',
      fontSize: '16px',
      borderRadius: '8px',
      border: '1px solid #ccc',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '8px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
    },
    loadingText: {
      marginTop: '10px',
      textAlign: 'center',
      color: '#555',
    },
    walletContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '10px',
      position: 'absolute',
      top: '10px',
      right: '10px',
    },
    walletButton: {
      padding: '10px 15px',
      fontSize: '14px',
      borderRadius: '5px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
    },
    walletText: {
      fontSize: '14px',
      color: '#555',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.walletContainer}>
        {userId.startsWith('0x') ? (
          <>
            <span style={styles.walletText}>Wallet: {userId.slice(0, 6)}...{userId.slice(-4)}</span>
            <button style={styles.walletButton} onClick={handleDisconnectWallet}>Disconnect</button>
          </>
        ) : (
          <button style={styles.walletButton} onClick={handleMetaMaskLogin}>Connect Wallet</button>
        )}
      </div>
      <h1 style={styles.title}>Linky - Your Secure Assistant</h1>
      <div style={styles.chatContainer} ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={msg.sender === 'user' ? styles.userMessage : styles.aiMessage}
          >
            <p
              style={{
                ...styles.messageText,
                backgroundColor: msg.sender === 'user' ? '#d1e7ff' : '#e6e6e6',
              }}
            >
              <strong>{msg.sender === 'user' ? 'You' : 'Linky'}:</strong> {msg.text}
            </p>
          </div>
        ))}
        {loading && (
          <div style={styles.aiMessage}>
            <p style={{ ...styles.messageText, backgroundColor: '#e6e6e6' }}>
              <strong>Linky:</strong> Thinking...
            </p>
          </div>
        )}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button} disabled={loading}>
          Send
        </button>
        <button onClick={handleClearChat} style={styles.button}>
          Clear Chat
        </button>
      </div>
    </div>
  );
}

export default App;




