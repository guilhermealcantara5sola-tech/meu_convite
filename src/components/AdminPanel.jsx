import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Copy, Check, QrCode as QrIcon, Eye, 
  Smartphone, Download, RotateCcw, Video, Heart, 
  CheckCircle2, Sparkles, MessageCircle, Mail, RefreshCw, LayoutGrid, HeartHandshake, ExternalLink
} from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import MobilePreviewModal from './MobilePreviewModal';
import { getGodparentMessages } from '../lib/supabase';

export default function AdminPanel({ 
  invitations, 
  onSaveInvitation, 
  onDeleteInvitation, 
  onResetDefault,
  onOpenInvite
}) {
  const [activeTab, setActiveTab] = useState('convites'); // 'convites' | 'mensagens'
  const [selectedInviteForQr, setSelectedInviteForQr] = useState(null);
  const [selectedInviteForPreview, setSelectedInviteForPreview] = useState(null);
  
  // Messages State (Painel da Noiva)
  const [mensagens, setMensagens] = useState([]);
  const [loadingMensagens, setLoadingMensagens] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [idInput, setIdInput] = useState('');
  const [nomesInput, setNomesInput] = useState('');
  const [nomesCurtoInput, setNomesCurtoInput] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [mensagemInput, setMensagemInput] = useState('');
  
  // Feedback Toast
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedNoivaLink, setCopiedNoivaLink] = useState(false);

  const currentBaseUrl = window.location.origin + window.location.pathname;
  const noivaLink = `${currentBaseUrl}#noiva`;

  const loadMensagens = async () => {
    setLoadingMensagens(true);
    const result = await getGodparentMessages();
    if (result.data) {
      setMensagens(result.data);
    }
    setLoadingMensagens(false);
  };

  useEffect(() => {
    loadMensagens();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNomesChange = (e) => {
    const value = e.target.value;
    setNomesInput(value);
    if (!editingId && !idInput) {
      const autoSlug = generateSlug(value);
      setIdInput(autoSlug || `link${invitations.length + 1}`);
    }
  };

  const handleStartEdit = (inv) => {
    setEditingId(inv.id);
    setIdInput(inv.id);
    setNomesInput(inv.nomes);
    setNomesCurtoInput(inv.nomesCurto || '');
    setVideoInput(inv.video);
    setMensagemInput(inv.mensagem || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIdInput('');
    setNomesInput('');
    setNomesCurtoInput('');
    setVideoInput('');
    setMensagemInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nomesInput.trim() || !videoInput.trim()) {
      alert("Por favor, preencha os nomes dos padrinhos e o link do vídeo.");
      return;
    }

    const cleanId = (idInput.trim() || generateSlug(nomesInput) || `link${Date.now()}`).toLowerCase();

    const newInvite = {
      id: cleanId,
      nomes: nomesInput.trim(),
      nomesCurto: nomesCurtoInput.trim() || nomesInput.trim(),
      video: videoInput.trim(),
      mensagem: mensagemInput.trim() || "Vocês sempre fizeram parte da nossa história e não poderíamos imaginar o nosso grande dia sem vocês ao nosso lado."
    };

    onSaveInvitation(newInvite);
    showToast(editingId ? "Convite atualizado com sucesso!" : "Novo convite criado com sucesso!");
    handleCancelEdit();
  };

  const getFullUrl = (id) => {
    return `${currentBaseUrl}#${id}`;
  };

  const handleCopySingleLink = (id) => {
    const url = getFullUrl(id);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast(`Link para #${id} copiado!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyNoivaLink = () => {
    navigator.clipboard.writeText(noivaLink);
    setCopiedNoivaLink(true);
    showToast("Link do Painel da Noiva copiado para a área de transferência! 👰");
    setTimeout(() => setCopiedNoivaLink(false), 2500);
  };

  const handleCopyAllLinks = () => {
    const listText = invitations
      .map((inv, index) => `${index + 1}. ${inv.nomes}\nLink: ${getFullUrl(inv.id)}\nVídeo: ${inv.video}\n`)
      .join('\n');
    navigator.clipboard.writeText(listText);
    showToast(`Todos os ${invitations.length} links foram copiados!`);
  };

  const handleDownloadTxt = () => {
    const listText = `LISTA DE CONVITES DOS PADRINHOS & QR CODES\n--------------------------------------------\n\n` +
      `LINK PAINEL DA NOIVA: ${noivaLink}\n\n` +
      invitations.map((inv, index) => (
        `CONVITE #${index + 1}: ${inv.nomes}\n` +
        `CÓDIGO: ${inv.id}\n` +
        `LINK INDIVIDUAL: ${getFullUrl(inv.id)}\n` +
        `VÍDEO SUPABASE: ${inv.video}\n` +
        `--------------------------------------------`
      )).join('\n\n');

    const blob = new Blob([listText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Lista-Links-Convites-Padrinhos.txt`;
    link.click();
    showToast("Arquivo TXT com todos os links baixado!");
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-gray-800 p-4 sm:p-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-2 fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-amber-100/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-[#b89579] rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-200/50">
            <Heart className="w-3.5 h-3.5 fill-[#b89579]" />
            Painel de Controle Master (Administrador)
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Gerenciador dos Convites
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre os vídeos do Supabase, gere QR Codes e compartilhe o link com a noiva.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyAllLinks}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-[#b89579] border border-amber-200/70 font-medium rounded-xl text-sm transition-all shadow-sm active:scale-95"
          >
            <Copy className="w-4 h-4" />
            Copiar 10 Links dos Padrinhos
          </button>
          
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl text-sm transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" />
            Exportar TXT
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* CARD DESTACADO PARA COPIAR E MANDAR O LINK DA NOIVA          */}
      {/* ============================================================ */}
      <div className="max-w-6xl mx-auto mb-8 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 text-rose-800">
            <span className="text-2xl">👰</span>
            <h3 className="font-serif font-bold text-lg">Link do Painel da Noiva</h3>
          </div>
          <span className="text-xs bg-rose-200/70 text-rose-800 font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Para a Noiva Acompanhar
          </span>
        </div>

        <p className="text-xs text-rose-700 mb-3">
          Copie este link e envie para a noiva no WhatsApp. Nele ela verá os recados recebidos, confirmações dos padrinhos e contador de acessos:
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            readOnly
            value={noivaLink}
            className="w-full px-4 py-3 bg-white font-mono text-xs sm:text-sm text-gray-800 rounded-xl border border-rose-200 shadow-inner select-all outline-none"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyNoivaLink}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                copiedNoivaLink 
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
              }`}
            >
              {copiedNoivaLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNoivaLink ? 'Link Copiado! ❤️' : 'Copiar Link da Noiva'}</span>
            </button>

            <a
              href={noivaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-medium transition-all shadow-sm"
              title="Testar abrir o Painel da Noiva"
            >
              <ExternalLink className="w-4 h-4 text-[#b89579]" />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-6xl mx-auto mb-6 flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('convites')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'convites'
              ? 'bg-[#b89579] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-amber-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Convites & QR Codes ({invitations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mensagens')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
            activeTab === 'mensagens'
              ? 'bg-[#b89579] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-amber-50'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Caixa de Recados dos Padrinhos ({mensagens.length})</span>
          {mensagens.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 animate-ping"></span>
          )}
        </button>
      </div>

      <main className="max-w-6xl mx-auto space-y-8">
        
        {activeTab === 'convites' ? (
          <>
            {/* Cadastrar / Editar Form Card */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100/60">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#f8f3ee] text-[#b89579] flex items-center justify-center font-bold">
                    {editingId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <h2 className="text-xl font-serif font-semibold text-gray-800">
                    {editingId ? `Editar Convite: ${editingId}` : "Cadastrar Novo Convite"}
                  </h2>
                </div>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs text-gray-500 hover:text-gray-800 underline"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Nomes do Casal / Padrinhos *
                  </label>
                  <input
                    type="text"
                    value={nomesInput}
                    onChange={handleNomesChange}
                    placeholder="Ex: Andressa & Natan"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#b89579] focus:ring-2 focus:ring-[#b89579]/20 outline-none transition-all text-sm"
                    required
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Como vai aparecer em destaque no convite.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Identificador do Link (Slug/Código) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 bg-gray-50 px-3 py-3 rounded-xl border border-gray-200">#</span>
                    <input
                      type="text"
                      value={idInput}
                      onChange={(e) => setIdInput(e.target.value)}
                      placeholder="Ex: link01 ou andressa-natan"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#b89579] focus:ring-2 focus:ring-[#b89579]/20 outline-none transition-all text-sm font-mono"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Código único na URL para identificar este convite.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Link do Vídeo Hospedado no Supabase (.mp4) *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={videoInput}
                      onChange={(e) => setVideoInput(e.target.value)}
                      placeholder="https://...supabase.co/storage/v1/object/public/.../video.mp4"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#b89579] focus:ring-2 focus:ring-[#b89579]/20 outline-none transition-all text-sm font-mono"
                      required
                    />
                    <Video className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Cole aqui o link do vídeo MP4 hospedado no Supabase Storage.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Mensagem Especial Personalizada (Opcional)
                  </label>
                  <textarea
                    value={mensagemInput}
                    onChange={(e) => setMensagemInput(e.target.value)}
                    rows={2}
                    placeholder="Vocês sempre fizeram parte da nossa história..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#b89579] focus:ring-2 focus:ring-[#b89579]/20 outline-none transition-all text-sm"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-5 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-7 py-3 rounded-xl bg-[#b89579] hover:bg-[#a38065] text-white font-medium text-sm transition-all shadow-md shadow-[#b89579]/20 active:scale-95 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {editingId ? "Salvar Alterações" : "Adicionar Convite"}
                  </button>
                </div>
              </form>
            </section>

            {/* Lista de Convites */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-gray-800">
                    Lista de Convites ({invitations.length})
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Clique nos botões para gerar o QR Code, copiar o link ou visualizar o convite pronto.
                  </p>
                </div>

                <button
                  onClick={onResetDefault}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  title="Restaurar lista com os 10 convites padrão"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar 10 Exemplos Padrão
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invitations.map((inv, index) => {
                  const fullUrl = getFullUrl(inv.id);
                  const isCopied = copiedId === inv.id;

                  return (
                    <div
                      key={inv.id}
                      className="p-5 rounded-2xl border border-gray-200/80 bg-[#fdfbf7] hover:border-amber-300/80 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-amber-100 text-[#b89579] font-semibold text-xs flex items-center justify-center">
                              {index + 1}
                            </span>
                            <h3 className="font-serif font-semibold text-lg text-gray-900 leading-tight">
                              {inv.nomes}
                            </h3>
                          </div>
                          
                          <span className="text-[10px] font-mono px-2 py-1 bg-amber-50 text-[#b89579] rounded-md border border-amber-200/60">
                            #{inv.id}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-gray-200/70 my-3 text-xs">
                          <p className="text-gray-400 font-mono text-[11px] truncate mb-1">
                            <span className="text-gray-500 font-semibold">Link:</span> {fullUrl}
                          </p>
                          <p className="text-gray-400 font-mono text-[11px] truncate">
                            <span className="text-gray-500 font-semibold">Vídeo:</span> {inv.video}
                          </p>
                        </div>
                      </div>

                      {/* Actions Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-200/60">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopySingleLink(inv.id)}
                            className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copiado!' : 'Copiar Link'}</span>
                          </button>

                          <button
                            onClick={() => setSelectedInviteForQr(inv)}
                            className="px-3 py-1.5 bg-[#b89579]/10 hover:bg-[#b89579]/20 text-[#b89579] rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
                          >
                            <QrIcon className="w-3.5 h-3.5" />
                            <span>QR Code</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedInviteForPreview(inv)}
                            className="p-1.5 text-gray-500 hover:text-[#b89579] hover:bg-white rounded-lg transition-colors"
                            title="Pré-visualizar no Celular"
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenInvite(inv.id)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                            title="Abrir Página Completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleStartEdit(inv)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-white rounded-lg transition-colors"
                            title="Editar Dados"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {invitations.length > 1 && (
                            <button
                              onClick={() => {
                                if (confirm(`Deseja remover o convite de "${inv.nomes}"?`)) {
                                  onDeleteInvitation(inv.id);
                                  showToast("Convite removido.");
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                              title="Excluir Convite"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          /* TAB DE MENSAGENS DOS PADRINHOS */
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100/60">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-semibold text-gray-800">
                    Mensagens Recebidas dos Padrinhos
                  </h2>
                  <p className="text-xs text-gray-500">
                    Confira todos os recados e confirmações enviadas pelos seus padrinhos na página do convite.
                  </p>
                </div>
              </div>

              <button
                onClick={loadMensagens}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMensagens ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            {mensagens.length === 0 ? (
              <div className="p-12 text-center text-gray-400 bg-[#fdfbf7] rounded-2xl border border-dashed border-gray-200">
                <Mail className="w-12 h-12 mx-auto mb-3 text-amber-200" />
                <p className="font-serif italic text-lg text-gray-600">Nenhuma mensagem recebida ainda</p>
                <p className="text-xs text-gray-400 mt-1">
                  Assim que os padrinhos responderem ao convite na página, os recados aparecerão aqui!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mensagens.map((msg, idx) => (
                  <div key={idx} className="p-5 bg-[#fdfbf7] rounded-2xl border border-amber-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif font-bold text-gray-900 text-lg">{msg.convidado_nome}</span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-full">
                          Confirmou Presença ✨
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm italic bg-white p-3 rounded-xl border border-gray-100 my-2">
                        "{msg.mensagem}"
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        Recebido em: {new Date(msg.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>

      {/* QR Code Download Modal */}
      {selectedInviteForQr && (
        <QRCodeModal
          convite={selectedInviteForQr}
          fullUrl={getFullUrl(selectedInviteForQr.id)}
          onClose={() => setSelectedInviteForQr(null)}
        />
      )}

      {/* Mobile Smartphone Preview Modal */}
      {selectedInviteForPreview && (
        <MobilePreviewModal
          convidado={selectedInviteForPreview}
          onClose={() => setSelectedInviteForPreview(null)}
        />
      )}

    </div>
  );
}
