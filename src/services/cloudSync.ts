import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { Configuracoes, Deck, Flashcard, Grupo, ReviewLog } from '../types';

// Estrategia offline-first:
// - AsyncStorage (via storage.ts) continua sendo a fonte local de leitura.
// - Cada escrita local dispara um push para o Firestore em segundo plano.
// - No login, puxamos os dados do usuario do Firestore para o AsyncStorage.
// - Falhas de rede sao registradas em console mas nao interrompem o app.

type ComId = { id: string };

async function syncArrayDiff<T extends ComId>(
  colecao: string,
  antigos: T[],
  novos: T[]
): Promise<void> {
  const mapaAntigo = new Map(antigos.map((x) => [x.id, x]));
  const mapaNovo = new Map(novos.map((x) => [x.id, x]));

  const operacoes: Promise<void>[] = [];

  for (const [id, item] of mapaNovo) {
    const anterior = mapaAntigo.get(id);
    if (!anterior || JSON.stringify(anterior) !== JSON.stringify(item)) {
      operacoes.push(setDoc(doc(db, colecao, id), item as any));
    }
  }

  for (const [id] of mapaAntigo) {
    if (!mapaNovo.has(id)) {
      operacoes.push(deleteDoc(doc(db, colecao, id)));
    }
  }

  await Promise.all(operacoes);
}

export const cloudSync = {
  async syncDecks(antigos: Deck[], novos: Deck[]) {
    return syncArrayDiff('decks', antigos, novos);
  },

  async syncCards(antigos: Flashcard[], novos: Flashcard[]) {
    return syncArrayDiff('cards', antigos, novos);
  },

  async syncGrupos(antigos: Grupo[], novos: Grupo[]) {
    return syncArrayDiff('grupos', antigos, novos);
  },

  async syncReviewLogs(antigos: ReviewLog[], novos: ReviewLog[]) {
    return syncArrayDiff('reviewLogs', antigos, novos);
  },

  async syncConfig(uid: string, config: Configuracoes) {
    // Nao persistimos a chave da API Gemini no Firestore por ser sensivel,
    // apenas o modelo escolhido.
    const { geminiApiKey, ...publico } = config;
    await setDoc(doc(db, 'users', uid), { config: publico }, { merge: true });
  },

  async pullUserData(uid: string) {
    const [decksSnap, cardsSnap, gruposSnap, logsSnap, userSnap] = await Promise.all([
      getDocs(query(collection(db, 'decks'), where('donoId', '==', uid))),
      getDocs(query(collection(db, 'cards'), where('donoId', '==', uid))),
      getDocs(query(collection(db, 'grupos'), where('membros', 'array-contains', uid))),
      getDocs(query(collection(db, 'reviewLogs'), where('donoId', '==', uid))),
      getDoc(doc(db, 'users', uid)),
    ]);

    return {
      decks: decksSnap.docs.map((d) => d.data() as Deck),
      cards: cardsSnap.docs.map((d) => d.data() as Flashcard),
      grupos: gruposSnap.docs.map((d) => d.data() as Grupo),
      reviewLogs: logsSnap.docs.map((d) => d.data() as ReviewLog),
      configRemoto: userSnap.exists() ? (userSnap.data().config as Partial<Configuracoes> | undefined) : undefined,
    };
  },

  async listarDecksPublicos(): Promise<Deck[]> {
    const snap = await getDocs(query(collection(db, 'decks'), where('privacidade', '==', 'publico')));
    return snap.docs.map((d) => d.data() as Deck);
  },

  async salvarPerfilUsuario(uid: string, nome: string, email: string) {
    await setDoc(
      doc(db, 'users', uid),
      { profile: { nome, email, criadoEm: Date.now() } },
      { merge: true }
    );
  },
};
