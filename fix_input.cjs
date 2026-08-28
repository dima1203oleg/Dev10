const fs = require('fs');
let content = fs.readFileSync('src/components/CompanyProfileModule.tsx', 'utf-8');

const replacement = `
                    <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2">
                      <Plus size={16} /> ДОДАТИ ДОКУМЕНТИ
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleRealUpload} accept="application/pdf,image/*" />
`;

content = content.replace(/<button onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2">\s*<Plus size=\{16\} \/> ДОДАТИ ДОКУМЕНТИ\s*<\/button>/, replacement);

fs.writeFileSync('src/components/CompanyProfileModule.tsx', content, 'utf-8');
