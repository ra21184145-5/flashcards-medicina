import { Flashcard, Qualidade } from '../types';

// Implementacao simplificada do algoritmo SM-2 (SuperMemo 2).
// Qualidade 0-2 = erro (reinicia o ciclo); 3-5 = acerto (avanca o intervalo).
export function calcularProximaRevisao(card: Flashcard, qualidade: Qualidade): Flashcard {
  let { intervalo, repeticoes, facilidade } = card;

  if (qualidade < 3) {
    repeticoes = 0;
    intervalo = 1;
  } else {
    if (repeticoes === 0) {
      intervalo = 1;
    } else if (repeticoes === 1) {
      intervalo = 3;
    } else {
      intervalo = Math.round(intervalo * facilidade);
    }
    repeticoes += 1;
  }

  // Atualiza o fator de facilidade
  facilidade = facilidade + (0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02));
  if (facilidade < 1.3) {
    facilidade = 1.3;
  }

  const proximaRevisao = Date.now() + intervalo * 24 * 60 * 60 * 1000;

  return {
    ...card,
    intervalo,
    repeticoes,
    facilidade,
    proximaRevisao,
  };
}

export function cardsParaRevisar(cards: Flashcard[]): Flashcard[] {
  const agora = Date.now();
  return cards.filter((c) => c.proximaRevisao <= agora);
}
