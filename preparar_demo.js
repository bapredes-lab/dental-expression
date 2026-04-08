import fs from 'fs';
import path from 'path';

const origenAntes = 'C:\\Users\\USUARIO\\.gemini\\antigravity\\brain\\536868f9-8da9-48ba-99cc-4aad2f081cd8\\caso_clinico_antes_1775671379099.png';
const origenDespues = 'C:\\Users\\USUARIO\\.gemini\\antigravity\\brain\\536868f9-8da9-48ba-99cc-4aad2f081cd8\\caso_clinico_despues_1775671398762.png';

const destinoAntes = 'C:\\Users\\USUARIO\\Desktop\\caso_clinico_antes.png';
const destinoDespues = 'C:\\Users\\USUARIO\\Desktop\\PROYECTOS\\Dental Expression\\Dental Expression\\public\\caso_clinico_despues.png';

try {
    console.log('Iniciando transferencia de imágenes IA hiper-realistas...');
    
    // Copiar la imagen del Antes directamente al escritorio para facilidad de uso en la demo
    fs.copyFileSync(origenAntes, destinoAntes);
    console.log('✅ [1/2] Imagen ANTES ("caso_clinico_antes.png") puesta en tu ESCRITORIO.');
    
    // Copiar la imagen del Después a la carpeta public de la app para el respaldo offline
    fs.copyFileSync(origenDespues, destinoDespues);
    console.log('✅ [2/2] Imagen DESPUÉS ("caso_clinico_despues.png") insertada en la carpeta PUBLIC de la app.');
    
    console.log('\n🚀 ¡Todo es un éxito! Las imágenes están listas en sus lugares respectivos.');
    console.log('Solo necesitas hacer el push a GitHub y la magia sucederá.');
} catch (error) {
    console.error('❌ Error copiando los archivos:', error.message);
}
