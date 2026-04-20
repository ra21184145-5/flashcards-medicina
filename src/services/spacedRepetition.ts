import { Flashcard, Qualidade } from '../types';

// Implementacao simplificada do algoritmo SM-2 (SuperMemo 2).
// Qualidade 0-2 = erro (reinicia o ciclo); 3-5 = acerto (avanca o intervalo).
// Para dar feedback visual util no preview dos botoes de resposta, aplicamos
// tambem um modificador de qualidade sobre o intervalo imediato (padrao Anki),
// alem do ajuste tradicional do fator de facilidade.
export function calcularProximaRevisao(card: Flashcard, qualidade: Qualidade): Flashcard {
  let { intervalo, repeticoes, facilidade } = card;

  if (qualidade < 3) {
    repeticoes = 0;
    intervalo = 1;
  } else {
    if (repeticoes === 0) {
      intervalo = qualidade === 5 ? 2 : 1;
    } else if (repeticoes === 1) {
      intervalo = qualidade === 3 ? 2 : qualidade === 5 ? 4 : 3;
    } else {
      const multiplicador =
        qualidade === 3 ? 1.2 : qualidade === 5 ? facilidade * 1.3 : facilidade;
      // Garante crescimento monotonico: intervalo nunca encolhe em acerto.
      intervalo = Math.max(intervalo + 1, Math.round(intervalo * multiplicador));
    }
    repeticoes += 1;
  }

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
