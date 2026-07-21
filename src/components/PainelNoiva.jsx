import React, { useState, useEffect } from 'react';
import { 
  Heart, Mail, CheckCircle2, Eye, Sparkles, RefreshCw, 
  Users, PartyPopper, MessageCircle, Clock, ExternalLink 
} from 'lucide-react';
import { getGodparentMessages } from '../lib/supabase';

export default function PainelNoiva({ invitations, onOpenInvite, getViewCounts }) {
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('mensagens'); // 'mensagens' | 'padrinhos'

  const loadData = async () => {
    setLoading(true);
    const result = await getGodparentMessages();
    if (result.data) {
      setMensagens(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalConvites = invitations.length;
  const viewCounts = getViewCounts();
  const totalViews = Object.values(viewCounts).reduce((acc, curr) => acc + curr, 0);

  // Group unique confirmations by convidado_id or convidado_nome
  const confirmadosSet = new Set(
    mensagens
      .filter(m => m.presenca === 'confirmado')
      .map(m => (m.convidado_id || m.convidado_nome).toLowerCase())
  );

  const totalConfirmados = confirmadosSet.size;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 p-4 sm:p-8 font-sans selection:bg-[#b89579] selection:text-white">
      
      {/* Header da Noiva */}
      <header className="max-w-5xl mx-auto mb-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-amber-100/70 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#f8f3ee] text-[#b89579] rounded-full text-xs font-semibold uppercase tracking-widest mb-3 border border-[#e8ded3]">
              <Heart className="w-3.5 h-3.5 fill-[#b89579]" />
              Área Exclusiva da Noiva 👰✨
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 leading-tight">
              Acompanhamento dos Convites
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Veja em tempo real o carinho, mensagens e confirmações dos seus padrinhos.
            </p>
          </div>

          <button
            onClick={loadData}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#b89579] hover:bg-[#a38065] text-white font-medium rounded-2xl text-xs transition-all shadow-md shadow-[#b89579]/20 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD CARDS / MÉTRICAS DA NOIVA */}
      <section className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* Total Convites */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Convites Criados</span>
            <Users className="w-5 h-5 text-[#b89579]" />
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-gray-900">{totalConvites}</p>
            <p className="text-[11px] text-gray-400 mt-1">Padrinhos cadastrados</p>
          </div>
        </div>

        {/* Presenças Confirmadas */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Confirmados</span>
            <PartyPopper className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-emerald-700">{totalConfirmados}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Casais disseram SIM! 💍</p>
          </div>
        </div>

        {/* Recados Recebidos */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Mensagens</span>
            <Mail className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-rose-600">{mensagens.length}</p>
            <p className="text-[11px] text-rose-500 font-medium mt-1">Recados recebidos</p>
          </div>
        </div>

        {/* Total Visualizações */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Visualizações</span>
            <Eye className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-amber-700">{totalViews}</p>
            <p className="text-[11px] text-amber-600 mt-1">Acessos no convite</p>
          </div>
        </div>

      </section>

      {/* CONTEÚDO PRINCIPAL (MURAL DE MENSAGENS E LISTA DE PADRINHOS) */}
      <main className="max-w-5xl mx-auto space-y-6">
        
        {/* Navegação de Abas */}
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('mensagens')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              activeTab === 'mensagens'
                ? 'bg-[#b89579] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-amber-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Mural de Recados ({mensagens.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('padrinhos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              activeTab === 'padrinhos'
                ? 'bg-[#b89579] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-amber-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Status dos Padrinhos ({invitations.length})</span>
          </button>
        </div>

        {activeTab === 'mensagens' ? (
          /* MURAL DE RECADOS DA NOIVA */
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100/60">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-semibold text-gray-800">
                    Recados dos Padrinhos
                  </h2>
                  <p className="text-xs text-gray-500">
                    Mensagens enviadas diretamente pelos padrinhos ao assistirem o convite.
                  </p>
                </div>
              </div>
            </div>

            {mensagens.length === 0 ? (
              <div className="p-12 text-center text-gray-400 bg-[#fdfbf7] rounded-2xl border border-dashed border-amber-200/70">
                <Mail className="w-12 h-12 mx-auto mb-3 text-amber-200" />
                <p className="font-serif italic text-xl text-gray-700">Nenhum recado recebido ainda</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Assim que seus padrinhos acessarem o convite e enviarem um recado, ele aparecerá aqui com todo o carinho!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mensagens.map((msg, idx) => (
                  <div key={idx} className="p-5 bg-[#fdfbf7] rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between relative group hover:border-amber-300 transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-serif font-bold text-gray-900 text-lg">{msg.convidado_nome}</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Confirmado
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-gray-100 my-2 text-gray-700 text-sm italic relative">
                        <span className="text-[#b89579] font-serif text-2xl leading-none absolute -top-2 left-2">“</span>
                        <p className="pl-3">{msg.mensagem}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-200/50">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(msg.created_at).toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[#b89579] font-serif italic text-xs">Padrinhos 💍</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* LISTA E STATUS DOS PADRINHOS */
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100/60">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-serif font-semibold text-gray-800">
                  Lista e Status de Confirmação
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Acompanhe se cada casal já acessou e respondeu ao convite.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {invitations.map((inv, index) => {
                const isConfirmado = confirmadosSet.has(inv.id.toLowerCase()) || confirmadosSet.has(inv.nomes.toLowerCase());
                const viewsCount = viewCounts[inv.id] || 0;

                return (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl border border-gray-200/80 bg-[#fdfbf7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-amber-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-amber-100 text-[#b89579] font-bold text-sm flex items-center justify-center font-serif">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-serif font-semibold text-base text-gray-900">
                          {inv.nomes}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          #{inv.id} • {viewsCount} {viewsCount === 1 ? 'visualização' : 'visualizações'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                      {isConfirmado ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Presença Confirmada!
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200/60">
                          ⏳ Aguardando Resposta
                        </span>
                      )}

                      <button
                        onClick={() => onOpenInvite(inv.id)}
                        className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                        title="Ver página do convite deste casal"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#b89579]" />
                        <span>Ver Convite</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      <footer className="max-w-5xl mx-auto text-center text-xs text-gray-400 mt-8">
        Painel da Noiva • Casamento Especial 💍
      </footer>
    </div>
  );
}
