import React, { useState } from 'react';
import { Tender, AmcuComplaintDoc, CompanyProfile } from '../types';
import { 
  FileText, 
  Gavel, 
  Scale, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Sparkles, 
  RefreshCw,
  Info,
  Building2,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AmcuComplaintGeneratorProps {
  currentTender: Tender;
  company?: CompanyProfile;
  complaints: AmcuComplaintDoc[];
  onAddComplaint: (complaint: AmcuComplaintDoc) => void;
}

export const AmcuComplaintGenerator: React.FC<AmcuComplaintGeneratorProps> = ({
  currentTender,
  company,
  complaints,
  onAddComplaint,
}) => {
  const { token } = useAuth();
  const [selectedComplaint, setSelectedComplaint] = useState<AmcuComplaintDoc | null>(complaints[0] || null);
  const [complainantName, setComplainantName] = useState(company?.shortName || company?.fullName || 'Учасник закупівель');
  const [complainantEdrpou, setComplainantEdrpou] = useState(company?.edrpou || 'NOT_AVAILABLE');
  const [specificDemand, setSpecificDemand] = useState('Зобов’язати Замовника усунути зазначені дискримінаційні вимоги шляхом внесення змін до тендерної документації.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Generate Complaint using Gemini backend
  const handleGenerateComplaint = async () => {
    setIsGenerating(true);
    setGenError(null);
    try {
      const violationsList = currentTender.violations.map(v => `${v.title}: ${v.description}`);
      const res = await fetch('/api/foultender/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          tenderId: currentTender.tenderNumber,
          tenderTitle: currentTender.title,
          customer: currentTender.customer,
          complainantName: complainantName,
          edrpou: complainantEdrpou,
          violations: violationsList.length > 0 ? violationsList : ['Дискримінаційні кваліфікаційні вимоги ст. 16/22'],
          specificDemand: specificDemand,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || errData.error || 'Не вдалося згенерувати скаргу до АМКУ');
      }
      const data = await res.json();

      const newDoc: AmcuComplaintDoc = {
        id: `complaint-${Date.now()}`,
        tenderId: currentTender.id,
        tenderNumber: currentTender.tenderNumber,
        tenderTitle: currentTender.title,
        customer: currentTender.customer,
        complainantName: complainantName,
        complainantEdrpou: complainantEdrpou,
        content: data.complaintText,
        legalReferences: data.legalReferences || ['Частина 4 статті 5 ЗУ «Про публічні закупівлі»', 'Частина 4 статті 22 ЗУ «Про публічні закупівлі»'],
        estimatedFee: Number.isFinite(Number(data.estimatedFee)) ? Number(data.estimatedFee) : null,
        status: 'DRAFT',
        createdAt: new Date().toISOString().split('T')[0],
      };

      onAddComplaint(newDoc);
      setSelectedComplaint(newDoc);
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || 'Помилка під час формування скарги');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (selectedComplaint) {
      navigator.clipboard.writeText(selectedComplaint.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-900/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Gavel className="w-4 h-4" />
            <span>FoulTender Legal • Генератор скарг до АМКУ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Оскарження дискримінаційних умов в АМКУ
          </h1>
          <p className="text-sm text-slate-300">
            Формування юридично бездоганних скарг до Постійно діючої адміністративної колегії АМКУ з розрахунком плати та посиланнями на практику
          </p>
        </div>
      </div>

      {genError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-rose-300 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Помилка генерації: </span>
              {genError}
            </div>
          </div>
          <button 
            onClick={() => setGenError(null)} 
            className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
          >
            Закрити
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h2 className="font-bold text-base text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Параметри скарги</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Тендер оскарження
              </label>
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs space-y-1">
                <div className="font-mono text-emerald-400 font-bold">{currentTender.tenderNumber}</div>
                <div className="text-white font-medium">{currentTender.title}</div>
                <div className="text-slate-400">Замовник: {currentTender.customer}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Скаржник (Назва компанії)
                </label>
                <input
                  type="text"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ЄДРПОУ Скаржника
                </label>
                <input
                  type="text"
                  value={complainantEdrpou}
                  onChange={(e) => setComplainantEdrpou(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Вимоги скаржника (Прохальна частина)
              </label>
              <textarea
                rows={3}
                value={specificDemand}
                onChange={(e) => setSpecificDemand(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <button
              id="generate-amcu-complaint-btn"
              disabled={isGenerating}
              onClick={handleGenerateComplaint}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-900/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ШІ-Юрист FoulTender формує офіційну скаргу...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Сформувати юридичну скаргу ШІ</span>
                </>
              )}
            </button>
          </div>

          {/* Previous Complaints list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Сформовані документи ({complaints.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedComplaint?.id === c.id
                      ? 'bg-amber-950/40 border-amber-800 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">{c.tenderNumber}</span>
                    <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                  </div>
                  <div className="line-clamp-1 font-medium mt-1">{c.tenderTitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area: Document Preview & Actions */}
        <div className="lg:col-span-7 space-y-4">
          {selectedComplaint ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Текст скарги до Колегії АМКУ</span>
                  </h3>
                  <p className="text-xs text-slate-400">Підготовлено відповідно до ст. 18 ЗУ «Про публічні закупівлі»</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Скопійовано!' : 'Копіювати'}</span>
                  </button>

                  <button
                    onClick={async () => {
                      const { jsPDF } = await import('jspdf');
                      const html2canvas = (await import('html2canvas')).default;
                      
                      const element = document.getElementById('complaint-document-text');
                      if (element) {
                        const originalBg = element.style.backgroundColor;
                        const originalColor = element.style.color;
                        const originalMaxHeight = element.style.maxHeight;
                        const originalOverflow = element.style.overflow;
                        
                        element.style.backgroundColor = '#ffffff';
                        element.style.color = '#000000';
                        element.style.maxHeight = 'none';
                        element.style.overflow = 'visible';
                        
                        try {
                          const canvas = await html2canvas(element, { scale: 2 });
                          const imgData = canvas.toDataURL('image/png');
                          const pdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'px',
                            format: [canvas.width, canvas.height]
                          });
                          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                          pdf.save(`Complaint_${currentTender.tenderNumber}.pdf`);
                        } finally {
                          element.style.backgroundColor = originalBg;
                          element.style.color = originalColor;
                          element.style.maxHeight = originalMaxHeight;
                          element.style.overflow = originalOverflow;
                        }
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Друк</span>
                  </button>
                </div>
              </div>

              {/* Legal Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Правові підстави:</span>
                {selectedComplaint.legalReferences.map((ref, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {ref}
                  </span>
                ))}
              </div>

              {/* Document Text Box */}
              <div 
                id="complaint-document-text"
                className="bg-slate-950 border border-slate-800 rounded-xl p-8 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto select-text shadow-inner"
              >
                <div className="mb-8">{selectedComplaint.content}</div>
                
                {(company?.signatureCliche || company?.stampCliche) && (
                  <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Підпис та печатка:</div>
                      <div className="flex items-center gap-12 h-24">
                        {company?.signatureCliche && (
                          <div className="relative w-32 h-full">
                            <img 
                              src={company.signatureCliche} 
                              alt="Signature" 
                              className="max-w-full max-h-full object-contain filter brightness-110 contrast-125 mix-blend-multiply" 
                            />
                            <div className="absolute bottom-0 left-0 w-full border-b border-slate-700 text-[8px] text-slate-500 text-center pt-1 italic">
                              (підпис)
                            </div>
                          </div>
                        )}
                        {company?.stampCliche && (
                          <div className="relative w-32 h-full">
                            <img 
                              src={company.stampCliche} 
                              alt="Stamp" 
                              className="max-w-full max-h-full object-contain filter brightness-110 contrast-125 mix-blend-multiply" 
                            />
                            <div className="absolute bottom-0 left-0 w-full text-[8px] text-slate-500 text-center pt-1 italic">
                              М.П.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right self-end pb-1">
                      <div className="font-bold text-white uppercase tracking-wider">{company?.directorPosition || 'Директор'}</div>
                      <div className="text-slate-400 mt-1">{company?.directorName || '_________________'}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-800/80 rounded-xl p-4 flex items-center justify-between text-xs">
                <div className="text-slate-300">
                  Офіційна плата за розгляд скарги: <strong className="text-emerald-400 font-mono">{selectedComplaint.estimatedFee != null ? `${selectedComplaint.estimatedFee.toLocaleString()} ₴` : 'UNKNOWN'}</strong>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Подається через авторизований електронний майданчик Prozorro
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              Виберіть або згенеруйте нову скаргу зліва.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
