# Plano de Execução — TCC II Bruno Osanes

## Objetivo final
Entregar na pasta `C:/Users/ludwi/Downloads/Nova pasta (5)/`:
1. **App funcional** em React Native Expo (pasta `flashcards-medicina/`), pronto para rodar e para push no GitHub
2. **Artigo TCC II** em .docx seguindo o template (pasta `artigo-tcc2/`), entre 10 e 12 páginas
3. **Imagens** geradas (diagrama UML + screenshots do app)
4. **INSTRUCOES-FINAIS.md** na raiz explicando o que o usuário precisa fazer pra finalizar

## Restrições e princípios
- Nível de aluno de graduação da Unicesumar (bom, não excepcional; texto com voz humana)
- Frontend pode ser bem acabado (usuário confirmou)
- Artigo deve evitar padrões típicos de IA (sem travessões longos, sem "Ademais/Cabe destacar", variar estrutura)
- Referências ABNT reais (obras que existem de verdade)
- NÃO fazer git push — só `git init` + commits locais; push só quando o usuário acordar

## Fases (em ordem — cada uma depende da anterior)

### Fase 1 — Código do app [EM ANDAMENTO]
Já feito:
- package.json, app.json, babel.config.js, tsconfig.json, index.ts
- types/, theme/colors.ts
- services/: spacedRepetition.ts, storage.ts, firebase.ts
- context/: AuthContext.tsx, DataContext.tsx

Falta:
- components/: Button.tsx, DeckCard.tsx, Chip.tsx, Header.tsx
- screens/: LoginScreen, RegisterScreen, HomeScreen, DeckDetailScreen, CreateDeckScreen, CreateFlashcardScreen, StudyScreen, GroupsScreen, GroupDetailScreen, PublicDecksScreen, ProfileScreen
- navigation/AppNavigator.tsx
- App.tsx (raiz)
- README.md

**Critério de saída:** todos os arquivos .ts/.tsx existem, o TypeScript compila sem erros quando instalado.

### Fase 2 — Instalar dependências
- `npm install` dentro de `flashcards-medicina/`
- Verificar se não quebra por causa do espaço em "Nova pasta (5)" — se quebrar, mover o projeto pra `C:/Users/ludwi/tcc-bruno/`
- Rodar `npx tsc --noEmit` pra validar sem erros

**Risco:** install demorado (5-10min) ou falha de resolução de deps
**Mitigação:** rodar em background, checar output; se falhar, ajustar versões

### Fase 3 — Rodar app no web e corrigir erros
- `npx expo start --web` em background
- Esperar bundle ficar pronto (~1-2 min)
- Abrir localhost no Playwright, verificar se carrega
- Se houver erros de runtime, corrigir e iterar

**Critério de saída:** app carrega no navegador, tela de login aparece

### Fase 4 — Semear dados + navegar e tirar screenshots
- Instalar Playwright Python: `pip install playwright && playwright install chromium`
- Setar viewport mobile (390x844 — iPhone 13/14 portrait)
- Script que: (1) abre app, (2) faz login, (3) chama `semearDadosExemplo()` via botão dedicado, (4) navega entre telas, (5) salva PNGs em `artigo-tcc2/imagens/`

Screenshots necessários:
- 01-login.png
- 02-home-decks.png (lista de baralhos)
- 03-criar-deck.png
- 04-deck-detail.png (cards do baralho)
- 05-criar-card.png
- 06-study.png (tela de revisão — frente do card)
- 07-study-resposta.png (verso + botões qualidade)
- 08-grupos.png
- 09-public-decks.png

### Fase 5 — Diagrama UML de caso de uso
- Gerar com Python + graphviz OU matplotlib
- Atores: Estudante, Médico, Administrador de Grupo
- Casos de uso: Cadastrar-se, Autenticar, Criar Baralho, Criar Flashcard, Revisar Flashcards, Criar Grupo, Entrar em Grupo, Compartilhar Baralho, Buscar Baralhos Públicos
- Export PNG em `artigo-tcc2/imagens/diagrama-caso-uso.png`

### Fase 6 — Escrever artigo
- Usar `python-docx` pra gerar .docx com formatação correta (Arial 12, justificado, espaço 1,5)
- Seguir estrutura do template EXATAMENTE
- Embutir imagens da Fase 4 e 5 no lugar certo
- Meta de páginas: 11 (alvo dentro do range 10-12)

Estrutura:
1. Cabeçalho (nome, título, cidade, data)
2. Resumo (um parágrafo, ~200 palavras, fonte 11)
3. Palavras-chave
4. INTRODUÇÃO (5 parágrafos)
5. ESPECIFICAÇÕES INICIAIS DO SOFTWARE (2.1, 2.2, 2.3 — 2 a 3 páginas)
6. METODOLOGIA (Kanban, 3-4 parágrafos)
7. DESENVOLVIMENTO (3-4 páginas):
   - 4.1 Diagrama de caso de uso (imagem + descrição)
   - 4.2 Arquitetura e tecnologias
   - 4.3 Implementação das funcionalidades (com trecho do SM-2)
   - 4.4 Telas do aplicativo (imagens + descrição curta de cada)
   - 4.5 Repositório do código
8. CONSIDERAÇÕES FINAIS (3-4 parágrafos)
9. REFERÊNCIAS (ABNT)

Referências reais planejadas:
- EBBINGHAUS (1885) — curva do esquecimento
- WOZNIAK & GORZELANCZYK (1994) — SM-2
- KARPICKE & ROEDIGER (2008) — retrieval practice (Science)
- SOMMERVILLE (2019) — Engenharia de Software
- PRESSMAN & MAXIM (2021) — Engenharia de Software
- MUNHOZ & FILHO (2019) — React Native Casa do Código
- ANDERSON (2010) — Kanban Alta Books
- MORONEY (2017) — Firebase Apress (ou doc oficial)
- SILVA (2021) — revisão espaçada em medicina (da bibliografia do TCC I)

### Fase 7 — Finalização
- Criar `artigo-tcc2/` na raiz com o .docx final
- Criar `INSTRUCOES-FINAIS.md` na raiz `Nova pasta (5)/` explicando:
  - Como exportar .docx → PDF no Word
  - Como criar repo no GitHub e dar push (comandos prontos)
  - Onde trocar `seu-usuario` pelo username real
- `git init` + primeiro commit dentro de `flashcards-medicina/`
- Atualizar CLAUDE.md com status final

## Ordem de prioridade se ficar sem tempo
1. (essencial) Código do app completo
2. (essencial) Artigo .docx completo com UML + repo link
3. (essencial) Pelo menos 4-5 screenshots principais (login, home, criar card, study)
4. (nice) Todos os 9 screenshots
5. (nice) Polimento extra no artigo

## Decisões já tomadas (sem consulta)
- Nome do autor: **Bruno Ubirajara Torres Osanes** (do TCC I)
- Cidade/data: **Santa Maria - RS, Abril/2026**
- GitHub URL placeholder: `https://github.com/seu-usuario/flashcards-medicina`
- Título: **"Desenvolvimento de um Aplicativo Mobile de Flashcards com Revisão Espaçada para Estudantes e Profissionais de Medicina"**
- Paleta: azul #1F6FEB (primário) + verde #11B981 (acento)
- Algoritmo: SM-2 simplificado (clássico, bem documentado, fácil de justificar)
