const fs = require('fs');
let content = fs.readFileSync('src/components/CompanyProfileModule.tsx', 'utf-8');

const replacement = `
  const { token } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const result = reader.result as string;
        const [meta, base64Data] = result.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        setUploadProgress(40); // Read complete

        const res = await fetch('/api/company/upload-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': \`Bearer \${token}\` } : {})
          },
          body: JSON.stringify({
            fileName: file.name,
            mimeType,
            base64Data
          })
        });

        setUploadProgress(80); // Upload and AI processing complete

        const data = await res.json();
        if (data.status === 'ok' && onUpdateCompany) {
            // Update the company profile with the new document
            const newDoc = {
                id: \`doc-\${Date.now()}\`,
                title: data.data.documentName || file.name,
                type: 'PDF',
                category: data.data.category || 'OTHER',
                status: data.data.status === 'VALID' ? 'ACTIVE' : 'EXPIRED',
                uploadDate: new Date().toISOString().split('T')[0],
                verificationStatus: 'VERIFIED',
                aiConfidence: data.data.confidence || 95,
                extractedText: data.data.extractedText || '',
                provenance: data.data.provenance || 'USER_UPLOAD → OCR → AI_EXTRACTION'
            } as any;
            
            onUpdateCompany({
                ...company,
                vaultDocuments: [...(company.vaultDocuments || []), newDoc]
            });
        } else {
            console.error('Upload failed:', data.error);
            alert('Помилка обробки: ' + data.error);
        }
        
        setUploadProgress(100);
        setTimeout(() => setIsUploading(false), 1000);
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setIsUploading(false);
      };
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };
`;

const regex = /const handleSimulatedUpload = \(\) => \{[\s\S]*?return \(/;
content = content.replace(regex, replacement + "\n  return (");
fs.writeFileSync('src/components/CompanyProfileModule.tsx', content, 'utf-8');
