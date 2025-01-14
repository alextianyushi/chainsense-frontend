// src/App.tsx

import React, { CSSProperties, useState, useEffect, useRef } from 'react';
import axios from 'axios';

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

  // Function to send a message and get AI response
  const sendMessage = async () => {
    if (input.trim() === '') return; // Do nothing if the input is empty

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message to chat history
    setInput(''); // Clear the input field
    setLoading(true); // Set loading state

    try {
      // Explicitly specify the type of response
      const response = await axios.post<ChatResponse>('https://chainsense-backend.onrender.com/', 
        { message: input }, 
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Check if reply is an array or a single string
      const replies = Array.isArray(response.data.reply) ? response.data.reply : [response.data.reply];

      // Process each reply
      replies.forEach((text) => {
        const aiMessage: Message = { sender: 'ai', text };
        setMessages((prevMessages) => [...prevMessages, aiMessage]); // Add AI response to chat history
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
  };

  return (
    <div style={styles.container}>
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
                backgroundColor: msg.sender === 'user' ? '#d1e7ff' : '#e6e6e6', // User: light blue, AI: light gray
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
          onKeyDown={handleKeyDown} // Bind handleKeyDown to the input
          placeholder="Enter your message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;




