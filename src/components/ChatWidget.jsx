import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Paperclip, Minimize2, Maximize2, FileText, Globe, LineChart, SquareCheck } from 'lucide-react';
import { TripAI } from '../services/TripAI';
import chatIcon from '../assets/AltairGo_AI_chat_icon.png';
import './ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);


    const [isMinimized, setIsMinimized] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const toggleChat = () => {
        if (!isOpen) setIsMinimized(false);
        setIsOpen(!isOpen);
    };
    const toggleMinimize = (e) => {
        e.stopPropagation();
        setIsMinimized(!isMinimized);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;

        // Add user message immediately
        const userMsg = { role: 'user', content: userText };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Show thinking state (optional, or just wait)
        // For now, we'll just wait for the response

        try {
            // Get AI response
            // Import TripAI if not already imported (Need to add import at top)
            const aiResponseText = await TripAI.chat(userText);

            setMessages(prev => [...prev, {
                role: 'ai',
                content: aiResponseText
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "Sorry, I couldn't reach the server."
            }]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={`chat-widget-container ${isOpen ? 'open' : ''} ${isMinimized ? 'minimized' : ''}`}>
            {/* Toggle Button */}
            {!isOpen && (
                <button className="chat-toggle-btn" onClick={toggleChat}>
                    <img src={chatIcon} alt="AI Chat" className="chat-icon-img" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header" onClick={() => setIsMinimized(!isMinimized)}>
                        <div className="chat-header-left">
                            <span className="ai-avatar">
                                <img src={chatIcon} alt="AI" className="ai-avatar-img" />
                            </span>
                            <span className="chat-title">New AI chat</span>
                        </div>
                        <div className="chat-header-actions">
                            <button className="icon-btn" onClick={toggleMinimize}>
                                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                            </button>
                            <button className="icon-btn" onClick={toggleChat}>
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    {!isMinimized && (
                        <>
                            <div className="chat-body">
                                {messages.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="large-avatar">
                                            <img src={chatIcon} alt="AI" className="large-avatar-img" />
                                        </div>
                                        <h2 className="greeting">What's our quest today?</h2>

                                        <div className="suggestions">
                                            <button className="suggestion-item">
                                                <span className="suggestion-icon"><FileText size={16} className="text-blue-400" /></span>
                                                <span className="suggestion-text">Personalize your AltairGO AI</span>
                                                <span className="badge-new">New</span>
                                            </button>
                                            <button className="suggestion-item">
                                                <span className="suggestion-icon"><Globe size={16} /></span>
                                                <span className="suggestion-text">Translate this page</span>
                                            </button>
                                            <button className="suggestion-item">
                                                <span className="suggestion-icon"><LineChart size={16} className="text-blue-400" /></span>
                                                <span className="suggestion-text">Create a itinerary</span>
                                                <span className="badge-new">New</span>
                                            </button>
                                            <button className="suggestion-item">
                                                <span className="suggestion-icon"><SquareCheck size={16} className="text-blue-400" /></span>
                                                <span className="suggestion-text">Suggest me best destinations</span>
                                                <span className="badge-new">New</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="messages-list">
                                        {messages.map((msg, idx) => (
                                            <div key={idx} className={`message ${msg.role}`}>
                                                <div className="message-content">{msg.content}</div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Footer / Input */}
                            <div className="chat-footer">
                                <div className="chat-input-container">
                                    <div className="chat-input-toolbar">
                                        <button className="toolbar-btn">@</button>
                                        <button className="toolbar-btn text-muted">Page context</button>
                                    </div>
                                    <textarea
                                        placeholder="Ask AI anything..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <div className="chat-input-actions">
                                        <div className="left-actions">
                                            <button className="action-btn"><Paperclip size={18} /></button>
                                            <span className="text-hint">Auto</span>
                                        </div>
                                        <button
                                            className={`send-btn ${inputValue.trim() ? 'active' : ''}`}
                                            onClick={handleSendMessage}
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
