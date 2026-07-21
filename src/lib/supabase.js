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
// Helper to fetch all invitations from Supabase
export async function getInvitationsFromSupabase() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('convites')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        // Map database fields (if snake_case) to app format
        const formatted = data.map(item => ({
          id: item.id,
          nomes: item.nomes,
          nomesCurto: item.nomes_curto || item.nomesCurto || item.nomes,
          video: item.video,
          mensagem: item.mensagem
        }));
        return { success: true, data: formatted };
      }
    } catch (err) {
      console.warn('Tabela convites não encontrada ou erro no Supabase:', err);
    }
  }
  return { success: false, data: null };
}

// Helper to save or update an invitation in Supabase
export async function saveInvitationToSupabase(invitation) {
  if (supabase) {
    try {
      const payload = {
        id: invitation.id,
        nomes: invitation.nomes,
        nomes_curto: invitation.nomesCurto || invitation.nomes,
        video: invitation.video,
        mensagem: invitation.mensagem
      };

      const { data, error } = await supabase
        .from('convites')
        .upsert([payload], { onConflict: 'id' });

      if (error) {
        console.error('Erro ao salvar convite no Supabase:', error);
      } else {
        return { success: true, data };
      }
    } catch (err) {
      console.warn('Erro ao salvar no Supabase:', err);
    }
  }
  return { success: false };
}

// Helper to delete an invitation from Supabase
export async function deleteInvitationFromSupabase(id) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('convites')
        .delete()
        .eq('id', id);

      if (!error) {
        return { success: true };
      }
    } catch (err) {
      console.warn('Erro ao excluir do Supabase:', err);
    }
  }
  return { success: false };
}
