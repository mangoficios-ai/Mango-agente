import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.API_BASE || 'https://api.openai.com/v1',
});

const SYSTEM_PROMPT = `Eres un clasificador de intención laboral para Colombia.
Responde SOLO con un objeto JSON válido. Sin texto adicional.

Formato:
{
  "categoria": "electricidad|plomeria|pintura|jardineria|carpinteria|limpieza|albanileria|aire_acondicionado|otro",
  "intencion": "necesidad_real|consulta|recomendacion|oferta_laboral|spam",
  "urgencia": "alta|media|baja",
  "relevancia": 0.0 a 1.0,
  "ciudad": "ciudad detectada o Desconocida"
}`;

export async function classifyPost(texto) {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: texto },
      ],
    });

    const raw = completion.choices[0].message.content?.trim() || '{}';
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('[classifier] Error:', error.message);
    return {
      categoria: 'otro',
      intencion: 'conversacion_general',
      urgencia: 'baja',
      relevancia: 0.1,
      ciudad: 'Desconocida',
    };
  }
}