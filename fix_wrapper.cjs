const fs = require('fs');
let content = fs.readFileSync('src/components/CompanyProfileModule.tsx', 'utf-8');

content = content.replace(
  /<button onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}/,
  '<> <button onClick={() => fileInputRef.current?.click()}'
);
content = content.replace(
  /<input type="file" ref=\{fileInputRef\} className="hidden" onChange=\{handleRealUpload\} accept="application\/pdf,image\/\*" \/>\s*\)}/,
  '<input type="file" ref={fileInputRef} className="hidden" onChange={handleRealUpload} accept="application/pdf,image/*" /> </>\n                  )}'
);

fs.writeFileSync('src/components/CompanyProfileModule.tsx', content, 'utf-8');
