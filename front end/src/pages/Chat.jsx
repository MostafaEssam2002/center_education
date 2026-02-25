import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { chatAPI, uploadAPI, API_BASE_URL } from '../services/api';
import Swal from 'sweetalert2';

const MessageBubble = ({ msg, currentUserId }) => {
    if (!msg) return null;
    const isMine = Number(msg.senderId) === Number(currentUserId) || Number(msg.sender?.id) === Number(currentUserId);
    const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

    return (
        <div className={`chat-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`} data-id={msg.id}>
            {!isMine && <span className="chat-sender-name">{msg.sender?.first_name || 'User'}</span>}
            <div className={`chat-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                {msg.imageUrl && (
                    <div className="chat-bubble-image" style={{ marginBottom: '5px', borderRadius: '4px', overflow: 'hidden', background: '#f0f2f5', minWidth: '200px', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={msg.imageUrl.startsWith('http') ? msg.imageUrl : `${API_BASE_URL}${msg.imageUrl.startsWith('/') ? '' : '/'}${msg.imageUrl}`}
                            alt="Sent"
                            style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', cursor: 'pointer' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=Image+Load+Error'; }}
                            onClick={() => window.open(msg.imageUrl.startsWith('http') ? msg.imageUrl : `${API_BASE_URL}${msg.imageUrl.startsWith('/') ? '' : '/'}${msg.imageUrl}`, '_blank')}
                        />
                    </div>
                )}
                {msg.content && <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</p>}
                <span className="chat-time">
                    {timeStr} {isMine && <span style={{ color: '#53bdeb', fontSize: '14px', marginLeft: '3px' }}>✓✓</span>}
                </span>
            </div>
        </div>
    );
};

const ContactItem = ({ item, active, onClick, role, type }) => {
    const name = item.user?.first_name || item.title || item.first_name || item.email || 'User';
    const lastMsg = item.lastMessage?.content || (type === 'course' ? 'Course broadcast' : 'Start chatting...');
    const time = item.lastMessage ? new Date(item.lastMessage.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
    const initials = name.charAt(0).toUpperCase();

    return (
        <button className={`chat-contact-btn ${active ? 'active' : ''}`} onClick={onClick}>
            <div className="chat-contact-avatar">
                {initials}
            </div>
            <div className="chat-contact-info">
                <div className="chat-contact-top">
                    <span className="chat-contact-name">{name}</span>
                    <span className="chat-contact-time">{time}</span>
                </div>
                <div className="chat-contact-bottom">
                    <span className="chat-contact-last-msg">{lastMsg}</span>
                    {item.unreadCount > 0 && <span className="wa-unread-badge">{item.unreadCount}</span>}
                </div>
            </div>
        </button>
    );
};

export default function Chat() {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [courses, setCourses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [filterTab, setFilterTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [teacherInbox, setTeacherInbox] = useState([]);
    const [employeeInbox, setEmployeeInbox] = useState([]);
    const [sidebarClosed, setSidebarClosed] = useState(false);
    const [uploading, setUploading] = useState(false);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const fileInputRef = useRef(null);

    const isTeacher = user?.role === 'TEACHER';
    const isEmployee = user?.role === 'EMPLOYEE' || user?.role === 'ADMIN';
    const isStudent = user?.role === 'STUDENT';

    const loadInboxes = useCallback(async () => {
        try {
            if (isTeacher) { const res = await chatAPI.getTeacherInbox(); setTeacherInbox(res.data || []); }
            if (isEmployee) { const res = await chatAPI.getEmployeeInbox(); setEmployeeInbox(res.data || []); }
        } catch (err) { console.error('Inbox update error', err); }
    }, [isTeacher, isEmployee]);

    useEffect(() => {
        if (!token) return;
        const init = async () => {
            try {
                if (isStudent) {
                    const [c, e] = await Promise.all([chatAPI.getMyCourses(), chatAPI.getEmployees()]);
                    setCourses(c.data || []); setEmployees(e.data || []);
                } else if (isTeacher) {
                    const c = await chatAPI.getTeacherCourses(); setCourses(c.data || []); loadInboxes();
                } else if (isEmployee) { loadInboxes(); }
            } catch (err) { console.error(err); }
        };
        init();
    }, [token, isStudent, isTeacher, isEmployee, loadInboxes]);

    useEffect(() => {
        if (!token) return;
        const s = io(`${API_BASE_URL}`, { auth: { token }, transports: ['websocket', 'polling'] });

        s.on('connect', () => { setConnected(true); console.log('✅ Socket Connected'); });
        s.on('disconnect', () => { setConnected(false); });

        s.on('newPrivateMessage', (msg) => {
            console.log('New message received:', msg);
            setMessages(p => {
                const exists = p.some(m => m.id === msg.id);
                if (exists) return p;
                return [...p, msg];
            });
            loadInboxes();
        });

        s.on('newCourseMessage', msg => {
            console.log('New course message received:', msg);
            setMessages(p => {
                const exists = p.some(m => m.id === msg.id);
                if (exists) return p;
                return [...p, msg];
            });
        });

        s.on('courseHistory', d => {
            console.log('Course history received:', d);
            setMessages(d.messages || []);
            setLoading(false);
        });

        s.on('conversationHistory', d => {
            console.log('Conversation history received:', d);
            setMessages(d.messages || []);
            setLoading(false);
        });

        socketRef.current = s; setSocket(s);
        return () => s.disconnect();
    }, [token, loadInboxes]);

    const openChat = (config) => {
        setActiveChat(config); setMessages([]); setLoading(true);
        const sid = socketRef.current; if (!sid) { setLoading(false); return; }

        const targetId = config.courseId || config.employeeId || config.studentId;
        if (config.type === 'course_broadcast') sid.emit('joinCourse', { courseId: targetId });
        else if (config.type === 'teacher') sid.emit('getConversationWithTeacher', { courseId: targetId });
        else if (config.type === 'employee') sid.emit('getConversationWithEmployee', { employeeId: targetId });
        else if (config.type === 'teacher_student') sid.emit('getTeacherStudentConversation', { studentId: targetId, courseId: config.courseId });
        else if (config.type === 'employee_student') sid.emit('getConversationWithEmployee', { studentId: targetId });

        setTimeout(loadInboxes, 500);
        if (window.innerWidth <= 768) setSidebarClosed(true);
    };

    const sendMessage = (customContent = null, imageUrl = null) => {
        const content = customContent !== null ? customContent : inputText.trim();
        if (!content && !imageUrl) return;
        if (!activeChat || !socketRef.current) return;

        if (customContent === null) setInputText('');
        const s = socketRef.current;

        const targetId = activeChat.courseId || activeChat.employeeId || activeChat.studentId;
        const payload = { content, imageUrl };

        if (activeChat.type === 'course_broadcast') s.emit('broadcastToCourse', { ...payload, courseId: targetId });
        else if (activeChat.type === 'teacher') s.emit('sendToTeacher', { ...payload, courseId: targetId });
        else if (activeChat.type === 'employee') s.emit('sendToEmployee', { ...payload, employeeId: targetId });
        else if (activeChat.type === 'teacher_student') s.emit('replyToStudent', { ...payload, studentId: targetId, courseId: activeChat.courseId });
        else if (activeChat.type === 'employee_student') s.emit('employeeReply', { ...payload, studentId: targetId });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadAPI.uploadFile(file);
            const imageUrl = res.data.url;
            const caption = inputText.trim(); // Take caption from input if exists
            sendMessage(caption, imageUrl); // Send message with image
            setInputText(''); // Clear input
        } catch (err) {
            console.error('Upload failed', err);
            Swal.fire({
                icon: 'error',
                title: 'فشل الرفع',
                text: 'فشل رفع الصورة، يرجى المحاولة مرة أخرى'
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const filteredList = (list, key) => list.filter(item => {
        const name = item.user?.first_name || item.title || item.first_name || item.email || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className={`chat-sidebar ${sidebarClosed ? 'closed' : ''}`}>
                    <div className="chat-sidebar-header">
                        <div className="sidebar-profile">
                            {user?.first_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="sidebar-actions">
                            <span className="wa-action-icon" title="Community">⭕</span>
                            <span className="wa-action-icon" title="New Chat">💬</span>
                            <span className="wa-action-icon" title="Menu">⋮</span>
                        </div>
                    </div>

                    <div className="chat-search-container">
                        <div className="chat-search-wrapper">
                            <span style={{ color: '#667781', margin: '0 5px', fontSize: '14px' }}>🔍</span>
                            <input
                                type="text"
                                className="chat-search-input"
                                placeholder="Search or start new chat"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="chat-sidebar-filter">
                        <button className={`filter-chip ${filterTab === 'All' ? 'active' : ''}`} onClick={() => setFilterTab('All')}>All</button>
                        <button className={`filter-chip ${filterTab === 'Unread' ? 'active' : ''}`} onClick={() => setFilterTab('Unread')}>Unread</button>
                        <button className={`filter-chip ${filterTab === 'Groups' ? 'active' : ''}`} onClick={() => setFilterTab('Groups')}>Groups</button>
                    </div>

                    <div className="chat-sidebar-list">
                        {isStudent && (
                            <>
                                {filteredList(courses, 'title').map(c => (
                                    <ContactItem
                                        key={`c-${c.id}`}
                                        item={{ ...c, title: `📢 ${c.title}` }}
                                        active={activeChat?.courseId === c.id && activeChat?.type === 'course_broadcast'}
                                        onClick={() => openChat({ type: 'course_broadcast', courseId: c.id, title: `📢 ${c.title}` })}
                                        type="course"
                                    />
                                ))}
                                {filteredList(courses, 'title').map(c => (
                                    <ContactItem
                                        key={`t-${c.id}`}
                                        item={{ ...c, title: `👨‍🏫 Teacher: ${c.title}` }}
                                        active={activeChat?.courseId === c.id && activeChat?.type === 'teacher'}
                                        onClick={() => openChat({ type: 'teacher', courseId: c.id, title: `💬 Teacher: ${c.title}` })}
                                    />
                                ))}
                                {filteredList(employees, 'first_name').map(e => (
                                    <ContactItem
                                        key={`e-${e.id}`}
                                        item={e}
                                        active={activeChat?.employeeId === e.id}
                                        onClick={() => openChat({ type: 'employee', employeeId: e.id, title: `👨‍💼 ${e.first_name || e.email}` })}
                                    />
                                ))}
                            </>
                        )}

                        {isTeacher && (
                            <>
                                {filteredList(courses, 'title').map(c => (
                                    <ContactItem
                                        key={`c-${c.id}`}
                                        item={{ ...c, title: `📢 ${c.title} (Broadcast)` }}
                                        active={activeChat?.courseId === c.id && activeChat?.type === 'course_broadcast'}
                                        onClick={() => openChat({ type: 'course_broadcast', courseId: c.id, title: `📢 ${c.title}` })}
                                        type="course"
                                    />
                                ))}
                                <div className="chat-section-divider" style={{ padding: '15px', color: '#008069', fontSize: '13px', fontWeight: '600' }}>Inbox</div>
                                {teacherInbox.map((item, idx) => (
                                    <ContactItem
                                        key={`inbox-${idx}`}
                                        item={item}
                                        active={activeChat?.studentId === item.userId && activeChat?.courseId === item.courseId}
                                        onClick={() => openChat({ type: 'teacher_student', studentId: item.userId, courseId: item.courseId, title: `💬 ${item.user?.first_name || 'Student'}` })}
                                    />
                                ))}
                            </>
                        )}

                        {isEmployee && (
                            <>
                                <div className="chat-section-divider" style={{ padding: '15px', color: '#008069', fontSize: '13px', fontWeight: '600' }}>Student Inquiries</div>
                                {employeeInbox.map((item, idx) => (
                                    <ContactItem
                                        key={`inbox-${idx}`}
                                        item={item}
                                        active={activeChat?.studentId === item.userId}
                                        onClick={() => openChat({ type: 'employee_student', studentId: item.userId, title: `💬 ${item.user?.first_name || 'Student'}` })}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="chat-main">
                    {activeChat ? (
                        <>
                            <div className="chat-main-header">
                                {sidebarClosed && <button onClick={() => setSidebarClosed(false)} style={{ background: 'none', border: 'none', fontSize: '20px', marginLeft: '10px', cursor: 'pointer' }}>➡️</button>}
                                <div className="active-chat-avatar">
                                    {(activeChat.title || activeChat.user?.first_name || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div className="active-chat-info">
                                    <h2>{activeChat.title}</h2>
                                    <span className="active-chat-status">{connected ? 'Online' : 'Offline'}</span>
                                </div>
                                <div style={{ marginRight: 'auto', display: 'flex', gap: '20px' }}>
                                    <span className="wa-action-icon">🔍</span>
                                    <span className="wa-action-icon">⋮</span>
                                </div>
                            </div>
                            <div className="chat-messages">
                                {loading ? (
                                    <div className="chat-loading"><div className="chat-spinner"></div></div>
                                ) : messages.length === 0 ? (
                                    <div className="chat-no-messages"><p>No messages yet</p></div>
                                ) : (
                                    <>
                                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                                            <span style={{ background: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', color: '#54656f', boxShadow: '0 1px 0.5px rgba(0,0,0,0.1)', fontWeight: '500' }}>
                                                TODAY
                                            </span>
                                        </div>
                                        {messages.map(m => <MessageBubble key={m.id} msg={m} currentUserId={user.id} />)}
                                    </>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            {!(activeChat.type === 'course_broadcast' && isStudent) && (
                                <div className="chat-input-area">
                                    <input
                                        type="file"
                                        hidden
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <button className="wa-icon-btn">😊</button>
                                    <button
                                        className="wa-icon-btn"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        {uploading ? '⌛' : '📎'}
                                    </button>
                                    <input
                                        className="chat-input"
                                        placeholder="Type a message"
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                        disabled={uploading}
                                    />
                                    <button className="wa-icon-btn chat-send-btn" onClick={() => sendMessage()} disabled={!inputText.trim() || uploading}>
                                        {inputText.trim() ? '➤' : '🎤'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="chat-welcome">
                            <div className="chat-welcome-content">
                                <img src="https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png" alt="WhatsApp" className="chat-welcome-icon" style={{ opacity: 0.15, width: '250px' }} />
                                <h1>WhatsApp Web</h1>
                                <p style={{ maxWidth: '400px', margin: '0 auto', marginBottom: '20px' }}>
                                    Send and receive messages without keeping your phone online.<br />
                                    Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                                </p>
                                <div style={{ color: '#8696a0', fontSize: '13px', marginTop: '40px' }}>
                                    🔒 End-to-end encrypted
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
