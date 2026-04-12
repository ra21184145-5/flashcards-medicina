import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { storage } from '../services/storage';
import { cloudSync } from '../services/cloudSync';
import { db } from '../services/firebase';
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
  entrarPorCodigo: (codigo: string) => Promise<{ grupo: Grupo; status: 'entrou' | 'pendente' }>;
  aprovarPendente: (grupoId: string, uid: string) => Promise<void>;
  rejeitarPendente: (grupoId: string, uid: string) => Promise<void>;
  sairDoGrupo: (grupoId: string) => Promise<void>;
  buscarGruposPublicos: (termo: string) => Promise<Grupo[]>;
  buscarPerfis: (uids: string[]) => Promise<Record<string, { nome: string; email: string } | undefined>>;
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

// Gera codigo de convite de 6 caracteres, evitando caracteres ambiguos (0/O, 1/I/L).
function gerarCodigoConvite() {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let saida = '';
  for (let i = 0; i < 6; i++) {
    saida += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return saida;
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

      // 2) Se ha usuario autenticado (nao demo), puxa estado remoto e atualiza.
      if (!user) return;
      if (user.id.startsWith('demo-')) return;
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
      pendentes: [],
      codigoConvite: gerarCodigoConvite(),
      criadoEm: Date.now(),
    };
    await persistirGrupos([novo, ...grupos]);
    return novo;
  }

  async function entrarPorCodigo(codigo: string) {
    if (!user) throw new Error('Usuario nao autenticado.');
    const cod = codigo.trim().toUpperCase();
    if (cod.length !== 6) throw new Error('Codigo deve ter 6 caracteres.');

    // Procura primeiro nos grupos locais (caso ja tenha sido puxado); caso
    // contrario, consulta o Firestore pelo codigo.
    let alvo: Grupo | null = grupos.find((g) => g.codigoConvite === cod) ?? null;
    if (!alvo && !user.id.startsWith('demo-')) {
      alvo = await cloudSync.buscarGrupoPorCodigo(cod);
    }
    if (!alvo) throw new Error('Nenhum grupo encontrado com esse codigo.');

    if (alvo.membros.includes(user.id)) {
      return { grupo: alvo, status: 'entrou' as const };
    }
    if (alvo.pendentes.includes(user.id)) {
      return { grupo: alvo, status: 'pendente' as const };
    }

    let atualizado: Grupo;
    let status: 'entrou' | 'pendente';
    if (alvo.requerAprovacao) {
      atualizado = { ...alvo, pendentes: [...alvo.pendentes, user.id] };
      status = 'pendente';
    } else {
      atualizado = { ...alvo, membros: [...alvo.membros, user.id] };
      status = 'entrou';
    }

    const jaTem = grupos.some((g) => g.id === atualizado.id);
    const novos = jaTem
      ? grupos.map((g) => (g.id === atualizado.id ? atualizado : g))
      : [atualizado, ...grupos];
    await persistirGrupos(novos);
    // Garante escrita direta no documento remoto (o sync ja faz, mas
    // explicitar evita race quando o cache local nao tinha o grupo).
    if (!user.id.startsWith('demo-')) {
      cloudSync.salvarGrupo(atualizado).catch((e) => console.warn('salvar grupo:', e));
    }
    return { grupo: atualizado, status };
  }

  async function aprovarPendente(grupoId: string, uid: string) {
    const grupo = grupos.find((g) => g.id === grupoId);
    if (!grupo) return;
    const atualizado: Grupo = {
      ...grupo,
      pendentes: grupo.pendentes.filter((p) => p !== uid),
      membros: grupo.membros.includes(uid) ? grupo.membros : [...grupo.membros, uid],
    };
    await persistirGrupos(grupos.map((g) => (g.id === grupoId ? atualizado : g)));
  }

  async function rejeitarPendente(grupoId: string, uid: string) {
    const grupo = grupos.find((g) => g.id === grupoId);
    if (!grupo) return;
    const atualizado: Grupo = {
      ...grupo,
      pendentes: grupo.pendentes.filter((p) => p !== uid),
    };
    await persistirGrupos(grupos.map((g) => (g.id === grupoId ? atualizado : g)));
  }

  async function sairDoGrupo(grupoId: string) {
    if (!user) return;
    const grupo = grupos.find((g) => g.id === grupoId);
    if (!grupo) return;
    // Dono nao sai; precisa excluir ou transferir (fora do escopo do TCC).
    if (grupo.donoId === user.id) {
      throw new Error('O dono do grupo nao pode sair. Para encerrar, apague o grupo.');
    }
    const atualizado: Grupo = {
      ...grupo,
      membros: grupo.membros.filter((m) => m !== user.id),
      pendentes: grupo.pendentes.filter((p) => p !== user.id),
    };
    // Removemos da lista local (o usuario nao pertence mais).
    await persistirGrupos(grupos.filter((g) => g.id !== grupoId));
    if (!user.id.startsWith('demo-')) {
      cloudSync.salvarGrupo(atualizado).catch((e) => console.warn('salvar grupo:', e));
    }
  }

  async function buscarGruposPublicos(termo: string): Promise<Grupo[]> {
    const filtro = termo.trim().toLowerCase();
    // Local primeiro (demo e cache).
    const locais = grupos.filter(
      (g) => !filtro || g.nome.toLowerCase().includes(filtro) || g.descricao.toLowerCase().includes(filtro)
    );
    if (user?.id.startsWith('demo-')) return locais;
    try {
      // Sem indice de texto no Firestore Free; puxamos ate 50 grupos e
      // filtramos em memoria. Suficiente para escala didatica.
      const snap = await getDocs(query(collection(db, 'grupos'), limit(50)));
      const remotos = snap.docs.map((d) => d.data() as Grupo);
      const mapa = new Map<string, Grupo>();
      for (const g of locais) mapa.set(g.id, g);
      for (const g of remotos) {
        if (!filtro || g.nome.toLowerCase().includes(filtro) || g.descricao.toLowerCase().includes(filtro)) {
          if (!mapa.has(g.id)) mapa.set(g.id, g);
        }
      }
      return Array.from(mapa.values());
    } catch (e) {
      console.warn('buscar publicos:', e);
      return locais;
    }
  }

  async function buscarPerfis(uids: string[]) {
    if (user?.id.startsWith('demo-')) {
      // Em demo, apenas mapeia o proprio usuario.
      const r: Record<string, { nome: string; email: string } | undefined> = {};
      if (user) r[user.id] = { nome: user.nome, email: user.email };
      return r;
    }
    try {
      return await cloudSync.buscarPerfis(uids);
    } catch (e) {
      console.warn('buscar perfis:', e);
      return {};
    }
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

    const baseCard = (
      deckId: string,
      frente: string,
      verso: string,
      estado: { intervalo: number; repeticoes: number; facilidade: number; diasAte: number }
    ): Flashcard => ({
      id: gerarId('card'),
      deckId,
      donoId: user.id,
      frente,
      verso,
      criadoEm: Date.now(),
      intervalo: estado.intervalo,
      repeticoes: estado.repeticoes,
      facilidade: estado.facilidade,
      proximaRevisao: Date.now() + estado.diasAte * 24 * 60 * 60 * 1000,
    });

    // Espalha cards em estados de maturidade diferentes para que a tela de
    // estudo mostre previsoes variadas nos botoes (1d / 3d / 6d / 15d ...)
    // e para que o forecast de 7 dias tenha dados distribuidos.
    const novosCards: Flashcard[] = [
      // Card em ciclo medio (intervalo 6d, rep 3) -> proximaRevisao hoje
      baseCard(deckCardio.id, 'Qual o mecanismo de acao do Losartan?', 'Bloqueador do receptor AT1 da angiotensina II (BRA).',
        { intervalo: 6, repeticoes: 3, facilidade: 2.5, diasAte: 0 }),
      // Card maduro (intervalo 21d, rep 5) -> devido amanha
      baseCard(deckCardio.id, 'Qual classe a Amiodarona pertence?', 'Antiarritmico classe III - bloqueio de canais de K+.',
        { intervalo: 21, repeticoes: 5, facilidade: 2.6, diasAte: 1 }),
      // Card em aprendizado (2 repeticoes, 3d)
      baseCard(deckCardio.id, 'IECA e tosse seca: por que ocorre?', 'Acumulo de bradicinina pela inibicao da ECA.',
        { intervalo: 3, repeticoes: 2, facilidade: 2.5, diasAte: 2 }),
      // Card novo (nunca revisado)
      baseCard(deckCardio.id, 'Qual a dose inicial do Enalapril em HAS?', '5 mg/dia, podendo ser ajustada ate 40 mg/dia.',
        { intervalo: 0, repeticoes: 0, facilidade: 2.5, diasAte: 0 }),
      // Due hoje, intervalo medio
      baseCard(deckAnato.id, 'Por qual forame passa o nervo trigemeo V3?', 'Forame oval.',
        { intervalo: 10, repeticoes: 4, facilidade: 2.4, diasAte: 0 }),
      // Daqui 3 dias
      baseCard(deckAnato.id, 'Quais ossos compoem o nariz externo?', 'Nasais, frontal (parte), maxilas e cartilagens.',
        { intervalo: 4, repeticoes: 2, facilidade: 2.3, diasAte: 3 }),
      // Daqui 6 dias, maduro
      baseCard(deckAnato.id, 'O que passa pelo canal optico?', 'Nervo optico (II) e arteria oftalmica.',
        { intervalo: 15, repeticoes: 4, facilidade: 2.5, diasAte: 6 }),
      // Daqui 1 dia
      baseCard(deckMicro.id, 'Qual bacteria causa tuberculose?', 'Mycobacterium tuberculosis.',
        { intervalo: 6, repeticoes: 3, facilidade: 2.5, diasAte: 1 }),
      // Daqui 5 dias
      baseCard(deckMicro.id, 'Coloracao de Gram: gram-positivas coram de?', 'Roxo/violeta.',
        { intervalo: 8, repeticoes: 3, facilidade: 2.5, diasAte: 5 }),
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
      pendentes: [],
      codigoConvite: gerarCodigoConvite(),
      criadoEm: Date.now() - 7 * 86400000,
    };
    const grupoPrivado: Grupo = {
      id: gerarId('grp'),
      nome: 'Plantao HUSM - Emergencia',
      descricao: 'Discussao de casos do plantao de terca-feira.',
      donoId: user.id,
      requerAprovacao: true,
      membros: [user.id],
      pendentes: ['demo-candidato-1'],
      codigoConvite: gerarCodigoConvite(),
      criadoEm: Date.now() - 3 * 86400000,
    };

    await persistirDecks([deckCardio, deckAnato, deckMicro]);
    await persistirCards(novosCards);
    await persistirGrupos([grupoExemplo, grupoPrivado]);
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
        entrarPorCodigo,
        aprovarPendente,
        rejeitarPendente,
        sairDoGrupo,
        buscarGruposPublicos,
        buscarPerfis,
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
