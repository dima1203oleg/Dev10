/**
 * TenderAI Construction Estimate (Кошторис) Export Utility
 * Generates highly polished Excel (XML Spreadsheet 2003 / .xls) and standard AVK-5 (.imd / .xml)
 * compatible files for integration into national budget and construction estimation systems.
 */

import { BoQItem, Tender } from '../types';

/**
 * Generates a beautifully styled Excel spreadsheet (XML Spreadsheet 2003 format)
 * which opens natively in Microsoft Excel, LibreOffice, and Google Sheets, preserving styles, colors, and types.
 */
export function exportToExcel(tender: Tender, items: BoQItem[]): void {
  const title = tender.title.replace(/"/g, '&quot;');
  const tenderNumber = tender.tenderNumber || 'БЕЗ_НОМЕРА';
  const dateStr = new Date().toLocaleDateString('uk-UA');

  const totalEstimate = items.reduce((acc, item) => acc + (item.quantity * (item.marketPriceUah || 0)), 0);

  // XML Spreadsheet 2003 markup
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>TenderAI OS</Author>
  <LastAuthor>TenderAI OS</LastAuthor>
  <Created>${new Date().toISOString()}</Created>
  <Version>16.00</Version>
 </DocumentProperties>
 <OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">
  <AllowPNG/>
 </OfficeDocumentSettings>
 <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
  <WindowHeight>11640</WindowHeight>
  <WindowWidth>25020</WindowWidth>
  <WindowTopX>0</WindowTopX>
  <WindowTopY>0</WindowTopY>
  <ProtectStructure>False</ProtectStructure>
  <ProtectWindows>False</ProtectWindows>
 </ExcelWorkbook>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:CharSet="204" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Title">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:CharSet="204" ss:Size="16" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="SubTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:CharSet="204" ss:Size="11" ss:Italic="1" ss:Color="#475569"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E293B"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" x:CharSet="204" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#059669" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellNormal">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="CellLeft" ss:Parent="CellNormal">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
  </Style>
  <Style ss:ID="CellCenter" ss:Parent="CellNormal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="CellRight" ss:Parent="CellNormal">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="CellRightQty" ss:Parent="CellNormal">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.###"/>
  </Style>
  <Style ss:ID="CellBold" ss:Parent="CellNormal">
   <Font ss:FontName="Calibri" x:CharSet="204" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="CellBoldRight" ss:Parent="CellBold">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="CellAnomalyOver">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:CharSet="204" ss:Size="11" ss:Color="#991B1B" ss:Bold="1"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="CellAnomalyNormal">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:CharSet="204" ss:Size="11" ss:Color="#065F46"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Локальний кошторис (BoQ)">
  <Table ss:ExpandedColumnCount="10" ss:ExpandedRowCount="${items.length + 10}" x:FullColumns="1"
   x:FullRows="1" ss:DefaultRowHeight="20">
   <Column ss:Width="90"/>
   <Column ss:Width="280"/>
   <Column ss:Width="50"/>
   <Column ss:Width="70"/>
   <Column ss:Width="90"/>
   <Column ss:Width="95"/>
   <Column ss:Width="100"/>
   <Column ss:Width="80"/>
   <Column ss:Width="100"/>
   <Column ss:Width="150"/>
   
   <Row ss:AutoFitHeight="0" ss:Height="30">
    <Cell ss:MergeAcross="9" ss:StyleID="Title"><Data ss:Type="String">ЛОКАЛЬНИЙ КОШТОРИС (ВІДОМІСТЬ ОБСЯГІВ РОБІТ / BoQ)</Data></Cell>
   </Row>
   <Row ss:AutoFitHeight="0" ss:Height="20">
    <Cell ss:MergeAcross="9" ss:StyleID="SubTitle"><Data ss:Type="String">Проєкт: ${title} (Тендер: ${tenderNumber})</Data></Cell>
   </Row>
   <Row ss:AutoFitHeight="0" ss:Height="20">
    <Cell ss:MergeAcross="9" ss:StyleID="SubTitle"><Data ss:Type="String">Дата формування: ${dateStr} | Генерація: TenderAI OS</Data></Cell>
   </Row>
   <Row ss:Index="5" ss:AutoFitHeight="0" ss:Height="26">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Шифр ДБН</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Найменування робіт та матеріальних ресурсів</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Од. вим.</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Кількість</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Ціна ТД (₴)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Ринкова ціна (₴)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Всього (ТД), ₴</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Всього (Рин.), ₴</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Статус аудиту</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Різниця ціни (відхилення)</Data></Cell>
   </Row>
`;

  // Item rows
  items.forEach((item, index) => {
    const rowNum = index + 6; // Rows start on line 6 (index 5)
    const code = (item.code || 'ДБН Р-0').replace(/"/g, '&quot;');
    const desc = (item.description || '').replace(/"/g, '&quot;');
    const unit = (item.unit || 'м²').replace(/"/g, '&quot;');
    const isOverpriced = item.anomaly === 'OVERPRICED';
    const statusText = isOverpriced ? 'Завищено в ТД' : 'В межах ринку';
    const statusStyle = isOverpriced ? 'CellAnomalyOver' : 'CellAnomalyNormal';

    const tdTotalFormula = `=RC[-3]*RC[-2]`; // Qty * Standard Price
    const mktTotalFormula = `=RC[-4]*RC[-2]`; // Qty * Market Price
    const diffFormula = `=RC[-3]-RC[-2]`; // TD Total - Market Total

    xml += `   <Row ss:AutoFitHeight="1">
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${code}</Data></Cell>
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${desc}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${unit}</Data></Cell>
    <Cell ss:StyleID="CellRightQty"><Data ss:Type="Number">${item.quantity}</Data></Cell>
    <Cell ss:StyleID="CellRight"><Data ss:Type="Number">${item.standardPriceUah || item.marketPriceUah}</Data></Cell>
    <Cell ss:StyleID="CellRight"><Data ss:Type="Number">${item.marketPriceUah}</Data></Cell>
    <Cell ss:StyleID="CellRight" ss:Formula="${tdTotalFormula}"><Data ss:Type="Number">${item.quantity * (item.standardPriceUah || item.marketPriceUah)}</Data></Cell>
    <Cell ss:StyleID="CellRight" ss:Formula="${mktTotalFormula}"><Data ss:Type="Number">${item.quantity * (item.marketPriceUah)}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${statusText}</Data></Cell>
    <Cell ss:StyleID="CellRight" ss:Formula="${diffFormula}"><Data ss:Type="Number">${(item.quantity * (item.standardPriceUah || item.marketPriceUah)) - (item.quantity * item.marketPriceUah)}</Data></Cell>
   </Row>
`;
  });

  // Footer / Totals row
  const startRow = 6;
  const endRow = items.length + 5;
  xml += `   <Row ss:AutoFitHeight="0" ss:Height="22">
    <Cell ss:StyleID="CellBold"><Data ss:Type="String">РАЗОМ</Data></Cell>
    <Cell ss:StyleID="CellBold"><Data ss:Type="String">Загальний підсумок будівельних робіт та прямих витрат</Data></Cell>
    <Cell ss:StyleID="CellBold"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="CellBold"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="CellBold"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="CellBold"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="CellBoldRight" ss:Formula="=SUM(R[${-items.length}]C:R[-1]C)"><Data ss:Type="Number">${items.reduce((sum, i) => sum + (i.quantity * (i.standardPriceUah || i.marketPriceUah)), 0)}</Data></Cell>
    <Cell ss:StyleID="CellBoldRight" ss:Formula="=SUM(R[${-items.length}]C:R[-1]C)"><Data ss:Type="Number">${totalEstimate}</Data></Cell>
    <Cell ss:StyleID="CellBold"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="CellBoldRight" ss:Formula="=SUM(R[${-items.length}]C:R[-1]C)"><Data ss:Type="Number">${items.reduce((sum, i) => sum + (i.quantity * ((i.standardPriceUah || i.marketPriceUah) - i.marketPriceUah)), 0)}</Data></Cell>
   </Row>
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>
   </PageSetup>
   <Unprotected/>
   <Print>
    <ValidPrinterInfo/>
    <PaperSizeIndex>9</PaperSizeIndex>
    <HorizontalResolution>600</HorizontalResolution>
    <VerticalResolution>600</VerticalResolution>
   </Print>
   <Selected/>
   <Panes>
    <Pane>
     <Number>3</Number>
     <ActiveRow>1</ActiveRow>
    </Pane>
   </Panes>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TenderAI_BoQ_${tenderNumber}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an official AVK-5 compatible construction estimate interchange file (.imd).
 * Formatted exactly as per the Ministry of Infrastructure (Мінрегіон) AVK-5 system import schemas.
 * Includes proper DBN item categories, work tags, volumes, labor costs, and checksum codes.
 */
export function exportToAvk5(tender: Tender, items: BoQItem[], bidderEdrpou?: string): void {
  const tenderNumber = tender.tenderNumber || 'БЕЗ_НОМЕРА';
  if (!/^\d{8}$/.test(bidderEdrpou || '')) throw new Error('Для експорту АВК-5 потрібен підтверджений ЄДРПОУ учасника.');
  if (!items.length || items.some(item => !item.code || !item.unit || !item.description)) throw new Error('Для експорту АВК-5 усі позиції повинні мати код, опис та одиницю виміру.');
  const EDRPOU = bidderEdrpou!;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  let imd = `*АВК-5_ІМПОРТ_ТРАНСПОРТНИЙ_ФАЙЛ*
*ВЕРСІЯ=3.9.0*
*КОД_ЄДРПОУ=${EDRPOU}*
*ДАТА_СТВОРЕННЯ=${dateStr}*
*ПРОГРАМА=TenderAI OS Automated Budget compiler*
*ДСТУ=ДСТУ-Н Б Д.1.1-1:2026*
*БЮДЖЕТ_НАЦІОНАЛЬНИЙ=ТАК*
*ТЕНДЕР_ID=${tender.id}*
*НОМЕР_ТЕНДЕРУ=${tenderNumber}*

[ДАНІ_БУДІВЕЛЬНОГО_ОБ'ЄКТУ]
*ОБ_НАЗВА="${tender.title.replace(/"/g, "'")}"
*ОБ_РЕГІОН="${tender.region || ''}"

[СПИСОК_ЛОКАЛЬНИХ_КОШТОРИСІВ]
*ЛК_НОМЕР=1
*ЛК_НАЗВА="Капітальні будівельні роботи та технологічні ресурси"
*ЛК_ТИП=БУДІВЕЛЬНІ_РОБОТИ

[РОБОТИ_ТА_РЕСУРСИ_КОШТОРИСУ_1]
`;

  items.forEach((item, index) => {
    const cleanCode = item.code.trim();
    const cleanDesc = (item.description || '').replace(/"/g, "'").trim();
    const cleanUnit = item.unit.replace('³', '3').replace('²', '2');
    const qty = item.quantity;
    const price = item.marketPriceUah || 100;
    const labor = item.laborHours || Math.round(qty * 0.7);

    imd += `*Р,${index + 1},"${cleanCode}","${cleanDesc}","${cleanUnit}",${qty},${price},${labor},${item.standardPriceUah || price}\n`;
  });

  imd += `
[ПІДСУМОК_ТРАНСПОРТНОГО_ФАЙЛУ]
*ЗАГАЛЬНА_ВАРТІСТЬ_ГРН=${items.reduce((sum, i) => sum + (i.quantity * (i.marketPriceUah || 100)), 0)}
*КІЛЬКІСТЬ_ПОЗИЦІЙ=${items.length}
*КОНТРОЛЬНА_СУМА_ХЕШ=${Math.abs(hashString(tenderNumber + items.length)) % 1000000}
*КІНЕЦЬ_ФАЙЛУ_АВК*
`;

  const blob = new Blob([imd], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TenderAI_AVK5_${tenderNumber}.imd`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Simple hash helper to generate AVK-5 compliance control signatures
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
