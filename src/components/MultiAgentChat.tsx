import React, { useState } from 'react';
import { Tender, ChatMessage } from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  User, 
  MessageSquare, 
  Building2, 
  ShieldAlert, 
  Scale, 
  TrendingUp, 
  HelpCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MultiAgentChatProps {
  currentTender: Tender;
}

const AGENT_OPTIONS = [
  { id: 'CONSILIUM', name: 'Консиліум (Всі 5 агентів)', avatar: '🤖', badge: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'ESTIMATOR', name: 'Орест (Кошторисник BoQ)', avatar: '👷', badge: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'TECH_LEAD', name: 'Віталій (ГІП / Інженер)', avatar: '🏗️', badge: 'bg-blue-500/20 text-blue-300' },
  { id: 'LEGAL', name: 'Юлія (Тендерний Юрист)', avatar: '⚖️', badge: 'bg-amber-500/20 text-amber-300' },
  { id: 'FOULTENDER', name: 'FoulTender Guardian (Антифрод)', avatar: '🛡️', badge: 'bg-red-500/20 text-red-300' },
  { id: 'BID_MANAGER', name: 'Максим (Тендерний Директор)', avatar: '💼', badge: 'bg-indigo-500/20 text-indigo-300' },
];

export const MultiAgentChat: React.FC<MultiAgentChatProps> = ({ currentTender }) => {
  const { token } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string>('CONSILIUM');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      agentRole: 'CONSILIUM',
      agentName: 'Оркестратор консиліуму TenderAI & FoulTender',
      agentAvatar: '🤖',
      text: `Вітаємо! Ми – команда з 5 спеціалізованих ШІ-агентів. Ми завантажили дані по проєкту «${currentTender.title}» (бюджет: ${currentTender.budgetUah.toLocaleString()} грн). Ви можете запитати будь-якого фахівця (кошторисника, інженера, юриста, антифрод-аудитора або стратега) або отримати колективну відповідь консиліуму.`,
      timestamp: 'Щойно',
    },
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/tenderai/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          message: text,
          agentRole: selectedAgent,
          tenderContext: {
            title: currentTender.title,
            number: currentTender.tenderNumber,
            budget: currentTender.budgetUah,
            customer: currentTender.customer,
            foulScore: currentTender.foulScore,
            violations: currentTender.violations,
          },
        }),
      });

      const data = await res.json();
      const currentAgentMeta = AGENT_OPTIONS.find(a => a.id === selectedAgent) || AGENT_OPTIONS[0];

      const agentMsg: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        agentRole: selectedAgent as any,
        agentName: currentAgentMeta.name,
        agentAvatar: currentAgentMeta.avatar,
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Як оскаржити вимогу щодо 12 км до виробничої бази в АМКУ?',
    'Перевір ризики укладання монолітного бетону за 18 днів.',
    'Які матеріали в кошторисі мають найбільшу маржу?',
    'Склади рекомендацію для 3-го раунду редукціону.',
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            <span>Мультиагентний ШІ-Консиліум</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Інтерактивний чат з експертною радою
          </h1>
          <p className="text-sm text-slate-300">
            Отримуйте синхронні відповіді від інженера, кошторисника, антикорупційного аудитора та юриста
          </p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Agent selector list */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
              Вибір співрозмовника
            </h3>
            <div className="space-y-1.5">
              {AGENT_OPTIONS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`w-full p-3 rounded-xl flex items-center space-x-3 text-left transition-all cursor-pointer ${
                    selectedAgent === agent.id
                      ? 'bg-slate-800 border border-slate-700 text-white shadow-md'
                      : 'hover:bg-slate-800/50 text-slate-400 border border-transparent'
                  }`}
                >
                  <span className="text-2xl">{agent.avatar}</span>
                  <div>
                    <div className="font-bold text-xs text-white">{agent.name}</div>
                    <div className="text-[10px] text-slate-400">Натисніть для діалогу</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Швидкі запити</span>
            </h3>
            <div className="space-y-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-all border border-slate-700/60 leading-snug cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Message Window */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col h-[650px] justify-between">
          
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-base shrink-0">
                  {msg.sender === 'user' ? '👤' : msg.agentAvatar || '🤖'}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 space-y-1 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.sender === 'agent' && (
                    <div className="font-bold text-emerald-400 text-[11px] pb-1 border-b border-slate-700/50 mb-1 flex items-center justify-between">
                      <span>{msg.agentName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{msg.timestamp}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-3 text-xs text-slate-400 italic">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                </div>
                <span>Агент формує професійну відповідь...</span>
              </div>
            )}
          </div>

          {/* Chat Input Box */}
          <div className="pt-4 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={`Запитайте ${AGENT_OPTIONS.find(a => a.id === selectedAgent)?.name}...`}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />

            <button
              id="send-agent-message-btn"
              disabled={isLoading || !inputMessage.trim()}
              onClick={() => handleSendMessage()}
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Надіслати</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
