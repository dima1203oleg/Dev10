import React, { useState, useCallback } from 'react';
import { Tender, TenderDocument } from '../types';
import { 
  FileText, 
  Upload, 
  Search, 
  FileCheck2, 
  Clock, 
  ShieldAlert, 
  FileCode2, 
  MoreVertical,
  Download,
  Trash2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DocumentWorkspaceProps {
  tender: Tender;
  documents: TenderDocument[];
  onUpload: (files: File[]) => void;
  onProcessAI: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}

export const DocumentWorkspace: React.FC<DocumentWorkspaceProps> = ({
  tender,
  documents,
  onUpload,
  onProcessAI,
  onDelete
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  }, [onUpload]);

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: TenderDocument['status']) => {
    switch (status) {
      case 'EXTRACTED': return <FileCheck2 className="text-emerald-500" size={16} />;
      case 'PROCESSING': return <Clock className="text-amber-500 animate-pulse" size={16} />;
      case 'ERROR': return <ShieldAlert className="text-rose-500" size={16} />;
      default: return <FileText className="text-slate-500" size={16} />;
    }
  };

  const getTypeIcon = (type: TenderDocument['type']) => {
    switch (type) {
      case 'BOQ': return <FileCode2 className="text-blue-400" size={18} />;
      case 'TECHNICAL': return <ShieldAlert className="text-amber-400" size={18} />;
      default: return <FileText className="text-slate-400" size={18} />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Document Workspace</div>
          <h2 className="text-xl font-bold text-white">Робота з документацією тендера</h2>
          <p className="text-xs text-slate-400">{tender.tenderNumber} • {tender.title}</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
              <Download size={14} />
              <span>Завантажити все ZIP</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload & Files Area */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Drag & Drop Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center text-center space-y-4 ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-500/5' 
                : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="p-4 bg-slate-950 rounded-2xl text-emerald-500 shadow-xl">
               <Upload size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Перетягніть файли сюди</h3>
              <p className="text-[10px] text-slate-500 font-medium">Підтримуються PDF, DOCX, XLSX (до 50 МБ)</p>
            </div>
            <input 
              type="file" 
              multiple 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => e.target.files && onUpload(Array.from(e.target.files))}
            />
            <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
              Обрати файли вручну
            </button>
          </div>

          {/* Files List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Пошук у документах..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-[10px] text-white focus:outline-none focus:border-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Всього: {documents.length}
              </div>
            </div>

            <div className="divide-y divide-slate-800">
              {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                <div key={doc.id} className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-slate-700 transition-colors">
                      {getTypeIcon(doc.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">{doc.name}</span>
                        {getStatusIcon(doc.status)}
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : 'Size Unknown'}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.status === 'IDLE' && (
                      <button 
                        onClick={() => onProcessAI(doc.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all flex items-center gap-1.5"
                      >
                        <Sparkles size={12} />
                        <span className="hidden sm:inline">AI Extract</span>
                      </button>
                    )}
                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(doc.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                   <div className="p-4 bg-slate-950 rounded-full text-slate-800">
                      <FileText size={32} />
                   </div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Документи відсутні</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-indigo-500/20 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-widest">AI Extraction Index</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Статус обробки</span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      {documents.filter(d => d.status === 'EXTRACTED').length}/{documents.length} Готово
                    </span>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${(documents.filter(d => d.status === 'EXTRACTED').length / (documents.length || 1)) * 100}%` }}
                    />
                 </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Виявлені критичні умови:</div>
                {documents.some(d => d.extractedData?.riskFlags?.length) ? (
                  <div className="space-y-2">
                    {documents.flatMap(d => d.extractedData?.riskFlags || []).slice(0, 3).map((risk, idx) => (
                      <div key={idx} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-start gap-3">
                        <div className="mt-0.5 text-rose-500"><ShieldAlert size={14} /></div>
                        <div className="text-[11px] text-rose-200 leading-snug font-medium">{risk}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Аналіз не виявив критичних ризиків</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => {
                const idleDocs = documents.filter(d => d.status === 'IDLE');
                idleDocs.forEach(d => onProcessAI(d.id));
              }}
              disabled={!documents.some(d => d.status === 'IDLE')}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
               <span>Запустити повний аудит ТД ({documents.filter(d => d.status === 'IDLE').length})</span>
               <ArrowRight size={14} />
            </button>
          </div>
          
          {/* Quick Help */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
             <h4 className="text-xs font-bold text-white mb-3">Як це працює?</h4>
             <ul className="space-y-3">
                <li className="flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></div>
                   <span>AI автоматично класифікує документи на Технічні, Комерційні та Кошторисні.</span>
                </li>
                <li className="flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1"></div>
                   <span>Екстракція даних дозволяє знайти приховані вимоги (досвід, обладнання, сертифікати).</span>
                </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
