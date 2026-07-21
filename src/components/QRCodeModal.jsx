import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, ExternalLink, Sparkles, QrCode as QrIcon } from 'lucide-react';

export default function QRCodeModal({ convite, fullUrl, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState('#b89579');
  const [bgColor, setBgColor] = useState('#ffffff');

  useEffect(() => {
    if (canvasRef.current && fullUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        fullUrl,
        {
          width: 280,
          margin: 2,
          color: {
            dark: qrColor,
            light: bgColor,
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) console.error('Erro ao gerar QR Code:', error);
        }
      );
    }
  }, [fullUrl, qrColor, bgColor]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `QR-Code-Convite-${convite.nomes.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100/50 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#f8f3ee] flex items-center justify-center text-[#b89579]">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 font-serif">QR Code do Convite</h3>
              <p className="text-xs text-gray-500">{convite.nomes}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Canvas Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#fdfbf7] rounded-2xl border border-amber-100/70 mb-5 relative group">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
            <canvas ref={canvasRef} className="rounded-lg shadow-inner max-w-full" />
          </div>

          <div className="mt-3 flex gap-2 text-xs">
            <button
              onClick={() => setQrColor('#b89579')}
              className={`px-2.5 py-1 rounded-full border ${qrColor === '#b89579' ? 'bg-[#b89579] text-white border-[#b89579]' : 'bg-white text-gray-600'}`}
            >
              Dourado
            </button>
            <button
              onClick={() => setQrColor('#1f2937')}
              className={`px-2.5 py-1 rounded-full border ${qrColor === '#1f2937' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600'}`}
            >
              Preto
            </button>
            <button
              onClick={() => setQrColor('#7c2d12')}
              className={`px-2.5 py-1 rounded-full border ${qrColor === '#7c2d12' ? 'bg-amber-900 text-white border-amber-900' : 'bg-white text-gray-600'}`}
            >
              Terracota
            </button>
          </div>
        </div>

        {/* Link Info Box */}
        <div className="bg-gray-50 rounded-xl p-3 mb-5 border border-gray-200/80">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Link Individual Gerado</p>
          <p className="text-xs text-gray-700 font-mono truncate select-all">{fullUrl}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl text-sm transition-all active:scale-[0.98]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Link Copiado!' : 'Copiar Link'}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#b89579] hover:bg-[#a38065] text-white font-medium rounded-xl text-sm transition-all shadow-md shadow-[#b89579]/20 active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Baixar PNG
          </button>
        </div>

        <div className="mt-3 text-center">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#b89579] hover:underline font-medium"
          >
            Testar abrir esta página de convite <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}
