import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Heart, Play, Sparkles, Settings, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendGodparentMessage } from '../lib/supabase';

export default function ConvitePage({ convidado, onOpenAdmin }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  
  // Message Form State
  const [mensagemTexto, setMensagemTexto] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    // Launch celebratory confetti when invitation page opens
    const timer = setTimeout(() => {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#b89579', '#e5dfd6', '#ffd700', '#f43f5e']
        });
      } catch (e) {}
    }, 600);

    return () => clearTimeout(timer);
  }, [convidado]);

  if (!convidado) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex flex-col items-center justify-center text-[#b89579] p-6 text-center">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-serif italic text-2xl mb-2">Preparando convite especial...</p>
        <p className="text-sm text-gray-500">Aguarde um instante</p>
      </div>
    );
  }

  const isMp4 = convidado.video && (convidado.video.includes('.mp4') || convidado.video.includes('supabase.co'));

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
          console.log("Autoplay blocked", err);
        });
      }
    }
  };

  const handleAceitar = async () => {
    setHasAccepted(true);
    try {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#b89579', '#d4af37', '#ffffff', '#f43f5e']
      });
    } catch (e) {}

    // Send RSVP confirmation to Supabase
    await sendGodparentMessage({
      convidadoId: convidado.id,
      convidadoNome: convidado.nomes,
      mensagem: "Confirmou presença como Padrinhos! 💍✨",
      presenca: "confirmado"
    });

    // Generate WhatsApp link as backup
    const text = encodeURIComponent(`Olá Noiva! Assistimos ao vídeo do convite e ficamos super emocionados! SIM, aceitamos com muito amor ser padrinhos de vocês! 💍❤️✨`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSendCustomMessage = async (e) => {
    e.preventDefault();
    if (!mensagemTexto.trim()) return;

    setIsSending(true);

    await sendGodparentMessage({
      convidadoId: convidado.id,
      convidadoNome: convidado.nomes,
      mensagem: mensagemTexto.trim(),
      presenca: "confirmado"
    });

    setIsSending(false);
    setMessageSent(true);
    setMensagemTexto('');

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#b89579', '#f43f5e', '#ffffff']
      });
    } catch (e) {}
  };

  return (
    <div className="bg-pattern min-h-screen flex flex-col items-center justify-center p-3 sm:p-8 relative text-gray-800 selection:bg-[#b89579] selection:text-white">
      
      {/* Top Floating Admin Access bar */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white text-xs text-gray-600 font-medium rounded-full shadow-sm border border-gray-200 backdrop-blur-sm transition-all hover:shadow-md"
          title="Abrir Painel Administrativo"
        >
          <Settings className="w-3.5 h-3.5 text-[#b89579]" />
          <span>Painel dos Noivos</span>
        </button>
      </div>

      {/* Main Glassmorphism Card */}
      <div className="glass-panel relative z-10 w-full max-w-5xl rounded-3xl p-5 sm:p-10 md:p-12 fade-in my-6">
        
        {/* Decorative Top Accent */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f8f3ee] text-[#b89579] border border-[#e8ded3] text-xs uppercase tracking-[0.25em] font-medium">
            <Heart className="w-3.5 h-3.5 fill-[#b89579]" />
            Convite de Casamento
            <Heart className="w-3.5 h-3.5 fill-[#b89579]" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center">
          
          {/* Lado Esquerdo: Mensagem e Formulário para a Noiva */}
          <div className="w-full md:w-3/5 text-center md:text-left flex flex-col justify-center">
            
            <p className="text-xs sm:text-sm tracking-[0.25em] text-gray-500 uppercase mb-3 font-semibold">
              Com muito amor, convidamos
            </p>
            
            <div className="my-2 min-h-[80px] flex items-center justify-center md:justify-start">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[#b89579] leading-tight font-semibold italic tracking-tight font-serif">
                {convidado.nomes}
              </h1>
            </div>

            <div className="w-20 h-[2px] bg-[#b89579]/30 my-4 mx-auto md:mx-0"></div>

            <div className="space-y-4 text-gray-600 text-base sm:text-lg leading-relaxed font-light">
              <p>
                Vocês, <strong className="text-[#b89579] font-serif font-normal italic">{convidado.nomesCurto || convidado.nomes}</strong>, sempre fizeram parte da nossa história e não poderíamos imaginar o nosso grande dia sem vocês ao nosso lado.
              </p>
              <p>
                {convidado.mensagem || "Assista ao vídeo especial que gravamos especialmente para vocês!"}
              </p>
            </div>

            {/* Aceitar Convite Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <button
                onClick={handleAceitar}
                className={`w-full sm:w-auto px-7 py-3.5 rounded-full font-medium text-base transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
                  hasAccepted
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-[#b89579] hover:bg-[#a38065] text-white shadow-[#b89579]/30 pulse-glow'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                {hasAccepted ? 'Presença Confirmada! ❤️' : 'Aceitamos o Convite! ✨'}
              </button>
            </div>

            {/* FORMULÁRIO DE MENSAGEM DIRETA PARA A NOIVA */}
            <div className="mt-8 p-5 bg-white/70 rounded-2xl border border-amber-100 shadow-sm text-left">
              <div className="flex items-center gap-2 mb-2 text-[#b89579]">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-serif font-semibold text-gray-800 text-base">Deixe um Recado para os Noivos</h3>
              </div>

              {messageSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Mensagem enviada com sucesso!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">A Noiva vai receber seu carinho no Painel. 💖</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendCustomMessage} className="space-y-3">
                  <textarea
                    value={mensagemTexto}
                    onChange={(e) => setMensagemTexto(e.target.value)}
                    placeholder="Escreva uma mensagem especial para a noiva..."
                    rows={3}
                    className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:border-[#b89579] focus:ring-2 focus:ring-[#b89579]/20 outline-none transition-all bg-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#b89579] hover:bg-[#a38065] text-white text-xs font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{isSending ? 'Enviando...' : 'Enviar Mensagem para a Noiva'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Footer Date */}
            <div className="mt-8 border-t border-gray-200/70 pt-5">
              <p className="serif-font text-xl sm:text-2xl text-gray-800 italic">
                O Nosso Grande Dia
              </p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-[0.2em]">Em Breve • Salve essa data</p>
            </div>

          </div>

          {/* Lado Direito: Player de Vídeo em Moldura Smartphone (9:16) */}
          <div className="w-full md:w-2/5 flex flex-col items-center justify-center">
            
            <div className="mb-3 text-center z-20 w-full">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-1">Vídeo Especial Para</p>
              <h2 className="text-2xl sm:text-3xl text-[#b89579] font-serif italic">{convidado.nomesCurto || convidado.nomes}</h2>
            </div>

            <div className="video-container bg-slate-900 flex items-center justify-center relative shadow-2xl">
              
              {isMp4 ? (
                <>
                  <video 
                    ref={videoRef}
                    className="z-10 relative w-full h-full object-cover" 
                    controls
                    playsInline
                    preload="metadata"
                    src={convidado.video}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  
                  {!isPlaying && (
                    <button
                      onClick={togglePlay}
                      className="absolute z-20 w-16 h-16 rounded-full bg-[#b89579]/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform backdrop-blur-sm"
                      title="Play Vídeo"
                    >
                      <Play className="w-8 h-8 ml-1 fill-white" />
                    </button>
                  )}
                </>
              ) : (
                <iframe 
                  className="z-10 relative w-full h-full"
                  src={convidado.video} 
                  title="Convite Especial dos Padrinhos" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                />
              )}
              
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center flex items-center gap-1">
              <span>▶️ Clique para dar play no vídeo</span>
            </p>

          </div>

        </div>

      </div>

      <footer className="relative z-10 text-center text-xs text-gray-400 mt-2">
        Feito com ❤️ para os Padrinhos
      </footer>
    </div>
  );
}
