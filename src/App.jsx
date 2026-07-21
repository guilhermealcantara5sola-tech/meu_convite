import React, { useState, useEffect } from 'react';
import { defaultInvitations, fallbackData } from './data/defaultInvitations';
import ConvitePage from './components/ConvitePage';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Load stored invitations or default ones
  const [invitations, setInvitations] = useState(() => {
    try {
      const saved = localStorage.getItem('meu_convite_padrinhos_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erro ao ler localStorage:', e);
    }
    return defaultInvitations;
  });

  const [currentId, setCurrentId] = useState('');
  const [viewMode, setViewMode] = useState('auto'); // 'auto', 'convite', 'admin'

  // Save to localStorage whenever invitations change
  useEffect(() => {
    try {
      localStorage.setItem('meu_convite_padrinhos_data', JSON.stringify(invitations));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [invitations]);

  // Read URL parameters on load and when hash/search changes
  useEffect(() => {
    const parseUrlCode = () => {
      let rawData = "";
      
      // Check hash (#link01 or #andressa-natan)
      if (window.location.hash && window.location.hash.length > 1) {
        rawData = window.location.hash.substring(1).split('?')[0];
      } 
      // Check query parameter (?id=link01 or ?link01)
      else if (window.location.search && window.location.search.length > 1) {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('id')) {
          rawData = searchParams.get('id');
        } else {
          rawData = window.location.search.substring(1).split('&')[0];
        }
      }

      const cleanCode = decodeURIComponent(rawData).trim().toLowerCase();
      setCurrentId(cleanCode);
    };

    parseUrlCode();
    window.addEventListener('hashchange', parseUrlCode);
    window.addEventListener('popstate', parseUrlCode);

    return () => {
      window.removeEventListener('hashchange', parseUrlCode);
      window.removeEventListener('popstate', parseUrlCode);
    };
  }, []);

  // Save invitation handler
  const handleSaveInvitation = (newInvite) => {
    setInvitations((prev) => {
      const existsIndex = prev.findIndex((inv) => inv.id.toLowerCase() === newInvite.id.toLowerCase());
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = newInvite;
        return updated;
      }
      return [newInvite, ...prev];
    });
  };

  // Delete invitation handler
  const handleDeleteInvitation = (id) => {
    setInvitations((prev) => prev.filter((inv) => inv.id.toLowerCase() !== id.toLowerCase()));
  };

  // Reset to default sample invitations
  const handleResetDefault = () => {
    if (confirm("Deseja restaurar a lista com os 10 convites de exemplo padrão?")) {
      setInvitations(defaultInvitations);
      localStorage.setItem('meu_convite_padrinhos_data', JSON.stringify(defaultInvitations));
    }
  };

  // Open invite page directly
  const handleOpenInvite = (id) => {
    window.location.hash = id;
    setCurrentId(id);
    setViewMode('convite');
  };

  // Switch to admin mode
  const handleOpenAdmin = () => {
    setViewMode('admin');
  };

  // Determine which guest is active
  const activeGuest = invitations.find(
    (inv) => inv.id.toLowerCase() === currentId.toLowerCase()
  ) || (currentId ? { ...fallbackData, id: currentId, nomes: "Queridos Padrinhos" } : null);

  // Determine what to show:
  // 1. If explicit viewMode is 'admin', show Admin Panel.
  // 2. If viewMode is 'convite', show Convite Page.
  // 3. If 'auto': if currentId exists, show Convite Page; otherwise show Admin Panel!
  const shouldShowConvite = viewMode === 'convite' || (viewMode === 'auto' && Boolean(currentId));

  if (shouldShowConvite && activeGuest) {
    return (
      <ConvitePage
        convidado={activeGuest}
        onOpenAdmin={() => setViewMode('admin')}
        allIds={invitations.map(i => i.id)}
      />
    );
  }

  return (
    <AdminPanel
      invitations={invitations}
      onSaveInvitation={handleSaveInvitation}
      onDeleteInvitation={handleDeleteInvitation}
      onResetDefault={handleResetDefault}
      onOpenInvite={handleOpenInvite}
    />
  );
}
