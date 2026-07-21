import React from 'react';
import { X, Smartphone, ExternalLink } from 'lucide-react';
import ConvitePage from './ConvitePage';

export default function MobilePreviewModal({ convidado, onClose }) {
  if (!convidado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md fade-in">
      <div className="bg-slate-900 rounded-[40px] border-4 border-gray-700 shadow-2xl overflow-hidden max-w-sm w-full h-[85vh] flex flex-col relative">
        
        {/* Phone Speaker & Notch Header */}
        <div className="bg-slate-900 pt-3 pb-2 px-6 flex items-center justify-between z-40 border-b border-slate-800">
          <div className="flex items-center gap-1 text-xs text-amber-200 font-medium">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pré-visualização Mobile</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Mobile Screen Content */}
        <div className="flex-1 overflow-y-auto bg-[#fcfbf9] relative">
          <ConvitePage convidado={convidado} onOpenAdmin={onClose} />
        </div>

        {/* Mobile Home Bar Footer */}
        <div className="bg-slate-900 py-2.5 flex justify-center z-40">
          <div className="w-28 h-1 bg-slate-700 rounded-full"></div>
        </div>

      </div>
    </div>
  );
}
