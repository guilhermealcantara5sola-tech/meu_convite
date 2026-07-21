import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper to save message (to Supabase if configured, otherwise to localStorage)
export async function sendGodparentMessage({ convidadoId, convidadoNome, mensagem, presenca }) {
  const payload = {
    convidado_id: convidadoId,
    convidado_nome: convidadoNome,
    mensagem: mensagem,
    presenca: presenca || 'confirmado',
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('mensagens_padrinhos')
        .insert([payload]);

      if (error) {
        console.error('Erro ao enviar para o Supabase:', error);
        throw error;
      }
      return { success: true, mode: 'supabase', data };
    } catch (err) {
      console.warn('Fallback para armazenamento local devido a erro no Supabase:', err);
    }
  }

  // Fallback to localStorage for offline / pre-config testing
  try {
    const existing = JSON.parse(localStorage.getItem('meu_convite_mensagens') || '[]');
    const updated = [payload, ...existing];
    localStorage.setItem('meu_convite_mensagens', JSON.stringify(updated));
    return { success: true, mode: 'local', data: payload };
  } catch (e) {
    console.error('Erro ao salvar localmente:', e);
    return { success: false, error: e };
  }
}

// Helper to fetch all messages (from Supabase or localStorage)
export async function getGodparentMessages() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('mensagens_padrinhos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return { success: true, data };
      }
    } catch (err) {
      console.warn('Erro ao buscar mensagens do Supabase:', err);
    }
  }

  // Fallback to localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('meu_convite_mensagens') || '[]');
    return { success: true, data: existing };
  } catch (e) {
    return { success: false, data: [] };
  }
}
