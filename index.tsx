
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Mail, 
  MessageSquare, 
  Users, 
  Search, 
  Plus, 
  Settings, 
  Menu, 
  Bell, 
  User, 
  Send,
  Paperclip,
  MoreVertical,
  Check,
  CheckCircle2,
  Inbox,
  X,
  RefreshCw,
  Clock,
  Shield,
  Zap,
  Filter
} from 'lucide-react';

// --- Types ---

type Provider = 'gmail' | 'outlook' | 'whatsapp' | 'telegram' | 'messenger' | 'twitter' | 'linkedin';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  isMe: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface Thread {
  id: string;
  provider: Provider;
  title: string;
  snippet: string;
  lastMessageAt: number;
  unreadCount: number;
  avatar?: string;
  messages: Message[];
  tags: string[];
}

// --- Mock Data ---

const MOCK_THREADS: Thread[] = [
  {
    id: '1',
    provider: 'gmail',
    title: 'Sarah Jenkins',
    snippet: 'Project Update: The Android architecture is ready for review.',
    lastMessageAt: Date.now() - 1000 * 60 * 5,
    unreadCount: 1,
    avatar: 'https://i.pravatar.cc/150?u=1',
    tags: ['Work', 'Urgent'],
    messages: [
      { id: 'm1', senderId: 'others', content: 'Hi, just checking in on the Omnicom prototype.', timestamp: Date.now() - 1000 * 60 * 60, isMe: false, status: 'read' },
      { id: 'm2', senderId: 'me', content: 'I am working on it right now.', timestamp: Date.now() - 1000 * 60 * 30, isMe: true, status: 'read' },
      { id: 'm3', senderId: 'others', content: 'Project Update: The Android architecture is ready for review.', timestamp: Date.now() - 1000 * 60 * 5, isMe: false, status: 'delivered' }
    ]
  },
  {
    id: '2',
    provider: 'whatsapp',
    title: 'Product Team',
    snippet: 'Alex: We need to ship the dark mode fix by Friday.',
    lastMessageAt: Date.now() - 1000 * 60 * 12,
    unreadCount: 3,
    tags: ['Work'],
    messages: [
      { id: 'wm1', senderId: 'alex', content: 'Guys, look at the latest metrics.', timestamp: Date.now() - 1000 * 60 * 20, isMe: false, status: 'read' },
      { id: 'wm2', senderId: 'alex', content: 'We need to ship the dark mode fix by Friday.', timestamp: Date.now() - 1000 * 60 * 12, isMe: false, status: 'read' }
    ]
  },
  {
    id: '3',
    provider: 'twitter',
    title: '@elonmusk',
    snippet: 'Interesting idea. Will look into it.',
    lastMessageAt: Date.now() - 1000 * 60 * 60 * 2,
    unreadCount: 0,
    avatar: 'https://i.pravatar.cc/150?u=3',
    tags: ['Social'],
    messages: [
      { id: 'tm1', senderId: 'me', content: 'What do you think about unified communication apps?', timestamp: Date.now() - 1000 * 60 * 60 * 5, isMe: true, status: 'read' },
      { id: 'tm2', senderId: 'elon', content: 'Interesting idea. Will look into it.', timestamp: Date.now() - 1000 * 60 * 60 * 2, isMe: false, status: 'read' }
    ]
  },
  {
    id: '4',
    provider: 'outlook',
    title: 'HR Department',
    snippet: 'Annual Leave Policy Update - Please Read',
    lastMessageAt: Date.now() - 1000 * 60 * 60 * 24,
    unreadCount: 0,
    avatar: '',
    tags: ['Work'],
    messages: []
  },
  {
    id: '5',
    provider: 'telegram',
    title: 'Family Group',
    snippet: 'Mom: Dinner at 7?',
    lastMessageAt: Date.now() - 1000 * 60 * 45,
    unreadCount: 5,
    tags: ['Family'],
    messages: []
  }
];

// --- Components ---

const ProviderIcon = ({ provider, className = "w-4 h-4" }: { provider: Provider, className?: string }) => {
  switch (provider) {
    case 'gmail': return <div className={`${className} text-red-500`}><Mail size={16} /></div>;
    case 'outlook': return <div className={`${className} text-blue-500`}><Mail size={16} /></div>;
    case 'whatsapp': return <div className={`${className} text-green-500`}><MessageSquare size={16} /></div>;
    case 'telegram': return <div className={`${className} text-blue-400`}><Send size={16} /></div>;
    case 'messenger': return <div className={`${className} text-purple-500`}><MessageSquare size={16} /></div>;
    case 'twitter': return <div className={`${className} text-sky-500`}><Users size={16} /></div>;
    case 'linkedin': return <div className={`${className} text-blue-700`}><Users size={16} /></div>;
    default: return <div className={className}><MessageSquare size={16} /></div>;
  }
};

const Avatar = ({ src, alt, fallback }: { src?: string, alt: string, fallback: string }) => {
  return (
    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="text-slate-500 dark:text-slate-300 font-medium text-sm">{fallback.substring(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
};

const Badge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <div className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
      {count}
    </div>
  );
};

// --- Main App ---

const OmnicomApp = () => {
  const [activeTab, setActiveTab] = useState<'unified' | 'email' | 'instant' | 'communities'>('unified');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Background Sync Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update a timestamp to simulate activity
      setThreads(prev => prev.map(t => {
        if (Math.random() > 0.8) {
          return { ...t, lastMessageAt: Date.now() };
        }
        return t;
      }).sort((a, b) => b.lastMessageAt - a.lastMessageAt));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredThreads = useMemo(() => {
    let result = threads;
    
    // Filter by Tab
    if (activeTab === 'email') result = result.filter(t => ['gmail', 'outlook', 'proton'].includes(t.provider));
    if (activeTab === 'instant') result = result.filter(t => ['whatsapp', 'telegram', 'messenger', 'sms'].includes(t.provider));
    if (activeTab === 'communities') result = result.filter(t => ['twitter', 'linkedin', 'instagram'].includes(t.provider));

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.snippet.toLowerCase().includes(q));
    }

    return result.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }, [threads, activeTab, searchQuery]);

  const activeThread = threads.find(t => t.id === selectedThreadId);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Navigation Rail / Sidebar */}
      <div className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} shrink-0 z-20`}>
        <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
              O
            </div>
            {isSidebarOpen && <span className="font-bold text-xl tracking-tight">Omnicom</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          <NavItem 
            icon={<Inbox size={20} />} 
            label="Unified Inbox" 
            isActive={activeTab === 'unified'} 
            onClick={() => setActiveTab('unified')} 
            isOpen={isSidebarOpen}
            badge={threads.reduce((acc, t) => acc + t.unreadCount, 0)}
          />
          <NavItem 
            icon={<Mail size={20} />} 
            label="Email" 
            isActive={activeTab === 'email'} 
            onClick={() => setActiveTab('email')} 
            isOpen={isSidebarOpen}
          />
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label="Instant" 
            isActive={activeTab === 'instant'} 
            onClick={() => setActiveTab('instant')} 
            isOpen={isSidebarOpen}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Communities" 
            isActive={activeTab === 'communities'} 
            onClick={() => setActiveTab('communities')} 
            isOpen={isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setShowAddAccount(true)}
            className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <Plus size={18} />
            </div>
            {isSidebarOpen && <span className="font-medium text-sm">Add Account</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Global search across all accounts..." 
                className="w-full bg-slate-100 dark:bg-slate-800 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              JD
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Thread List */}
          <div className={`w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 ${selectedThreadId ? 'hidden md:flex' : 'flex w-full'}`}>
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
              <h2 className="font-semibold text-lg capitalize">{activeTab}</h2>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500">
                   <Filter size={16} />
                </button>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500">
                   <CheckCircle2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredThreads.map(thread => (
                <div 
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedThreadId === thread.id ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar src={thread.avatar} alt={thread.title} fallback={thread.title} />
                      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm">
                        <ProviderIcon provider={thread.provider} className="" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`text-sm truncate pr-2 ${thread.unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>
                          {thread.title}
                        </h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {formatTime(thread.lastMessageAt)}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${thread.unreadCount > 0 ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500'}`}>
                        {thread.snippet}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {thread.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {thread.unreadCount > 0 && <Badge count={thread.unreadCount} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thread Detail */}
          <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 ${!selectedThreadId ? 'hidden md:flex' : 'flex'}`}>
            {activeThread ? (
              <>
                <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-3">
                     <button className="md:hidden mr-2 text-slate-500" onClick={() => setSelectedThreadId(null)}>
                        <X size={20} />
                     </button>
                    <Avatar src={activeThread.avatar} alt={activeThread.title} fallback={activeThread.title} />
                    <div>
                      <h2 className="font-bold text-sm flex items-center gap-2">
                        {activeThread.title}
                        <ProviderIcon provider={activeThread.provider} />
                      </h2>
                      <span className="text-xs text-slate-500">via {activeThread.provider} • 2 participants</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><Search size={18} /></button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><MoreVertical size={18} /></button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                  {/* AI Summary Banner */}
                  {activeThread.messages.length > 2 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 flex gap-3 items-start">
                      <Zap className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" size={16} />
                      <div>
                        <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1">AI Summary</h4>
                        <p className="text-xs text-indigo-700 dark:text-indigo-200 leading-relaxed">
                          The conversation is about the <strong>Android architecture review</strong>. Sarah is asking for an update, and Alex mentioned shipping the dark mode fix by Friday.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeThread.messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-3 md:p-4 text-sm shadow-sm ${
                        msg.isMe 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                      }`}>
                        <p>{msg.content}</p>
                        <div className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${msg.isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {formatTime(msg.timestamp)}
                          {msg.isMe && <Check size={12} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                  <div className="flex items-end gap-2 max-w-4xl mx-auto">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                      <Plus size={20} />
                    </button>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 px-4 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                      <textarea 
                        className="w-full bg-transparent border-none resize-none focus:outline-none text-sm max-h-32 pt-1" 
                        placeholder={`Reply via ${activeThread.provider}...`}
                        rows={1}
                      />
                    </div>
                    <button className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-transform active:scale-95">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <Inbox size={48} className="opacity-20" />
                </div>
                <p className="font-medium">Select a conversation to start messaging</p>
                <p className="text-sm opacity-60">or press <span className="font-bold">C</span> to compose</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Add Account</h2>
                <button onClick={() => setShowAddAccount(false)}><X size={20} /></button>
             </div>
             <div className="p-6 grid grid-cols-2 gap-4">
                <AccountOption icon={<Mail />} label="Gmail" color="text-red-500" />
                <AccountOption icon={<Mail />} label="Outlook" color="text-blue-500" />
                <AccountOption icon={<MessageSquare />} label="WhatsApp" color="text-green-500" />
                <AccountOption icon={<Send />} label="Telegram" color="text-blue-400" />
                <AccountOption icon={<Users />} label="Twitter" color="text-sky-500" />
                <AccountOption icon={<Users />} label="LinkedIn" color="text-blue-700" />
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-950 text-xs text-center text-slate-500">
               Secure integration via OAuth 2.0 & Encrypted Storage
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick, isOpen, badge }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
  >
    <div className="relative">
      {icon}
      {badge > 0 && !isOpen && (
        <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
      )}
    </div>
    {isOpen && (
      <div className="flex-1 flex justify-between items-center">
        <span>{label}</span>
        {badge > 0 && (
           <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
    )}
  </button>
);

const AccountOption = ({ icon, label, color }: any) => (
  <button className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
     <div className={`${color} p-2 bg-slate-100 dark:bg-slate-800 rounded-full`}>{icon}</div>
     <span className="font-medium text-sm">{label}</span>
  </button>
);

// --- Utils ---

function formatTime(ms: number) {
  const date = new Date(ms);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const root = createRoot(document.getElementById('root')!);
root.render(<OmnicomApp />);
