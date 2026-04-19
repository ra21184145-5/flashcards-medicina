import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { storage } from '../services/storage';
import { cloudSync } from '../services/cloudSync';
import { Configuracoes, Deck, Flashcard, Grupo, Privacy, Qualidade, ReviewLog } from '../types';
import { useAuth } from './AuthContext';

interface DataContextValue {
  decks: Deck[];
  cards: Flashcard[];
  grupos: Grupo[];
  reviewLogs: ReviewLog[];
  config: Configuracoes;
  criarDeck: (dados: { nome: string; descricao: string; privacidade: Privacy; grupoId?: string }) => Promise<Deck>;
  atualizarDeck: (deck: Deck) => Promise<void>;
  removerDeck: (deckId: string) => Promise<void>;
  criarCard: (deckId: string, frente: string, verso: string) => Promise<Flashcard>;
  criarCardsEmLote: (deckId: string, cardsBase: { frente: string; verso: string }[]) => Promise<Flashcard[]>;
  atualizarCard: (card: Flashcard) => Promise<void>;
  removerCard: (cardId: string) => Promise<void>;
  criarGrupo: (dados: { nome: string; descricao: string; requerAprovacao: boolean }) => Promise<Grupo>;
  entrarNoGrupo: (grupoId: string) => Promise<void>;
  cardsDoDeck: (deckId: string) => Flashcard[];
  registrarRevisao: (card: Flashcard, qualidade: Qualidade) => Promise<void>;
  atualizarConfig: (parcial: Partial<Configuracoes>) => Promise<void>;
  semearDadosExemplo: () => Promise<void>;
  listarDecksPublicosRemotos: () => Promise<Deck[]>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function gerarId(prefixo: string) {
  return `${prefixo}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

const CONFIG_INICIAL: Configuracoes = {
  geminiApiKey: '',
  geminiModelo: 'gemini-3.1-pro-preview',
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [config, setConfig] = useState<Configuracoes>(CONFIG_INICIAL);

  // Refs para evitar capturas obsoletas nas closures de persistir*.
  const decksRef = useRef<Deck[]>([]);
  const cardsRef = useRef<Flashcard[]>([]);
  const gruposRef = useRef<Grupo[]>([]);
  const logsRef = useRef<ReviewLog[]>([]);

  useEffect(() => { decksRef.current = decks; }, [decks]);
  useEffect(() => { cardsRef.current = cards; }, [cards]);
  useEffect(() => { gruposRef.current = grupos; }, [grupos]);
  useEffect(() => { logsRef.current = reviewLogs; }, [reviewLogs]);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      // 1) Carrega do cache local para renderizacao imediata (offline-first).
      const [d, c, g, logs, cfg] = await Promise.all([
        storage.getDecks(),
        storage.getCards(),
        storage.getGrupos(),
        storage.getReviewLogs(),
        storage.getConfig(),
      ]);
      if (cancelado) return;
      setDecks(d);
      setCards(c);
      setGrupos(g);
      setReviewLogs(logs);
      setConfig(cfg);

      // 2) Se ha usuario autenticado, puxa o estado remoto e atualiza.
      if (!user) return;
      try {
        const remoto = await cloudSync.pullUserData(user.id);
        if (cancelado) return;
        setDecks(remoto.decks);
        setCards(remoto.cards);
        setGrupos(remoto.grupos);
        setReviewLogs(remoto.reviewLogs);
        await Promise.all([
          storage.setDecks(remoto.decks),
          storage.setCards(remoto.cards),
          storage.setGrupos(remoto.grupos),
          storage.setReviewLogs(remoto.reviewLogs),
        ]);
        if (remoto.configRemoto) {
          const merged = { ...cfg, ...remoto.configRemoto };
          setConfig(merged);
          await storage.setConfig(merged);
        }
      } catch (e) {
        console.warn('Falha ao puxar dados remotos:', e);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [user?.id]);

  const persistirDecks = useCallback(async (novos: Deck[]) => {
    const antigos = decksRef.current;
    setDecks(novos);
    await storage.setDecks(novos);
    cloudSync.syncDecks(antigos, novos).catch((e) => console.warn('sync decks:', e));
  }, []);

  const persistirCards = useCallback(async (novos: Flashcard[]) => {
    const antigos = cardsRef.current;
    setCards(novos);
    await storage.setCards(novos);
    cloudSync.syncCards(antigos, novos).catch((e) => console.warn('sync cards:', e));
  }, []);

  const persistirGrupos = useCallback(async (novos: Grupo[]) => {
    const antigos = gruposRef.current;
    setGrupos(novos);
    await storage.setGrupos(novos);
    cloudSync.syncGrupos(antigos, novos).catch((e) => console.warn('sync grupos:', e));
  }, []);

  const persistirLogs = useCallback(async (novos: ReviewLog[]) => {
    const antigos = logsRef.current;
    setReviewLogs(novos);
    await storage.setReviewLogs(novos);
    cloudSync.syncReviewLogs(antigos, novos).catch((e) => console.warn('sync logs:', e));
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
    await persistirLogs(reviewLogs.filter((l) => l.deckId !== deckId));
  }

  function novoCardBase(deckId: string, frente: string, verso: string): Flashcard {
    if (!user) throw new Error('Usuario nao autenticado.');
    return {
      id: gerarId('card'),
      deckId,
      donoId: user.id,
      frente,
      verso,
      criadoEm: Date.now(),
      intervalo: 0,
      repeticoes: 0,
      facilidade: 2.5,
      proximaRevisao: Date.now(),
    };
  }

  async function criarCard(deckId: string, frente: string, verso: string) {
    const novo = novoCardBase(deckId, frente, verso);
    const novosCards = [novo, ...cards];
    await persistirCards(novosCards);
    const deck = decks.find((d) => d.id === deckId);
    if (deck) {
      await atualizarDeck({ ...deck, totalCards: deck.totalCards + 1 });
    }
    return novo;
  }

  async function criarCardsEmLote(deckId: string, cardsBase: { frente: string; verso: string }[]) {
    if (cardsBase.length === 0) return [];
    const novos = cardsBase.map((b) => novoCardBase(deckId, b.frente, b.verso));
    const todos = [...novos, ...cards];
    await persistirCards(todos);
    const deck = decks.find((d) => d.id === deckId);
    if (deck) {
      await atualizarDeck({ ...deck, totalCards: deck.totalCards + novos.length });
    }
    return novos;
  }

  async function atualizarCard(card: Flashcard) {
    const novos = cards.map((c) => (c.id === card.id ? card : c));
    await persistirCards(novos);
  }

  async function removerCard(cardId: string) {
    const cardRemovido = cards.find((c) => c.id === cardId);
    await persistirCards(cards.filter((c) => c.id !== cardId));
    await persistirLogs(reviewLogs.filter((l) => l.cardId !== cardId));
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

  async function registrarRevisao(card: Flashcard, qualidade: Qualidade) {
    if (!user) return;
    const log: ReviewLog = {
      id: gerarId('log'),
      cardId: card.id,
      deckId: card.deckId,
      donoId: user.id,
      qualidade,
      timestamp: Date.now(),
    };
    const novos = [log, ...reviewLogs].slice(0, 5000);
    await persistirLogs(novos);
  }

  async function atualizarConfig(parcial: Partial<Configuracoes>) {
    const novo = { ...config, ...parcial };
    setConfig(novo);
    await storage.setConfig(novo);
    if (user) {
      cloudSync.syncConfig(user.id, novo).catch((e) => console.warn('sync config:', e));
    }
  }

  async function listarDecksPublicosRemotos(): Promise<Deck[]> {
    try {
      return await cloudSync.listarDecksPublicos();
    } catch (e) {
      console.warn('falha ao listar publicos remotos:', e);
      return decks.filter((d) => d.privacidade === 'publico');
    }
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
      descricao: 'Deck publico para explorar na aba Publicos.',
      donoId: user.id,
      privacidade: 'publico',
      criadoEm: Date.now() - 3 * 86400000,
      totalCards: 2,
    };

    const baseCard = (deckId: string, frente: string, verso: string): Flashcard => ({
      id: gerarId('card'),
      deckId,
      donoId: user.id,
      frente,
      verso,
      criadoEm: Date.now(),
      intervalo: 0,
      repeticoes: 0,
      facilidade: 2.5,
      proximaRevisao: Date.now(),
    });

    const novosCards: Flashcard[] = [
      baseCard(deckCardio.id, 'Qual o mecanismo de acao do Losartan?', 'Bloqueador do receptor AT1 da angiotensina II (BRA).'),
      baseCard(deckCardio.id, 'Qual classe a Amiodarona pertence?', 'Antiarritmico classe III - bloqueio de canais de K+.'),
      baseCard(deckCardio.id, 'IECA e tosse seca: por que ocorre?', 'Acumulo de bradicinina pela inibicao da ECA.'),
      baseCard(deckCardio.id, 'Qual a dose inicial do Enalapril em HAS?', '5 mg/dia, podendo ser ajustada ate 40 mg/dia.'),
      baseCard(deckAnato.id, 'Por qual forame passa o nervo trigemeo V3?', 'Forame oval.'),
      baseCard(deckAnato.id, 'Quais ossos compoem o nariz externo?', 'Nasais, frontal (parte), maxilas e cartilagens.'),
      baseCard(deckAnato.id, 'O que passa pelo canal optico?', 'Nervo optico (II) e arteria oftalmica.'),
      baseCard(deckMicro.id, 'Qual bacteria causa tuberculose?', 'Mycobacterium tuberculosis.'),
      baseCard(deckMicro.id, 'Coloracao de Gram: gram-positivas coram de?', 'Roxo/violeta.'),
    ];

    const agora = Date.now();
    const UM_DIA = 24 * 60 * 60 * 1000;
    const logsSimulados: ReviewLog[] = [];
    const qualidadesExemplo: Qualidade[] = [5, 4, 3, 4, 5, 4, 1, 4, 5, 3, 4, 5];
    let contador = 0;
    for (let dia = 6; dia >= 0; dia--) {
      const revisoesNoDia = [3, 5, 4, 6, 2, 7, 4][dia];
      for (let i = 0; i < revisoesNoDia; i++) {
        const card = novosCards[contador % novosCards.length];
        logsSimulados.push({
          id: gerarId('log'),
          cardId: card.id,
          deckId: card.deckId,
          donoId: user.id,
          qualidade: qualidadesExemplo[contador % qualidadesExemplo.length],
          timestamp: agora - dia * UM_DIA - i * 3600_000,
        });
        contador += 1;
      }
    }

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
    await persistirLogs(logsSimulados);
  }

  return (
    <DataContext.Provider
      value={{
        decks,
        cards,
        grupos,
        reviewLogs,
        config,
        criarDeck,
        atualizarDeck,
        removerDeck,
        criarCard,
        criarCardsEmLote,
        atualizarCard,
        removerCard,
        criarGrupo,
        entrarNoGrupo,
        cardsDoDeck,
        registrarRevisao,
        atualizarConfig,
        semearDadosExemplo,
        listarDecksPublicosRemotos,
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
