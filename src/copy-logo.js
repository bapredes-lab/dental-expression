// Script temporal para copiar el logo - ejecutar una vez con node
const fs = require('fs');
const src = 'C:\\Users\\USUARIO\\.gemini\\antigravity\\brain\\e8163e82-c3e6-4c79-a068-a3b796601ed3\\logo_transparent_1775748297369.png';
const dest = 'C:\\Users\\USUARIO\\Desktop\\PROYECTOS\\Dental Expression\\Dental Expression\\public\\logo.png';
fs.copyFileSync(src, dest);
console.log('Logo copiado exitosamente a public/logo.png');
