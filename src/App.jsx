import React, { useState, useEffect } from 'react';
import { defaultInvitations, fallbackData } from './data/defaultInvitations';
import ConvitePage from './components/ConvitePage';
import AdminPanel from './components/AdminPanel';
import PainelNoiva from './components/PainelNoiva';

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

  // View counter state
  const [viewCounts, setViewCounts] = useState(() => {
    try {
      const saved = localStorage.getItem('meu_convite_views_count');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [currentRoute, setCurrentRoute] = useState('');

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
      
      // Check hash (#link01, #noiva, #admin)
      if (window.location.hash && window.location.hash.length > 1) {
        rawData = window.location.hash.substring(1).split('?')[0];
      } 
      // Check query parameter (?id=link01, ?noiva)
      else if (window.location.search && window.location.search.length > 1) {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('id')) {
          rawData = searchParams.get('id');
        } else if (searchParams.has('noiva')) {
          rawData = 'noiva';
        } else {
          rawData = window.location.search.substring(1).split('&')[0];
        }
      }

      const cleanCode = decodeURIComponent(rawData).trim().toLowerCase();
      setCurrentRoute(cleanCode);

      // Increment view count if it's a valid godparent invite ID
      if (cleanCode && cleanCode !== 'noiva' && cleanCode !== 'admin') {
        setViewCounts((prev) => {
          const updated = { ...prev, [cleanCode]: (prev[cleanCode] || 0) + 1 };
          try {
            localStorage.setItem('meu_convite_views_count', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
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
    setCurrentRoute(id);
  };

  // 1. ROUTE: Painel Exclusivo da Noiva (#noiva ou ?noiva)
  if (currentRoute === 'noiva') {
    return (
      <PainelNoiva
        invitations={invitations}
        onOpenInvite={handleOpenInvite}
        getViewCounts={() => viewCounts}
      />
    );
  }

  // 2. ROUTE: Convite Individual do Padrinho (#link01, #link02, etc.)
  if (currentRoute && currentRoute !== 'admin') {
    const activeGuest = invitations.find(
      (inv) => inv.id.toLowerCase() === currentRoute.toLowerCase()
    ) || { ...fallbackData, id: currentRoute, nomes: "Queridos Padrinhos" };

    return (
      <ConvitePage
        convidado={activeGuest}
        onOpenAdmin={() => {
          window.location.hash = 'admin';
          setCurrentRoute('admin');
        }}
      />
    );
  }

  // 3. ROUTE: Painel de Controle Master / Admin (sem código ou #admin)
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
