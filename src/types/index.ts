export type Privacy = 'privado' | 'publico' | 'grupo';

export interface User {
  id: string;
  email: string;
  nome: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  donoId: string;
  frente: string;
  verso: string;
  criadoEm: number;
  // Campos do algoritmo de revisao espacada (SM-2 simplificado)
  intervalo: number; // dias ate a proxima revisao
  repeticoes: number;
  facilidade: number; // easiness factor
  proximaRevisao: number; // timestamp
}

export interface Deck {
  id: string;
  nome: string;
  descricao: string;
  donoId: string;
  privacidade: Privacy;
  grupoId?: string;
  criadoEm: number;
  totalCards: number;
}

export interface Grupo {
  id: string;
  nome: string;
  descricao: string;
  donoId: string;
  requerAprovacao: boolean;
  membros: string[];
  pendentes: string[]; // usuarios aguardando aprovacao (somente relevante em requerAprovacao=true)
  codigoConvite: string; // 6 caracteres alfanumericos, compartilhavel
  criadoEm: number;
}

export type Qualidade = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  donoId: string;
  qualidade: Qualidade;
  timestamp: number;
}

export interface Configuracoes {
  geminiApiKey: string;
  geminiModelo: string;
}
