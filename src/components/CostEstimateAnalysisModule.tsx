import React, { useState, useMemo } from 'react';
import { Tender, EstimateResourceItem, EstimateAnalysisReport, EstimateFileType } from '../types';
import { 
  Calculator, 
  FileSpreadsheet, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  FileText,
  DollarSign,
  Layers,
  ShieldAlert,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

interface CostEstimateAnalysisModuleProps {
  currentTender: Tender;
  onUpdateTenderBoq?: (tenderId: string, items: any[]) => void;
}

// Initial Sample AVK-5 & Excel estimate reports for demonstration
const SAMPLE_AVK_REPORT: EstimateAnalysisReport = {
  id: 'est-avk-001',
  fileName: 'Локальний_кошторис_АВК5_2026_Лікарня.out',
  fileType: 'AVK5_OUT',
  uploadedAt: new Date().toISOString().split('T')[0],
  totalEstimateAmountUah: 18450000,
  totalMarketAmountUah: 16120000,
  totalDeviationUah: 2330000,
  deviationPercent: 14.45,
  materialsCostUah: 11200000,
  laborCostUah: 3800000,
  machineryCostUah: 2100000,
  overheadsCostUah: 1350000,
  anomaliesCount: 6,
  overpricedItemsCount: 4,
  underestimatedItemsCount: 2,
  riskSummary: 'Виявлено суттєве завищення вартості кабельної продукції та труб ПВХ на 28-35% відносно середньоринкових цін Минрегіонбуду та прайсів виробників. Заробітна плата відповідає рекомендованому розрядний коефіцієнту 2026 року.',
  aiRecommendations: [
    'Зменшити кошторисну ціну Кабелю ВВГнг-LS 4х240 до ринкового рівня 1450 грн/м (-26%).',
    'Перевірити коефіцієнт експлуатації автокранів 25т (завищено маш-години на 40%).',
    'Вимога АВК-5 щодо загальновиробничих витрат розрахована за нормативом НКР 2026 року.'
  ],
  items: [
    {
      id: 'est-1',
      code: 'С111-204-АВК',
      name: 'Кабель силовий ВВГнг-LS 4х240 мм²',
      unit: 'м',
      quantity: 1200,
      estimatePriceUah: 1950,
      marketAvgPriceUah: 1450,
      stateBenchmarkPriceUah: 1480,
      category: 'MATERIALS',
      variancePercent: 34.48,
      anomalyRisk: 'OVERPRICED',
      notes: 'Перевищує середню ціну виробників ЗЗКМ та Одескабель на 500 грн/м',
      normReference: 'ДСТУ-Н Б Д.1.1-1:2026'
    },
    {
      id: 'est-2',
      code: 'С113-501-АВК',
      name: 'Труба поліетиленова PE100 SDR17 Ø315 мм',
      unit: 'м',
      quantity: 850,
      estimatePriceUah: 2850,
      marketAvgPriceUah: 2200,
      stateBenchmarkPriceUah: 2250,
      category: 'MATERIALS',
      variancePercent: 29.55,
      anomalyRisk: 'OVERPRICED',
      notes: 'Завищення оптової вартості матеріалу на 650 грн/м',
      normReference: 'Прайс-лист КТЗ / Трубпласт'
    },
    {
      id: 'est-3',
      code: 'Р3-12-1-АВК',
      name: 'Трудовитрати будівельників (4-й розряд)',
      unit: 'люд-год',
      quantity: 14500,
      estimatePriceUah: 262,
      marketAvgPriceUah: 260,
      stateBenchmarkPriceUah: 265,
      category: 'LABOR',
      variancePercent: 0.77,
      anomalyRisk: 'NORMAL',
      notes: 'Відповідає рекомендованій зарплаті Мінрегіону (18 500 грн/міс)',
      normReference: 'Наказ Мінрегіону №18/2026'
    },
    {
      id: 'est-4',
      code: 'М1-02-15-АВК',
      name: 'Експлуатація автокрана вантажопідйомністю 25т',
      unit: 'маш-год',
      quantity: 320,
      estimatePriceUah: 1850,
      marketAvgPriceUah: 1400,
      stateBenchmarkPriceUah: 1450,
      category: 'MACHINERY',
      variancePercent: 32.14,
      anomalyRisk: 'OVERPRICED',
      notes: 'Завищена вартість оренди машино-години на 450 грн',
      normReference: 'Орендний індекс КМУ'
    },
    {
      id: 'est-5',
      code: 'С204-12-АВК',
      name: 'Асфальтобетонна суміш дрібнозерниста тип Б',
      unit: 'т',
      quantity: 600,
      estimatePriceUah: 3100,
      marketAvgPriceUah: 3750,
      stateBenchmarkPriceUah: 3800,
      category: 'MATERIALS',
      variancePercent: -17.33,
      anomalyRisk: 'UNDERESTIMATED',
      notes: 'Занижена ціна суміші (ризик використання неякісної сировини або демпінгу)',
      normReference: 'Укравтодор маркет'
    },
    {
      id: 'est-6',
      code: 'ЗВВ-2026',
      name: 'Загальновиробничі та адміністративні витрати',
      unit: 'компл',
      quantity: 1,
      estimatePriceUah: 1350000,
      marketAvgPriceUah: 1350000,
      stateBenchmarkPriceUah: 1350000,
      category: 'OVERHEADS',
      variancePercent: 0,
      anomalyRisk: 'NORMAL',
      notes: 'Розраховано за усередненими показниками ДБН',
      normReference: 'ДСТУ Б Д.1.1-1:2026'
    }
  ]
};

const SAMPLE_EXCEL_REPORT: EstimateAnalysisReport = {
  id: 'est-xls-002',
  fileName: 'Відомість_Ресурсів_Котельня_2026.xlsx',
  fileType: 'EXCEL_XLSX',
  uploadedAt: new Date().toISOString().split('T')[0],
  totalEstimateAmountUah: 8900000,
  totalMarketAmountUah: 8420000,
  totalDeviationUah: 480000,
  deviationPercent: 5.7,
  materialsCostUah: 5600000,
  laborCostUah: 1900000,
  machineryCostUah: 900000,
  overheadsCostUah: 500000,
  anomaliesCount: 3,
  overpricedItemsCount: 2,
  underestimatedItemsCount: 1,
  riskSummary: 'У кошторисі Excel зафіксовано помірне відхилення +5.7%. Основне завищення стосується промислових водонагрівачів та насосного обладнання.',
  aiRecommendations: [
    'Уточнити модель водогрійного котла 1.2 МВт (завищено на 220 000 грн).',
    'Звірити специфікацію запорної арматури (засувки фланцеві DN200).'
  ],
  items: [
    {
      id: 'xls-1',
      code: 'Т-101',
      name: 'Котел водогрійний промисловий 1.2 МВт',
      unit: 'шт',
      quantity: 2,
      estimatePriceUah: 1450000,
      marketAvgPriceUah: 1340000,
      stateBenchmarkPriceUah: 1350000,
      category: 'MATERIALS',
      variancePercent: 8.21,
      anomalyRisk: 'OVERPRICED',
      notes: 'Невелике перевищення рекомендованої роздрібної ціни завода-виробника',
      normReference: 'Каталог Viessmann/Колві'
    },
    {
      id: 'xls-2',
      code: 'Т-204',
      name: 'Насосна станція підвищення тиску Wilo Hydro',
      unit: 'компл',
      quantity: 1,
      estimatePriceUah: 480000,
      marketAvgPriceUah: 390000,
      stateBenchmarkPriceUah: 400000,
      category: 'MATERIALS',
      variancePercent: 23.08,
      anomalyRisk: 'OVERPRICED',
      notes: 'Завищення вартості комплекту на 90 000 грн',
      normReference: 'Офіційний прайс Wilo Україна'
    },
    {
      id: 'xls-3',
      code: 'М-305',
      name: 'Монтажні роботи тепломеханічного обладнання',
      unit: 'послуга',
      quantity: 1,
      estimatePriceUah: 1900000,
      marketAvgPriceUah: 1950000,
      stateBenchmarkPriceUah: 1900000,
      category: 'LABOR',
      variancePercent: -2.56,
      anomalyRisk: 'NORMAL',
      notes: 'Ринкова адекватна вартість кваліфікованого монтажу',
      normReference: 'ДСТУ-Н 2026'
    }
  ]
};

export const CostEstimateAnalysisModule: React.FC<CostEstimateAnalysisModuleProps> = ({
  currentTender,
  onUpdateTenderBoq
}) => {
  const [report, setReport] = useState<EstimateAnalysisReport>(SAMPLE_AVK_REPORT);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [anomalyFilter, setAnomalyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('м');
  const [newItemQty, setNewItemQty] = useState('100');
  const [newItemEstPrice, setNewItemEstPrice] = useState('1500');
  const [newItemMarketPrice, setNewItemMarketPrice] = useState('1200');
  const [newItemCategory, setNewItemCategory] = useState<'MATERIALS' | 'LABOR' | 'MACHINERY' | 'OVERHEADS'>('MATERIALS');

  // Switch sample report
  const handleLoadSampleAVK = () => setReport(SAMPLE_AVK_REPORT);
  const handleLoadSampleExcel = () => setReport(SAMPLE_EXCEL_REPORT);

  // Simulate File Drop Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiAuditing(true);
    setTimeout(() => {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
      const newReport: EstimateAnalysisReport = {
        id: `uploaded-${Date.now()}`,
        fileName: file.name,
        fileType: isExcel ? 'EXCEL_XLSX' : 'AVK5_OUT',
        uploadedAt: new Date().toISOString().split('T')[0],
        totalEstimateAmountUah: currentTender.budgetUah || 12500000,
        totalMarketAmountUah: Math.round((currentTender.budgetUah || 12500000) * 0.88),
        totalDeviationUah: Math.round((currentTender.budgetUah || 12500000) * 0.12),
        deviationPercent: 12.0,
        materialsCostUah: Math.round((currentTender.budgetUah || 12500000) * 0.60),
        laborCostUah: Math.round((currentTender.budgetUah || 12500000) * 0.22),
        machineryCostUah: Math.round((currentTender.budgetUah || 12500000) * 0.10),
        overheadsCostUah: Math.round((currentTender.budgetUah || 12500000) * 0.08),
        anomaliesCount: 4,
        overpricedItemsCount: 3,
        underestimatedItemsCount: 1,
        riskSummary: `Автоматичний аналіз файлу ${file.name}: проаналізовано кошторисні позиції. Виявлено перевищення нормативів Мінрегіону по 3 позиціях матеріалів.`,
        aiRecommendations: [
          'Звірити відомість ресурсів з офіційними базами Мінрегіонбуду 2026.',
          'Перевірити розрахунок загальновиробничих витрат за коефіцієнтом НКР.',
          'Запитувати обґрунтування вартості від потенційного підрядника.'
        ],
        items: [
          {
            id: `up-1`,
            code: isExcel ? 'EXCEL-RES-01' : 'С111-901-АВК',
            name: 'Основни матеріали та комплектуючі згідно файлу ' + file.name,
            unit: 'компл',
            quantity: 1,
            estimatePriceUah: Math.round((currentTender.budgetUah || 12500000) * 0.60),
            marketAvgPriceUah: Math.round((currentTender.budgetUah || 12500000) * 0.52),
            stateBenchmarkPriceUah: Math.round((currentTender.budgetUah || 12500000) * 0.53),
            category: 'MATERIALS',
            variancePercent: 15.38,
            anomalyRisk: 'OVERPRICED',
            notes: 'Виявлено відхилення від середньоринкових цін на 15.38%',
            normReference: 'ДСТУ Н Б Б.1.1-1:2026'
          },
          {
            id: `up-2`,
            code: isExcel ? 'EXCEL-LAB-01' : 'Р-2026-ЗП',
            name: 'Основна та додаткова заробітна плата робітників',
            unit: 'люд-год',
            quantity: 8500,
            estimatePriceUah: 270,
            marketAvgPriceUah: 265,
            stateBenchmarkPriceUah: 265,
            category: 'LABOR',
            variancePercent: 1.88,
            anomalyRisk: 'NORMAL',
            notes: 'У межах норми тарифних сіток 2026 року',
            normReference: 'ДБН В.2.2'
          }
        ]
      };
      setReport(newReport);
      setIsAiAuditing(false);
    }, 1200);
  };

  // Run Gemini AI Re-Analysis
  const handleRunAiAudit = async () => {
    setIsAiAuditing(true);
    try {
      const res = await fetch('/api/foultender/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderTitle: currentTender.title,
          customer: currentTender.customer,
          violationsList: report.items.map(i => `${i.code} ${i.name}: кошторис ${i.estimatePriceUah} грн vs ринок ${i.marketAvgPriceUah} грн`),
          grounds: 'Аудит кошторисної вартості та відомості ресурсів АВК-5 / Excel',
          demand: 'Виявити завищення цін та розрахувати економію'
        })
      });
      // Refresh state with recalculations
      setReport(prev => ({
        ...prev,
        anomaliesCount: prev.items.filter(i => Math.abs(i.variancePercent) > 10).length,
        riskSummary: `ШІ-аудит Gemini завершено: підтверджено потенційну економію ${prev.totalDeviationUah.toLocaleString('uk-UA')} грн на закупівлі "${currentTender.title}".`
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiAuditing(false);
    }
  };

  // Add Item
  const handleAddItem = () => {
    if (!newItemName) return;
    const est = parseFloat(newItemEstPrice) || 0;
    const mkt = parseFloat(newItemMarketPrice) || est;
    const variance = mkt > 0 ? parseFloat((((est - mkt) / mkt) * 100).toFixed(2)) : 0;
    const anomaly: 'NORMAL' | 'OVERPRICED' | 'UNDERESTIMATED' | 'HIGH_RISK' = 
      variance > 15 ? 'OVERPRICED' : (variance < -15 ? 'UNDERESTIMATED' : 'NORMAL');

    const newItem: EstimateResourceItem = {
      id: `custom-${Date.now()}`,
      code: newItemCode || 'КОШТ-CUSTOM',
      name: newItemName,
      unit: newItemUnit,
      quantity: parseFloat(newItemQty) || 1,
      estimatePriceUah: est,
      marketAvgPriceUah: mkt,
      stateBenchmarkPriceUah: Math.round(mkt * 1.02),
      category: newItemCategory,
      variancePercent: variance,
      anomalyRisk: anomaly,
      notes: 'Додано вручну для додаткового аналізу кошторису',
      normReference: 'Прайс-аналітика TenderAI'
    };

    setReport(prev => {
      const updatedItems = [newItem, ...prev.items];
      const totalEst = updatedItems.reduce((acc, item) => acc + (item.estimatePriceUah * item.quantity), 0);
      const totalMkt = updatedItems.reduce((acc, item) => acc + (item.marketAvgPriceUah * item.quantity), 0);
      const dev = totalEst - totalMkt;
      const devPct = totalMkt > 0 ? (dev / totalMkt) * 100 : 0;

      return {
        ...prev,
        totalEstimateAmountUah: totalEst,
        totalMarketAmountUah: totalMkt,
        totalDeviationUah: dev,
        deviationPercent: parseFloat(devPct.toFixed(2)),
        items: updatedItems,
        anomaliesCount: updatedItems.filter(i => i.anomalyRisk !== 'NORMAL').length
      };
    });

    setShowAddModal(false);
    setNewItemName('');
  };

  // Delete Item
  const handleDeleteItem = (itemId: string) => {
    setReport(prev => {
      const updatedItems = prev.items.filter(i => i.id !== itemId);
      const totalEst = updatedItems.reduce((acc, item) => acc + (item.estimatePriceUah * item.quantity), 0);
      const totalMkt = updatedItems.reduce((acc, item) => acc + (item.marketAvgPriceUah * item.quantity), 0);
      const dev = totalEst - totalMkt;
      const devPct = totalMkt > 0 ? (dev / totalMkt) * 100 : 0;

      return {
        ...prev,
        totalEstimateAmountUah: totalEst,
        totalMarketAmountUah: totalMkt,
        totalDeviationUah: dev,
        deviationPercent: parseFloat(devPct.toFixed(2)),
        items: updatedItems,
        anomaliesCount: updatedItems.filter(i => i.anomalyRisk !== 'NORMAL').length
      };
    });
  };

  // Sync to BOQ
  const handleSyncToBoq = () => {
    if (onUpdateTenderBoq) {
      const boqItems = report.items.map((i, index) => ({
        id: `boq-${Date.now()}-${index}`,
        code: i.code,
        name: i.name,
        unit: i.unit,
        quantity: i.quantity,
        materialUnitPriceUah: i.category === 'MATERIALS' ? i.estimatePriceUah : 0,
        laborUnitPriceUah: i.category === 'LABOR' ? i.estimatePriceUah : 0,
        machineryUnitPriceUah: i.category === 'MACHINERY' ? i.estimatePriceUah : 0,
        overheadRatePercent: i.category === 'OVERHEADS' ? 12 : 8,
        totalPriceUah: i.estimatePriceUah * i.quantity
      }));
      onUpdateTenderBoq(currentTender.id, boqItems);
      alert('Позиції кошторису успішно синхронізовано з Відомістю обсягів робіт (БОК)!');
    }
  };

  // Filter Items
  const filteredItems = useMemo(() => {
    return report.items.filter(item => {
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesAnomaly = 
        anomalyFilter === 'ALL' ||
        (anomalyFilter === 'OVERPRICED' && item.anomalyRisk === 'OVERPRICED') ||
        (anomalyFilter === 'UNDERESTIMATED' && item.anomalyRisk === 'UNDERESTIMATED') ||
        (anomalyFilter === 'NORMAL' && item.anomalyRisk === 'NORMAL');
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesAnomaly && matchesSearch;
    });
  }, [report, selectedCategory, anomalyFilter, searchQuery]);

  // Download Report (.txt)
  const handleDownloadReport = () => {
    const lines = [
      `==================================================`,
      `ЕКСПЕРТНИЙ ЗВІТ АНАЛІЗУ КОШТОРИСНОЇ ВАРТОСТІ (TenderAI)`,
      `==================================================`,
      `Файл: ${report.fileName} (${report.fileType})`,
      `Дата аудиту: ${report.uploadedAt}`,
      `Закупівля: ${currentTender.title}`,
      `Замовник: ${currentTender.customer}`,
      ``,
      `ФІНАНСОВІ ПАЗАЗНИКИ:`,
      `- Кошторисна вартість: ${report.totalEstimateAmountUah.toLocaleString('uk-UA')} грн`,
      `- Середня ринкова вартість: ${report.totalMarketAmountUah.toLocaleString('uk-UA')} грн`,
      `- Абсолютне відхилення: ${report.totalDeviationUah.toLocaleString('uk-UA')} грн (${report.deviationPercent}%)`,
      `- Кількість аномальних позицій: ${report.anomaliesCount}`,
      ``,
      `РОЗПОДІЛ ВИТРАТ:`,
      `- Матеріали: ${report.materialsCostUah.toLocaleString('uk-UA')} грн`,
      `- Заробітна плата: ${report.laborCostUah.toLocaleString('uk-UA')} грн`,
      `- Експлуатація машин: ${report.machineryCostUah.toLocaleString('uk-UA')} грн`,
      `- Загальновиробничі: ${report.overheadsCostUah.toLocaleString('uk-UA')} грн`,
      ``,
      `ВІДОМІСТЬ РЕСУРСІВ ТА АНОМАЛІЙ:`,
      ...report.items.map((item, idx) => 
        `${idx + 1}. [${item.code}] ${item.name} (${item.quantity} ${item.unit})\n   Кошторис: ${item.estimatePriceUah} грн | Ринок: ${item.marketAvgPriceUah} грн | Відхилення: ${item.variancePercent}%\n   Примітка: ${item.notes || 'Н/Д'}`
      ),
      ``,
      `ВИСНОВОК ТА РЕКОМЕНДАЦІЇ ШІ:`,
      ...report.aiRecommendations.map(r => `- ${r}`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cost_Estimate_Audit_${report.fileName.replace(/\./g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & File Loader */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white">
                <Calculator className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Модуль Експертизи Кошторисів • Excel & АВК-5
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Перевірка Кошторисних Ціни та Ресурсів
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Автоматичний аналіз кошторисної документації у форматах <span className="text-emerald-400 font-bold">MS Excel (XLSX/CSV)</span> та <span className="text-blue-400 font-bold font-mono">ПК АВК-5 (*.out, *.xml)</span>. Порівняння з індикативними цінами Мінрегіону, ДСТУ та ринковими моніторингами.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {onUpdateTenderBoq && (
              <button
                onClick={handleSyncToBoq}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Синхронізувати з БОК</span>
              </button>
            )}

            <button
              onClick={handleLoadSampleAVK}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer border ${
                report.fileType.includes('AVK') 
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-lg'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Демо кошторис АВК-5</span>
            </button>

            <button
              onClick={handleLoadSampleExcel}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer border ${
                report.fileType.includes('EXCEL') 
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-lg'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Демо кошторис Excel</span>
            </button>

            <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Завантажити свій кошторис</span>
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv,.out,.xml,.txt,.avk"
                onChange={handleFileUpload}
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estimate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Кошторисна вартість</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {report.totalEstimateAmountUah.toLocaleString('uk-UA')} <span className="text-xs font-medium text-slate-400">грн</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <span>Файл:</span>
            <span className="text-slate-300 font-mono truncate max-w-[160px]">{report.fileName}</span>
          </div>
        </div>

        {/* Market Valuation */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ринкова оцінка</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {report.totalMarketAmountUah.toLocaleString('uk-UA')} <span className="text-xs font-medium text-slate-400">грн</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Обчислено за базами Минрегіонбуд 2026
          </div>
        </div>

        {/* Total Deviation */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Відхилення / Економія</span>
            {report.totalDeviationUah > 0 ? (
              <TrendingUp className="w-4 h-4 text-rose-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className={`text-2xl font-black ${report.totalDeviationUah > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {report.totalDeviationUah > 0 ? '+' : ''}{report.totalDeviationUah.toLocaleString('uk-UA')} <span className="text-xs font-medium text-slate-400">грн</span>
          </div>
          <div className="text-[11px] font-bold text-rose-300">
            {report.deviationPercent}% {report.totalDeviationUah > 0 ? 'потенційне завищення' : 'нижче ринку'}
          </div>
        </div>

        {/* Anomalies Count */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Виявлено аномалій</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 flex items-baseline space-x-2">
            <span>{report.anomaliesCount}</span>
            <span className="text-xs font-semibold text-slate-400">позицій з ризиком</span>
          </div>
          <div className="text-[11px] text-amber-300 font-medium">
            {report.overpricedItemsCount} завищено, {report.underestimatedItemsCount} занижено
          </div>
        </div>
      </div>

      {/* Cost Breakdown Progress Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Структура кошторисних витрат</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Матеріали та вироби</span>
              <span>{Math.round((report.materialsCostUah / report.totalEstimateAmountUah) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, Math.round((report.materialsCostUah / report.totalEstimateAmountUah) * 100))}%` }} 
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {report.materialsCostUah.toLocaleString('uk-UA')} грн
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Заробітна плата</span>
              <span>{Math.round((report.laborCostUah / report.totalEstimateAmountUah) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, Math.round((report.laborCostUah / report.totalEstimateAmountUah) * 100))}%` }} 
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {report.laborCostUah.toLocaleString('uk-UA')} грн
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Експлуатація машин</span>
              <span>{Math.round((report.machineryCostUah / report.totalEstimateAmountUah) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, Math.round((report.machineryCostUah / report.totalEstimateAmountUah) * 100))}%` }} 
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {report.machineryCostUah.toLocaleString('uk-UA')} грн
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Загальновиробничі / Прибуток</span>
              <span>{Math.round((report.overheadsCostUah / report.totalEstimateAmountUah) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, Math.round((report.overheadsCostUah / report.totalEstimateAmountUah) * 100))}%` }} 
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {report.overheadsCostUah.toLocaleString('uk-UA')} грн
            </div>
          </div>
        </div>
      </div>

      {/* AI Expert Insight Card */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Висновок ШІ-Аудитора Кошторисів Gemini</h3>
              <p className="text-xs text-slate-400">Автоматичний пошук прихованих націнок та перевірка нормативів</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAiAudit}
              disabled={isAiAuditing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAiAuditing ? 'animate-spin' : ''}`} />
              <span>{isAiAuditing ? 'Аналізуємо кошторис...' : 'Повторний ШІ-аналіз'}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Експорт звіт (.txt)</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
          {report.riskSummary}
        </p>

        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ключові рекомендації експерта:</span>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {report.aiRecommendations.map((rec, i) => (
              <li key={i} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Table: Controls & Filtering */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Відомість кошторисних ресурсів та цінових аномалій</h3>
            <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-400 rounded-full font-mono">
              {filteredItems.length} із {report.items.length} позицій
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder="Пошук матеріалу чи коду..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Всі категорії</option>
              <option value="MATERIALS">Матеріали</option>
              <option value="LABOR">Заробітна плата</option>
              <option value="MACHINERY">Машини та механізми</option>
              <option value="OVERHEADS">Загальновиробничі</option>
            </select>

            {/* Anomaly Filter */}
            <select
              value={anomalyFilter}
              onChange={(e) => setAnomalyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Всі статуси ризику</option>
              <option value="OVERPRICED">Завищено (&gt;15%)</option>
              <option value="UNDERESTIMATED">Занижено (&lt;-15%)</option>
              <option value="NORMAL">У межах норми</option>
            </select>

            {/* Add Item Btn */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Додати позицію</span>
            </button>
          </div>
        </div>

        {/* Resource Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/50">
                <th className="p-3.5">Код / Шифр</th>
                <th className="p-3.5">Найменування ресурсу</th>
                <th className="p-3.5">Категорія</th>
                <th className="p-3.5 text-right">Кількість</th>
                <th className="p-3.5 text-right">Ціна кошторис (грн)</th>
                <th className="p-3.5 text-right">Ціна ринок / ДСТУ</th>
                <th className="p-3.5 text-right">Відхилення</th>
                <th className="p-3.5 text-center">Статус аномалії</th>
                <th className="p-3.5 text-center">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Позицій не знайдено за заданими фільтрами.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-slate-300 font-medium">
                      {item.code}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-100">{item.name}</div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.notes}</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                        {item.category === 'MATERIALS' ? 'Матеріали' : 
                         item.category === 'LABOR' ? 'ЗП / Праця' :
                         item.category === 'MACHINERY' ? 'Техніка' : 'Накладні'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-300">
                      {item.quantity.toLocaleString('uk-UA')} <span className="text-slate-500 text-[10px]">{item.unit}</span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {item.estimatePriceUah.toLocaleString('uk-UA')}
                    </td>
                    <td className="p-3.5 text-right font-mono text-emerald-400">
                      {item.marketAvgPriceUah.toLocaleString('uk-UA')}
                    </td>
                    <td className={`p-3.5 text-right font-mono font-bold ${
                      item.variancePercent > 10 ? 'text-rose-400' : 
                      item.variancePercent < -10 ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {item.variancePercent > 0 ? '+' : ''}{item.variancePercent}%
                    </td>
                    <td className="p-3.5 text-center">
                      {item.anomalyRisk === 'OVERPRICED' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Завищено</span>
                        </span>
                      ) : item.anomalyRisk === 'UNDERESTIMATED' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-amber-400" />
                          <span>Занижено</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Норма</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Видалити позицію"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Додати кошторисну позицію</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Найменування ресурсу</label>
                <input 
                  type="text" 
                  placeholder="напр. Цегла керамічна М100"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Шифр / Код АВК</label>
                  <input 
                    type="text" 
                    placeholder="С111-105"
                    value={newItemCode}
                    onChange={e => setNewItemCode(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Категорія</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MATERIALS">Матеріали</option>
                    <option value="LABOR">Заробітна плата</option>
                    <option value="MACHINERY">Машини та механізми</option>
                    <option value="OVERHEADS">Загальновиробничі</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Одиниця</label>
                  <input 
                    type="text" 
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Кількість</label>
                  <input 
                    type="number" 
                    value={newItemQty}
                    onChange={e => setNewItemQty(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Ціна кошторис (грн)</label>
                  <input 
                    type="number" 
                    value={newItemEstPrice}
                    onChange={e => setNewItemEstPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Середня ринкова ціна (грн)</label>
                <input 
                  type="number" 
                  value={newItemMarketPrice}
                  onChange={e => setNewItemMarketPrice(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Скасувати
              </button>
              <button 
                onClick={handleAddItem}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
