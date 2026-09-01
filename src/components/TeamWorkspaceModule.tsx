import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, CheckCircle2, Clock, AlertTriangle, ShieldCheck, MessageSquare, Send, Calendar, UserCheck, Search, Filter, ArrowRight, Shield, Award, Activity } from 'lucide-react';
import { Tender } from '../types';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleNameUk: string;
  avatar: string;
  assignedTendersCount: number;
  activeTasksCount: number;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
}

interface TeamTask {
  id: string;
  tenderId: string;
  tenderNumber: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  assigneeRole: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  commentsCount: number;
  createdAt: string;
}

interface TeamComment {
  id: string;
  tenderId?: string;
  taskId?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  tenderId?: string;
  timestamp: string;
}

interface TeamWorkspaceModuleProps {
  tenders: Tender[];
  currentTender: Tender | null;
  onSelectTender: (tender: Tender) => void;
  onNavigateToWarRoom: () => void;
}

export const TeamWorkspaceModule: React.FC<TeamWorkspaceModuleProps> = ({
  tenders,
  currentTender,
  onSelectTender,
  onNavigateToWarRoom
}) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'TASKS' | 'AUDIT'>('TASKS');
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [comments, setComments] = useState<TeamComment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New task form state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');
  const [newTaskTenderId, setNewTaskTenderId] = useState(currentTender?.id || (tenders[0]?.id || ''));

  // New member form state
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('LEAD_ESTIMATOR');

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Fetch initial team data
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch('/api/team/members', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/team/tasks', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/team/comments', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/audit-logs', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ])
    .then(([m, t, c, a]) => {
      if (Array.isArray(m)) setMembers(m);
      if (Array.isArray(t)) setTasks(t);
      if (Array.isArray(c)) setComments(c);
      if (Array.isArray(a)) setAuditLogs(a);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [token]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !token) return;

    const assignedMember = members.find(m => m.id === newTaskAssigneeId) || members[0];
    const targetTender = tenders.find(t => t.id === newTaskTenderId) || currentTender;

    try {
      const res = await fetch('/api/team/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          tenderId: targetTender?.id || null,
          title: newTaskTitle,
          description: newTaskDesc,
          assigneeId: assignedMember?.id || null,
          priority: newTaskPriority,
        })
      });
      if (res.ok) {
        const created = await res.json();
        setTasks(prev => [{
          ...created,
          tenderId: targetTender?.id,
          tenderNumber: targetTender?.tenderNumber || 'UNKNOWN',
          assigneeId: assignedMember?.id || 'unassigned',
          assigneeName: assignedMember?.name || 'UNKNOWN',
          assigneeRole: assignedMember?.roleNameUk || 'UNKNOWN',
          dueDate: 'UNKNOWN',
          commentsCount: 0,
        }, ...prev]);
        setIsNewTaskOpen(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim() || !token) return;

    const roleMap: Record<string, string> = {
      'BID_DIRECTOR': 'Тендерний директор',
      'LEAD_ESTIMATOR': 'Головний кошторисник',
      'SENIOR_LAWYER': 'Провідний юрист / АМКУ',
      'PROJECT_MANAGER': 'Керівник проектів',
      'ENGINEER': 'Інженер ВТО'
    };

    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newMemberName,
          email: newMemberEmail,
          role: newMemberRole,
          roleNameUk: roleMap[newMemberRole] || 'Фахівець'
        })
      });
      if (res.ok) {
        const created = await res.json();
        setMembers(prev => [...prev, created]);
        setIsNewMemberOpen(false);
        setNewMemberName('');
        setNewMemberEmail('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/team/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !token) return;

    try {
      const res = await fetch('/api/team/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          tenderId: currentTender?.id,
          taskId: activeTaskId || undefined,
          text: commentText,
          authorName: user?.displayName || user?.email?.split('@')[0] || 'Користувач',
          authorRole: 'Тендерний директор'
        })
      });
      if (res.ok) {
        const created = await res.json();
        setComments(prev => [...prev, created]);
        setCommentText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 font-bold uppercase tracking-wider">
                Team Workspace & Governance
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {members.length} активних учасників
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Командний простір підготовки пропозицій
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Розподіл відповідальності, перевірка кошторисів, узгодження скарг АМКУ та повний аудиторський слід дій.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/30"
            >
              <Plus size={16} /> Створити завдання
            </button>
            <button
              onClick={() => setIsNewMemberOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center gap-2 border border-slate-700"
            >
              <Users size={16} /> Додати фахівця
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'TASKS' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 size={14} /> Дошка завдань ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('MEMBERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'MEMBERS' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} /> Склад команди ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'AUDIT' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity size={14} /> Аудиторський журнал (Audit Trail)
          </button>
        </div>
      </div>

      {/* Tab: TASKS KANBAN */}
      {activeTab === 'TASKS' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const).map(colStatus => {
            const colTasks = tasks.filter(t => t.status === colStatus);
            const colMeta = {
              TODO: { title: 'До виконання', color: 'border-slate-800 text-slate-400', badgeBg: 'bg-slate-800' },
              IN_PROGRESS: { title: 'В роботі', color: 'border-indigo-500/40 text-indigo-400', badgeBg: 'bg-indigo-500/20 text-indigo-400' },
              IN_REVIEW: { title: 'На перевірці', color: 'border-amber-500/40 text-amber-400', badgeBg: 'bg-amber-500/20 text-amber-400' },
              DONE: { title: 'Виконано', color: 'border-emerald-500/40 text-emerald-400', badgeBg: 'bg-emerald-500/20 text-emerald-400' }
            }[colStatus];

            return (
              <div key={colStatus} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">{colMeta.title}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${colMeta.badgeBg}`}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      className="bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-4 transition-all shadow-md space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {task.tenderNumber}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          task.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
                      )}

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                          <UserCheck size={12} className="text-indigo-400" />
                          <span className="truncate max-w-[100px]">{task.assigneeName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 font-mono">
                          <Calendar size={11} /> {task.dueDate}
                        </div>
                      </div>

                      {/* Status quick mover */}
                      <div className="pt-2 flex items-center gap-1">
                        {colStatus !== 'TODO' && (
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, 'TODO')}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded text-[9px] text-slate-400"
                          >
                            ← Todo
                          </button>
                        )}
                        {colStatus !== 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 rounded text-[9px] text-indigo-400"
                          >
                            В роботу
                          </button>
                        )}
                        {colStatus !== 'DONE' && (
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, 'DONE')}
                            className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 rounded text-[9px] text-emerald-400 ml-auto"
                          >
                            ✓ Готово
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-[11px] text-slate-600 border border-dashed border-slate-800/60 rounded-xl">
                      Немає завдань
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: MEMBERS */}
      {activeTab === 'MEMBERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl border border-slate-700 shadow-inner">
                    {member.avatar || '👤'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{member.name}</h3>
                    <div className="text-xs text-indigo-400 font-medium">{member.roleNameUk}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{member.email}</div>
                  </div>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  member.status === 'ONLINE' ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' :
                  member.status === 'AWAY' ? 'bg-amber-400' : 'bg-slate-600'
                }`} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/60">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Активні тендери</div>
                  <div className="text-lg font-black text-white mt-1">{member.assignedTendersCount}</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/60">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Завдання в роботі</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">{member.activeTasksCount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Журнал дій та автентифікації</h3>
              <p className="text-xs text-slate-400">Повний незмінний аудиторський слід усіх змін у системі</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 font-bold">
              {auditLogs.length} записів
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-bold">
                      {log.module}
                    </span>
                    <span className="text-xs font-bold text-white">{log.details}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-3">
                    <span>Користувач: <strong className="text-slate-300">{log.userName}</strong></span>
                    <span>•</span>
                    <span>Дія: <strong className="text-slate-400 font-mono">{log.action}</strong></span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString('uk-UA')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: NEW TASK */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Нове командне завдання</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Назва завдання</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Напр., Перевірка відповідності аналогічних договорів"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Опис та вимоги</label>
                <textarea
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  placeholder="Деталі вимоги ТД, посилання на пункти або скан-копії..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 mt-1 h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Пріоритет</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none mt-1"
                  >
                    <option value="LOW">Звичайний</option>
                    <option value="MEDIUM">Середній</option>
                    <option value="HIGH">Високий</option>
                    <option value="CRITICAL">Критичний (Дедлайн)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Відповідальний</label>
                  <select
                    value={newTaskAssigneeId}
                    onChange={e => setNewTaskAssigneeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none mt-1"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.roleNameUk})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Створити завдання
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW MEMBER */}
      {isNewMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Додати фахівця до тендерного відділу</h3>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Повне ім&apos;я / ПІБ</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  placeholder="Олена Коваленко"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Робочий Email</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  placeholder="olena.k@company.ua"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Роль та повноваження</label>
                <select
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none mt-1"
                >
                  <option value="BID_DIRECTOR">Тендерний директор</option>
                  <option value="LEAD_ESTIMATOR">Головний кошторисник</option>
                  <option value="SENIOR_LAWYER">Провідний юрист / АМКУ</option>
                  <option value="PROJECT_MANAGER">Керівник проектів</option>
                  <option value="ENGINEER">Інженер ВТО</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewMemberOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Додати учасника
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
