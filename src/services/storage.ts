import AsyncStorage from '@react-native-async-storage/async-storage';
import { Configuracoes, Deck, Flashcard, Grupo, ReviewLog, User } from '../types';

const KEYS = {
  user: '@fc/user',
  decks: '@fc/decks',
  cards: '@fc/cards',
  grupos: '@fc/grupos',
  reviewLogs: '@fc/reviewLogs',
  config: '@fc/config',
};

const CONFIG_PADRAO: Configuracoes = {
  geminiApiKey: '',
  geminiModelo: 'gemini-3.1-pro-preview',
};

async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setItem<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getUser: () => getItem<User | null>(KEYS.user, null),
  setUser: (u: User | null) => setItem(KEYS.user, u),

  getDecks: () => getItem<Deck[]>(KEYS.decks, []),
  setDecks: (d: Deck[]) => setItem(KEYS.decks, d),

  getCards: () => getItem<Flashcard[]>(KEYS.cards, []),
  setCards: (c: Flashcard[]) => setItem(KEYS.cards, c),

  getGrupos: () => getItem<Grupo[]>(KEYS.grupos, []),
  setGrupos: (g: Grupo[]) => setItem(KEYS.grupos, g),

  getReviewLogs: () => getItem<ReviewLog[]>(KEYS.reviewLogs, []),
  setReviewLogs: (logs: ReviewLog[]) => setItem(KEYS.reviewLogs, logs),

  async getConfig(): Promise<Configuracoes> {
    const atual = await getItem<Partial<Configuracoes>>(KEYS.config, {});
    return { ...CONFIG_PADRAO, ...atual };
  },
  setConfig: (c: Configuracoes) => setItem(KEYS.config, c),

  async limpar() {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
