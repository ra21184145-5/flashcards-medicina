// Servico de geracao de flashcards via LLM (Google Gemini).
// Usa a API REST publica para manter a implementacao portatil e sem
// dependencia de SDKs nativos. A chave de API e o modelo sao passados
// pelo chamador, normalmente lidos da tela de Configuracoes.

export type EstiloCard = 'conciso' | 'explicativo';
export type FormatoCard = 'qa' | 'cloze';

export interface OpcoesGeracao {
  material: string;
  quantidade: number;
  estilo: EstiloCard;
  formato: FormatoCard;
  idioma?: 'pt' | 'en';
  apiKey: string;
  modelo?: string;
}

export interface CardGerado {
  frente: string;
  verso: string;
}

const MODELO_PADRAO = 'gemini-2.5-pro';
const LIMITE_MATERIAL_CHARS = 60_000;

const INSTRUCAO_BASE = `Voce e um tutor especializado em elaborar flashcards de estudo \
para estudantes e profissionais de medicina. Seu foco e criar cartoes que \
estimulem a evocacao ativa (retrieval practice), evitando respostas triviais \
e priorizando fatos clinicamente relevantes.`;

function instrucaoFormato(formato: FormatoCard): string {
  if (formato === 'cloze') {
    return `FORMATO: cloze deletion. Cada cartao tem a forma de uma frase \
completa contendo um trecho entre chaves duplas que marca a lacuna a ser \
evocada. Exemplo: "O bloqueador do receptor AT1 da angiotensina II e o \
{{Losartan}}, usado no tratamento de hipertensao." O campo "frente" deve \
conter a frase completa COM a lacuna {{...}} destacada. O campo "verso" \
deve conter apenas o termo ou trecho que preenche a lacuna, sem as chaves.`;
  }
  return `FORMATO: pergunta e resposta. O campo "frente" deve conter uma \
pergunta direta e especifica. O campo "verso" deve conter a resposta. Evite \
frases do tipo "o que e X?" quando puder ser mais especifico (ex.: "qual o \
mecanismo de acao de X?").`;
}

function instrucaoEstilo(estilo: EstiloCard): string {
  if (estilo === 'explicativo') {
    return `ESTILO: explicativo. As respostas podem ter ate 3 linhas e devem \
incluir o conceito principal seguido de uma breve justificativa ou nota \
clinica relevante.`;
  }
  return `ESTILO: conciso. As respostas devem ser diretas, preferencialmente \
em uma unica linha, priorizando o termo tecnico correto.`;
}

function montarPrompt(opts: OpcoesGeracao): string {
  const idioma = opts.idioma === 'en' ? 'ingles' : 'portugues do Brasil';
  const material = opts.material.slice(0, LIMITE_MATERIAL_CHARS);

  return `${INSTRUCAO_BASE}

${instrucaoFormato(opts.formato)}

${instrucaoEstilo(opts.estilo)}

IDIOMA: ${idioma}. Mantenha os termos tecnicos em seu idioma original \
quando isso preservar a precisao (nomes de drogas, siglas, eponimos).

REGRAS IMPORTANTES:
- Gere exatamente ${opts.quantidade} cartoes distintos e nao-redundantes.
- Cada cartao deve cobrir um conceito diferente.
- Nao invente informacoes que nao estejam no material. Se o material for \
insuficiente, priorize os conceitos mais solidos.
- Nao inclua comentarios fora do JSON.

Responda APENAS com um objeto JSON valido, sem comentarios, sem markdown, \
sem cercas de codigo, no formato:
{"cards": [{"frente": "...", "verso": "..."}]}

MATERIAL DE ESTUDO:
"""
${material}
"""`;
}

function extrairJson(texto: string): unknown {
  const limpo = texto.trim();

  // Alguns modelos ainda cercam a resposta com ```json ... ``` mesmo quando
  // o responseMimeType esta configurado. Tentamos cobrir esses casos.
  const semMarkdown = limpo.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  try {
    return JSON.parse(semMarkdown);
  } catch {
    // Segunda tentativa: extrair o primeiro bloco {...} do texto.
    const inicio = semMarkdown.indexOf('{');
    const fim = semMarkdown.lastIndexOf('}');
    if (inicio >= 0 && fim > inicio) {
      return JSON.parse(semMarkdown.slice(inicio, fim + 1));
    }
    throw new Error('A resposta do modelo nao e um JSON valido.');
  }
}

function validarCards(bruto: unknown, quantidade: number): CardGerado[] {
  if (!bruto || typeof bruto !== 'object' || !('cards' in bruto)) {
    throw new Error('Resposta sem o campo "cards".');
  }
  const lista = (bruto as { cards: unknown }).cards;
  if (!Array.isArray(lista)) {
    throw new Error('O campo "cards" deve ser uma lista.');
  }

  const cards: CardGerado[] = [];
  for (const item of lista) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as any).frente === 'string' &&
      typeof (item as any).verso === 'string' &&
      (item as any).frente.trim() &&
      (item as any).verso.trim()
    ) {
      cards.push({
        frente: (item as any).frente.trim(),
        verso: (item as any).verso.trim(),
      });
    }
  }

  if (cards.length === 0) {
    throw new Error('A resposta nao trouxe nenhum cartao valido.');
  }
  // Se o modelo gerou mais do que pedimos, cortamos ao limite.
  return cards.slice(0, quantidade);
}

export async function gerarFlashcardsComIA(opts: OpcoesGeracao): Promise<CardGerado[]> {
  if (!opts.apiKey || !opts.apiKey.trim()) {
    throw new Error('API key do Gemini nao configurada. Abra Configuracoes e cole sua chave.');
  }
  if (!opts.material || opts.material.trim().length < 20) {
    throw new Error('O material fornecido esta muito curto. Cole um texto com mais conteudo.');
  }
  if (opts.quantidade < 1 || opts.quantidade > 50) {
    throw new Error('Quantidade invalida. Escolha entre 1 e 50 cartoes.');
  }

  const modelo = opts.modelo?.trim() || MODELO_PADRAO;
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}` +
    `:generateContent?key=${encodeURIComponent(opts.apiKey)}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: montarPrompt(opts) }],
      },
    ],
    generationConfig: {
      temperature: 0.5,
      topP: 0.9,
      responseMimeType: 'application/json',
    },
  };

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(
      'Falha ao contatar a API do Gemini. Verifique a conexao e tente novamente.'
    );
  }

  if (!resposta.ok) {
    const textoErro = await resposta.text().catch(() => '');
    const detalhe = textoErro.slice(0, 300) || `HTTP ${resposta.status}`;
    if (resposta.status === 400) {
      throw new Error(`Requisicao recusada pela API. Verifique se o modelo "${modelo}" existe.`);
    }
    if (resposta.status === 401 || resposta.status === 403) {
      throw new Error('Chave de API invalida ou sem permissao para este modelo.');
    }
    if (resposta.status === 429) {
      throw new Error('Limite de uso atingido. Aguarde um instante e tente novamente.');
    }
    throw new Error(`Erro da API (${resposta.status}): ${detalhe}`);
  }

  const dados = (await resposta.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };

  if (dados.promptFeedback?.blockReason) {
    throw new Error(`A API bloqueou a geracao: ${dados.promptFeedback.blockReason}`);
  }

  const texto = dados.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) {
    throw new Error('A API nao retornou conteudo textual.');
  }

  const bruto = extrairJson(texto);
  return validarCards(bruto, opts.quantidade);
}

// Exportado para uso em testes ou outros consumidores.
export const __internal = { montarPrompt, extrairJson, validarCards };
