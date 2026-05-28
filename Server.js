import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Ruta principal para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mango Agent está corriendo' });
});

// Ruta para clasificar manualmente (opcional)
app.post('/clasificar', async (req, res) => {
  const { texto } = req.body;
  
  const registro = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    texto_original: texto,
    estado: 'pendiente_revision'
  };
  
  const { data, error } = await supabase.from('detecciones').insert(registro);
  
  if (error) {
    res.json({ error: error.message });
  } else {
    res.json({ ok: true, id: registro.id });
  }
});

// Ruta que recibe los webhooks de Bright Data
app.post('/webhook/facebook', async (req, res) => {
  const posts = req.body;
  
  // Bright Data puede enviar un array o un objeto
  const postsArray = Array.isArray(posts) ? posts : [posts];
  
  for (const post of postsArray) {
    const registro = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      fuente: 'facebook',
      grupo: post.group_name || post.group_url || 'desconocido',
      texto_original: post.content || post.message || post.text || '',
      categoria: 'pendiente',
      intencion: 'pendiente',
      urgencia: 'media',
      relevancia: 0.5,
      ciudad: 'Desconocida',
      estado: 'pendiente_revision'
    };
    
    if (registro.texto_original) {
      await supabase.from('detecciones').insert(registro);
    }
  }
  
  res.json({ ok: true, recibidos: postsArray.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));