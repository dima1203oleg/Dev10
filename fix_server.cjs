const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const target1 = `app.post("/api/company/profile", requireAuth, async (req: AuthRequest, res) => {\n`;
const injected = fs.readFileSync('new_endpoint.ts', 'utf-8');

content = content.replace(target1 + injected, injected + '\n' + target1);

fs.writeFileSync('server.ts', content, 'utf-8');
