import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck, Flashcard, Grupo, User } from '../types';

const KEYS = {
  user: '@fc/user',
  decks: '@fc/decks',
  cards: '@fc/cards',
  grupos: '@fc/grupos',
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

  async limpar() {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
