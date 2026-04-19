import { calcularProximaRevisao, cardsParaRevisar } from '../spacedRepetition';
import { Flashcard } from '../../types';

const UM_DIA_MS = 24 * 60 * 60 * 1000;

function cardBase(parcial: Partial<Flashcard> = {}): Flashcard {
  return {
    id: 'c1',
    deckId: 'd1',
    donoId: 'u1',
    frente: 'Qual o mecanismo de acao do Losartan?',
    verso: 'Bloqueador do receptor AT1.',
    criadoEm: Date.now(),
    intervalo: 0,
    repeticoes: 0,
    facilidade: 2.5,
    proximaRevisao: Date.now(),
    ...parcial,
  };
}

describe('calcularProximaRevisao (SM-2)', () => {
  it('card novo com acerto Bom (q=4) define intervalo inicial de 1 dia', () => {
    const res = calcularProximaRevisao(cardBase(), 4);
    expect(res.intervalo).toBe(1);
    expect(res.repeticoes).toBe(1);
  });

  it('segunda repeticao correta leva o intervalo para 3 dias', () => {
    const res = calcularProximaRevisao(
      cardBase({ repeticoes: 1, intervalo: 1 }),
      4
    );
    expect(res.intervalo).toBe(3);
    expect(res.repeticoes).toBe(2);
  });

  it('a partir da terceira repeticao o intervalo e multiplicado pelo fator de facilidade', () => {
    const card = cardBase({ repeticoes: 2, intervalo: 3, facilidade: 2.5 });
    const res = calcularProximaRevisao(card, 4);
    expect(res.intervalo).toBe(Math.round(3 * 2.5));
    expect(res.repeticoes).toBe(3);
  });

  it('erro (q<3) reinicia o ciclo para intervalo 1 e repeticoes 0', () => {
    const card = cardBase({ repeticoes: 4, intervalo: 20, facilidade: 2.4 });
    const res = calcularProximaRevisao(card, 1);
    expect(res.intervalo).toBe(1);
    expect(res.repeticoes).toBe(0);
  });

  it('fator de facilidade nunca cai abaixo de 1.3', () => {
    let card = cardBase({ facilidade: 1.3 });
    for (let i = 0; i < 10; i++) {
      card = calcularProximaRevisao(card, 0);
    }
    expect(card.facilidade).toBeGreaterThanOrEqual(1.3);
  });

  it('resposta Facil (q=5) aumenta o fator de facilidade', () => {
    const card = cardBase({ facilidade: 2.5 });
    const res = calcularProximaRevisao(card, 5);
    expect(res.facilidade).toBeGreaterThan(2.5);
  });

  it('resposta Dificil (q=3) reduz levemente o fator de facilidade', () => {
    const card = cardBase({ facilidade: 2.5 });
    const res = calcularProximaRevisao(card, 3);
    expect(res.facilidade).toBeLessThan(2.5);
  });

  it('a proxima revisao e agendada para o futuro de acordo com o intervalo', () => {
    const agora = Date.now();
    const res = calcularProximaRevisao(cardBase(), 4);
    const esperado = agora + 1 * UM_DIA_MS;
    // Tolerancia de alguns ms pela execucao
    expect(Math.abs(res.proximaRevisao - esperado)).toBeLessThan(500);
  });
});

describe('cardsParaRevisar', () => {
  it('inclui cartoes cuja proxima revisao ja passou', () => {
    const atrasado = cardBase({ id: 'a', proximaRevisao: Date.now() - UM_DIA_MS });
    const futuro = cardBase({ id: 'b', proximaRevisao: Date.now() + UM_DIA_MS });
    const lista = cardsParaRevisar([atrasado, futuro]);
    expect(lista.map((c) => c.id)).toEqual(['a']);
  });

  it('retorna array vazio quando nao ha cartoes devidos', () => {
    const futuro = cardBase({ proximaRevisao: Date.now() + UM_DIA_MS });
    expect(cardsParaRevisar([futuro])).toEqual([]);
  });
});
