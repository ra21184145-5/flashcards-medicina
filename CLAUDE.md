# CLAUDE.md — Notas de contexto do projeto

## Contexto do trabalho
- **Aluno:** Bruno Ubirajara Torres Osanes
- **Curso:** Engenharia de Software — Unicesumar (EaD)
- **Cidade:** Santa Maria - RS (mesma do TCC I)
- **Data de entrega:** Abril/2026 (hoje = 2026-04-18)
- **Disciplina:** TCC II — entrega é o **artigo final em PDF**, 10–12 páginas

## Projeto
Aplicativo Android de **flashcards com revisão espaçada** para estudantes e médicos. Baseado 100% no TCC I (`TCC I - ESPECIFICAÇÃO DE SOFTWARE - BRUNO OSANES.pdf`). Template seguido: `Template Artigo de TCC - Desenvolvimento de Software.docx`.

## Estrutura pós-entrega
```
Nova pasta (5)/
├── flashcards-medicina/         # código-fonte do app React Native Expo
│   ├── src/
│   ├── package.json
│   └── README.md
├── artigo-tcc2/                 # artigo final em .docx + PDF
│   ├── TCC II - Bruno Osanes.docx
│   └── imagens/
│       ├── diagrama-caso-uso.png
│       ├── tela-login.png
│       ├── tela-home.png
│       └── ...
└── INSTRUCOES-FINAIS.md         # passo-a-passo pro usuário concluir
```

## Decisões técnicas
- **Expo** (managed workflow) — o template suporta web e Android
- **AsyncStorage** como storage durante dev (permite rodar sem Firebase configurado)
- **Firebase** (`src/services/firebase.ts`) preparado com init condicional — só ativa se env vars estiverem preenchidas
- **SM-2 simplificado** como algoritmo de revisão espaçada (`src/services/spacedRepetition.ts`)
- **TypeScript** strict
- **React Navigation** (stack + bottom tabs)
- **Paleta:** azul (#1F6FEB) / verde (#11B981) — estética médica/educação
- Textos/labels em **português** (a UI do produto final é PT-BR)

## Tom do artigo
- Aluno **Unicesumar** — texto bom mas HUMANO, não muito polido
- **Evitar** padrões claros de IA: "Ademais", "Cabe destacar", "É importante ressaltar", travessões longos (—), parágrafos iniciando todos com conector igual
- Usar estrutura simples, frases variadas, algumas pequenas imperfeições naturais
- Referências ABNT reais (SM-2 Wozniak, Ebbinghaus curve, livros de React Native/Firebase/Kanban)

## O que o usuário precisa fazer no final (deixado em INSTRUCOES-FINAIS.md)
1. Criar repositório no GitHub, executar os comandos `git remote add` e `git push` (já escritos)
2. Abrir o .docx no Word → Arquivo → Exportar como PDF
3. Trocar `seu-usuario` no README.md e no artigo pelo username real do GitHub (search/replace)

## Status das tarefas
(ver TaskList do Claude)
