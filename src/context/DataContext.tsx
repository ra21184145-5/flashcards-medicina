import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { storage } from '../services/storage';
import { Deck, Flashcard, Grupo, Privacy } from '../types';
import { useAuth } from './AuthContext';

interface DataContextValue {
  decks: Deck[];
  cards: Flashcard[];
  grupos: Grupo[];
  criarDeck: (dados: { nome: string; descricao: string; privacidade: Privacy; grupoId?: string }) => Promise<Deck>;
  atualizarDeck: (deck: Deck) => Promise<void>;
  removerDeck: (deckId: string) => Promise<void>;
  criarCard: (deckId: string, frente: string, verso: string) => Promise<Flashcard>;
  atualizarCard: (card: Flashcard) => Promise<void>;
  removerCard: (cardId: string) => Promise<void>;
  criarGrupo: (dados: { nome: string; descricao: string; requerAprovacao: boolean }) => Promise<Grupo>;
  entrarNoGrupo: (grupoId: string) => Promise<void>;
  cardsDoDeck: (deckId: string) => Flashcard[];
  semearDadosExemplo: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function gerarId(prefixo: string) {
  return `${prefixo}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  useEffect(() => {
    (async () => {
      const [d, c, g] = await Promise.all([
        storage.getDecks(),
        storage.getCards(),
        storage.getGrupos(),
      ]);
      setDecks(d);
      setCards(c);
      setGrupos(g);
    })();
  }, []);

  const persistirDecks = useCallback(async (novos: Deck[]) => {
    setDecks(novos);
    await storage.setDecks(novos);
  }, []);

  const persistirCards = useCallback(async (novos: Flashcard[]) => {
    setCards(novos);
    await storage.setCards(novos);
  }, []);

  const persistirGrupos = useCallback(async (novos: Grupo[]) => {
    setGrupos(novos);
    await storage.setGrupos(novos);
  }, []);

  async function criarDeck({ nome, descricao, privacidade, grupoId }: { nome: string; descricao: string; privacidade: Privacy; grupoId?: string }) {
    if (!user) throw new Error('Usuario nao autenticado.');
    const novo: Deck = {
      id: gerarId('deck'),
      nome,
      descricao,
      donoId: user.id,
      privacidade,
      grupoId,
      criadoEm: Date.now(),
      totalCards: 0,
    };
    await persistirDecks([novo, ...decks]);
    return novo;
  }

  async function atualizarDeck(deck: Deck) {
    const novos = decks.map((d) => (d.id === deck.id ? deck : d));
    await persistirDecks(novos);
  }

  async function removerDeck(deckId: string) {
    await persistirDecks(decks.filter((d) => d.id !== deckId));
    await persistirCards(cards.filter((c) => c.deckId !== deckId));
  }

  async function criarCard(deckId: string, frente: string, verso: string) {
    const novo: Flashcard = {
      id: gerarId('card'),
      deckId,
      frente,
      verso,
      criadoEm: Date.now(),
      intervalo: 0,
      repeticoes: 0,
      facilidade: 2.5,
      proximaRevisao: Date.now(),
    };
    const novosCards = [novo, ...cards];
    await persistirCards(novosCards);
    const deck = decks.find((d) => d.id === deckId);
    if (deck) {
      await atualizarDeck({ ...deck, totalCards: deck.totalCards + 1 });
    }
    return novo;
  }

  async function atualizarCard(card: Flashcard) {
    const novos = cards.map((c) => (c.id === card.id ? card : c));
    await persistirCards(novos);
  }

  async function removerCard(cardId: string) {
    const cardRemovido = cards.find((c) => c.id === cardId);
    await persistirCards(cards.filter((c) => c.id !== cardId));
    if (cardRemovido) {
      const deck = decks.find((d) => d.id === cardRemovido.deckId);
      if (deck) {
        await atualizarDeck({ ...deck, totalCards: Math.max(0, deck.totalCards - 1) });
      }
    }
  }

  async function criarGrupo({ nome, descricao, requerAprovacao }: { nome: string; descricao: string; requerAprovacao: boolean }) {
    if (!user) throw new Error('Usuario nao autenticado.');
    const novo: Grupo = {
      id: gerarId('grp'),
      nome,
      descricao,
      donoId: user.id,
      requerAprovacao,
      membros: [user.id],
      criadoEm: Date.now(),
    };
    await persistirGrupos([novo, ...grupos]);
    return novo;
  }

  async function entrarNoGrupo(grupoId: string) {
    if (!user) return;
    const novos = grupos.map((g) =>
      g.id === grupoId && !g.membros.includes(user.id)
        ? { ...g, membros: [...g.membros, user.id] }
        : g
    );
    await persistirGrupos(novos);
  }

  function cardsDoDeck(deckId: string) {
    return cards.filter((c) => c.deckId === deckId);
  }

  async function semearDadosExemplo() {
    if (!user) return;
    if (decks.length > 0) return;

    const deckCardio: Deck = {
      id: gerarId('deck'),
      nome: 'Cardiologia - Farmacologia',
      descricao: 'Principais classes de anti-hipertensivos e antiarritmicos.',
      donoId: user.id,
      privacidade: 'privado',
      criadoEm: Date.now(),
      totalCards: 4,
    };
    const deckAnato: Deck = {
      id: gerarId('deck'),
      nome: 'Anatomia - Cranio e Face',
      descricao: 'Ossos, forames e estruturas associadas.',
      donoId: user.id,
      privacidade: 'grupo',
      criadoEm: Date.now() - 86400000,
      totalCards: 3,
    };
    const deckMicro: Deck = {
      id: gerarId('deck'),
      nome: 'Microbiologia Basica',
      descricao: 'Deck publico compartilhado pela comunidade.',
      donoId: 'outro_user',
      privacidade: 'publico',
      criadoEm: Date.now() - 3 * 86400000,
      totalCards: 2,
    };

    const baseCard = (deckId: string, frente: string, verso: string, offset: number): Flashcard => ({
      id: gerarId('card'),
      deckId,
      frente,
      verso,
      criadoEm: Date.now(),
      intervalo: 0,
      repeticoes: 0,
      facilidade: 2.5,
      proximaRevisao: Date.now() - offset,
    });

    const novosCards: Flashcard[] = [
      baseCard(deckCardio.id, 'Qual o mecanismo de acao do Losartan?', 'Bloqueador do receptor AT1 da angiotensina II (BRA).', 0),
      baseCard(deckCardio.id, 'Qual classe a Amiodarona pertence?', 'Antiarritmico classe III - bloqueio de canais de K+.', 0),
      baseCard(deckCardio.id, 'IECA e tosse seca: por que ocorre?', 'Acumulo de bradicinina pela inibicao da ECA.', 0),
      baseCard(deckCardio.id, 'Qual a dose inicial do Enalapril em HAS?', '5 mg/dia, podendo ser ajustada ate 40 mg/dia.', 0),
      baseCard(deckAnato.id, 'Por qual forame passa o nervo trigemeo V3?', 'Forame oval.', 0),
      baseCard(deckAnato.id, 'Quais ossos compoem o nariz externo?', 'Nasais, frontal (parte), maxilas e cartilagens.', 0),
      baseCard(deckAnato.id, 'O que passa pelo canal optico?', 'Nervo optico (II) e arteria oftalmica.', 0),
      baseCard(deckMicro.id, 'Qual bacteria causa tuberculose?', 'Mycobacterium tuberculosis.', 0),
      baseCard(deckMicro.id, 'Coloracao de Gram: gram-positivas coram de?', 'Roxo/violeta.', 0),
    ];

    const grupoExemplo: Grupo = {
      id: gerarId('grp'),
      nome: 'Medicina UFSM - Turma 2024',
      descricao: 'Grupo de estudo dos alunos de medicina da UFSM.',
      donoId: user.id,
      requerAprovacao: false,
      membros: [user.id],
      criadoEm: Date.now() - 7 * 86400000,
    };

    await persistirDecks([deckCardio, deckAnato, deckMicro]);
    await persistirCards(novosCards);
    await persistirGrupos([grupoExemplo]);
  }

  return (
    <DataContext.Provider
      value={{
        decks,
        cards,
        grupos,
        criarDeck,
        atualizarDeck,
        removerDeck,
        criarCard,
        atualizarCard,
        removerCard,
        criarGrupo,
        entrarNoGrupo,
        cardsDoDeck,
        semearDadosExemplo,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData precisa estar dentro de DataProvider');
  return ctx;
}
