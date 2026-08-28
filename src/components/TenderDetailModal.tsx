import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  X, 
  Building2, 
  FileText, 
  Download, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Users, 
  ExternalLink,
  Layers,
  Phone,
  Mail,
  Loader2,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Tender, AppSection } from '../types';

interface TenderDetailModalProps {
  tenderId: string;
  onClose: () => void;
  onRunAudit?: (tender: Tender) => void;
  onOpenWarRoom?: (tender: Tender) => void;
}

export const TenderDetailModal: React.FC<TenderDetailModalProps> = ({
  tenderId,
  onClose,
  onRunAudit,
  onOpenWarRoom
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'DOCS' | 'CUSTOMER' | 'TIMELINE' | 'AI_AUDIT'>('ITEMS');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const runDeepAudit = async () => {
    if (!token) return;
    setIsAuditing(true);
    try {
      const res = await fetch(`/api/prozorro/tender/${tenderId}/audit`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to run audit");
      const data = await res.json();
      setAuditResult(data);
      setActiveTab('AI_AUDIT');
    } catch (err) {
      console.error(err);
      alert("Не вдалося провести AI-аудит документації.");
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/prozorro/tender/${encodeURIComponent(tenderId)}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) {
          throw new Error(`Не вдалося завантажити деталі тендера (код ${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          setDetailData(data.structured);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Помилка мережі при отриманні даних Prozorro');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (tenderId) {
      loadDetail();
    }

    return () => { isMounted = false; };
  }, [tenderId, token]);

  const convertToTenderObject = (): Tender => {
    if (!detailData) {
      return {
        id: tenderId,
        tenderNumber: `UA-${tenderId.substring(0, 8)}`,
        title: "Тендер Prozorro",
        customer: "Замовник Prozorro",
        customerEdrpou: "NOT_AVAILABLE",
        customerCity: "NOT_AVAILABLE",
        budgetUah: null,
        deadline: "NOT_AVAILABLE",
        region: "NOT_AVAILABLE",
        status: 'ACTIVE',
        category: "Закупівлі",
        foulScore: null,
        riskLevel: 'NOT_ANALYZED',
        summary: "Імпортовано з Prozorro API",
        boqItems: [],
        violations: [],
        createdDate: new Date().toISOString().split('T')[0],
      };
    }

    return {
      id: detailData.id,
      tenderNumber: detailData.tenderNumber,
      title: detailData.title,
      customer: detailData.customer.name,
      customerEdrpou: detailData.customer.edrpou,
      customerCity: detailData.customer.locality || detailData.customer.region,
      budgetUah: detailData.value.amount,
      deadline: detailData.timeline?.tenderPeriod?.endDate || "NOT_AVAILABLE",
      region: detailData.customer.region,
      status: 'ACTIVE',
      category: detailData.items?.[0]?.cpvName || "Будівельні роботи",
      foulScore: null,
      riskLevel: 'NOT_ANALYZED',
      summary: detailData.description || `Офіційна закупівля Prozorro № ${detailData.tenderNumber}`,
      source: {
        name: 'Prozorro',
        url: `https://prozorro.gov.ua/tender/${detailData.tenderNumber}`,
        retrievedAt: new Date().toISOString()
      },
      createdDate: detailData.timeline?.datePublished || null,
      boqItems: (detailData.items || []).map((it: any, idx: number) => ({
        id: `boq-${idx}`,
        code: it.cpvCode,
        description: it.description,
        unit: it.unit,
        quantity: it.quantity,
        standardPriceUah: null,
        marketPriceUah: null,
        laborHours: null,
        anomaly: null
      })),
      violations: [],
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-800/80 border-b border-slate-700/70 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
                {detailData?.tenderNumber || tenderId}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Офіційний API Prozorro</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {loading ? "Завантаження деталей закупівлі з Prozorro..." : (detailData?.title || "Деталі закупівлі")}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!loading && !error && (
              <button 
                onClick={runDeepAudit}
                disabled={isAuditing}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs transition-all shadow-lg shadow-emerald-900/20"
              >
                {isAuditing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isAuditing ? 'Аналіз...' : 'AI Аудит документації'}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
              <p className="text-sm font-medium">Отримання документів, специфікацій та контактів замовника...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-950/40 border border-red-800/80 rounded-xl text-red-200 text-sm space-y-2">
              <div className="font-bold flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Не вдалося завантажити картку Prozorro</span>
              </div>
              <p className="text-xs text-red-300/80">{error}</p>
            </div>
          ) : detailData ? (
            <div className="space-y-6">

              {/* KPI Header Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400 font-medium">Очікувана вартість</div>
                  <div className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
                    {detailData.value.amount !== null && detailData.value.amount !== undefined 
                      ? `${detailData.value.amount.toLocaleString()} ₴` 
                      : 'Не вказано'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {detailData.value.valueAddedTaxIncluded ? 'З ПДВ' : 'Без ПДВ'}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400 font-medium">Замовник</div>
                  <div className="text-xs font-bold text-slate-200 truncate mt-1">
                    {detailData.customer.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ЄДРПОУ: {detailData.customer.edrpou}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400 font-medium">Кінцевий термін подання</div>
                  <div className="text-xs font-bold text-amber-300 mt-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {detailData.timeline?.tenderPeriod?.endDate 
                        ? new Date(detailData.timeline.tenderPeriod.endDate).toLocaleString('uk-UA')
                        : 'За вказаним графіком'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-slate-700/80 space-x-4">
                <button
                  onClick={() => setActiveTab('ITEMS')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === 'ITEMS'
                      ? 'border-teal-400 text-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Предмети закупівлі ({detailData.items?.length || 0})
                </button>

                <button
                  onClick={() => setActiveTab('DOCS')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === 'DOCS'
                      ? 'border-teal-400 text-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Документація ТД ({detailData.documents?.length || 0})
                </button>

                <button
                  onClick={() => setActiveTab('CUSTOMER')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === 'CUSTOMER'
                      ? 'border-teal-400 text-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Контакти замовника
                </button>

                <button
                  onClick={() => setActiveTab('TIMELINE')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === 'TIMELINE'
                      ? 'border-teal-400 text-teal-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Часовий графік
                </button>

                {auditResult && (
                  <button
                    onClick={() => setActiveTab('AI_AUDIT')}
                    className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'AI_AUDIT'
                        ? 'border-emerald-400 text-emerald-400'
                        : 'border-transparent text-emerald-400/60 hover:text-emerald-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Результати Аудиту
                  </button>
                )}
              </div>

              {/* Tab Content */}
              {activeTab === 'ITEMS' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-300">
                    Перелік товарів, робіт чи послуг за закупівлею:
                  </div>
                  {detailData.items?.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">Перелік специфікацій відсутній у відповіді API.</div>
                  ) : (
                    <div className="space-y-2">
                      {detailData.items?.map((item: any) => (
                        <div key={item.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-teal-400 font-bold">Код ДК 021:2015 - {item.cpvCode}</span>
                            <span className="text-slate-300 font-bold">{item.quantity} {item.unit}</span>
                          </div>
                          <div className="text-xs text-white font-medium">{item.description}</div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>Місце поставки/виконання: {item.deliveryAddress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'DOCS' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-300">
                    Офіційні файли ТД безпосередньо з електронного майданчика Prozorro:
                  </div>
                  {detailData.documents?.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">Замовник ще не завантажив додаткові PDF/DOC файли.</div>
                  ) : (
                    <div className="space-y-2">
                      {detailData.documents?.map((doc: any) => (
                        <div key={doc.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-600 transition-colors">
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <FileText className="w-5 h-5 text-teal-400 flex-shrink-0" />
                            <div className="truncate">
                              <div className="text-xs font-bold text-white truncate">{doc.title}</div>
                              <div className="text-[10px] text-slate-400">
                                Опубліковано: {new Date(doc.datePublished).toLocaleDateString('uk-UA')}
                              </div>
                            </div>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 border border-teal-500/40 rounded-lg text-xs font-bold flex items-center space-x-1.5 flex-shrink-0 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Завантажити</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'CUSTOMER' && (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Найменування організації:</span>
                      <strong className="text-white font-medium">{detailData.customer.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Код ЄДРПОУ:</span>
                      <strong className="text-emerald-400 font-mono">{detailData.customer.edrpou}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Адреса:</span>
                      <span className="text-slate-200">{detailData.customer.address}, {detailData.customer.locality}, {detailData.customer.region}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Контактна особа:</span>
                      <span className="text-slate-200">{detailData.customer.contactPerson || 'Вказано в ТД'}</span>
                    </div>
                  </div>

                  {(detailData.customer.contactEmail || detailData.customer.contactPhone) && (
                    <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-4">
                      {detailData.customer.contactEmail && (
                        <div className="flex items-center space-x-1.5 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-teal-400" />
                          <span>{detailData.customer.contactEmail}</span>
                        </div>
                      )}
                      {detailData.customer.contactPhone && (
                        <div className="flex items-center space-x-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-teal-400" />
                          <span>{detailData.customer.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'TIMELINE' && (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-400">Період оскарження / роз'яснень:</span>
                      <span className="text-slate-200 font-mono">
                        {detailData.timeline?.enquiryPeriod?.endDate 
                          ? new Date(detailData.timeline.enquiryPeriod.endDate).toLocaleString('uk-UA') 
                          : 'Згідно з нормативами ЗУ'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-400">Кінцевий строк подання пропозицій:</span>
                      <span className="text-amber-300 font-bold font-mono">
                        {detailData.timeline?.tenderPeriod?.endDate 
                          ? new Date(detailData.timeline.tenderPeriod.endDate).toLocaleString('uk-UA') 
                          : 'Згідно з оголошенням'}
                      </span>
                    </div>

                    {detailData.timeline?.auctionPeriod?.startDate && (
                      <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
                        <span className="text-slate-400">Дата та час аукціону:</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {new Date(detailData.timeline.auctionPeriod.startDate).toLocaleString('uk-UA')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'AI_AUDIT' && auditResult && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-5 space-y-5">
                    <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-emerald-100">Глибокий AI-Аудит Тендерної Документації</h3>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/40 rounded-full border border-emerald-800/60">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Складність:</span>
                        <span className="text-xs font-black text-emerald-100">{auditResult.complexityScore}/10</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          Технічні Вимоги
                        </h4>
                        <ul className="space-y-2">
                          {auditResult.technicalAnalysis.map((item: string, i: number) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2 bg-slate-900/40 p-2 rounded border border-slate-800/60">
                              <span className="text-emerald-400 font-mono mt-0.5">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-rose-400 uppercase tracking-tight flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Виявлені Ризики
                        </h4>
                        <ul className="space-y-2">
                          {auditResult.risks.map((item: string, i: number) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2 bg-rose-950/10 p-2 rounded border border-rose-900/30">
                              <span className="text-rose-400 font-mono mt-0.5">!</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-700/80 rounded-xl p-4 mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-teal-400" />
                        <h4 className="text-xs font-bold text-slate-200">Порада Експерта</h4>
                      </div>
                      <p className="text-sm italic text-slate-300 leading-relaxed">
                        "{auditResult.expertAdvice}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* Modal Footer Actions */}
        {detailData && (
          <div className="p-5 bg-slate-900 border-t border-slate-800 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                  REAL DATA ONLY | Джерело: Prozorro API | Статус: ВЕРИФІКОВАНО
                </span>
              </div>
              <span className="text-[10px] text-slate-500 italic">
                AI рекомендує, але юридичне рішення приймає користувач.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`https://prozorro.gov.ua/tender/${detailData.tenderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center space-x-1 underline"
              >
                <span>Переглянути на Prozorro.gov.ua</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs cursor-pointer transition-colors border border-slate-700"
                >
                  НЕ БЕРУ
                </button>

                {onOpenWarRoom && (
                  <button
                    onClick={() => {
                      const tenderObj = convertToTenderObject();
                      onOpenWarRoom(tenderObj);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-900/50 text-indigo-300 font-bold text-xs flex items-center gap-1.5 border border-indigo-500/30 cursor-pointer transition-colors"
                  >
                    <span>ПРОДОВЖИТИ АНАЛІЗ</span>
                  </button>
                )}

                {onOpenWarRoom && (
                  <button
                    onClick={() => {
                      const tenderObj = convertToTenderObject();
                      tenderObj.status = 'BID_IN_PREPARATION';
                      onOpenWarRoom(tenderObj);
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer transition-all uppercase tracking-wider"
                  >
                    <span>БЕРУ УЧАСТЬ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
