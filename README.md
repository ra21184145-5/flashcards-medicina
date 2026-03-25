# Flashcards Medicina

Aplicativo Android de flashcards com revisão espaçada, voltado a estudantes e profissionais de medicina. Permite criar baralhos personalizados, organizar flashcards, estudar com intervalos calculados automaticamente e compartilhar conteúdo em grupos de estudo ou publicamente, com sincronização em nuvem via Firebase.

Este repositório faz parte do **TCC II** do curso de Engenharia de Software da Unicesumar (autor: Bruno Ubirajara Torres Osanes).

## Acesso rápido

- **App web (sem instalar):** https://flashcards-medicina.web.app
- **APK Android:** [Releases → v1.0.0](https://github.com/brunoosanes/flashcards-medicina/releases/latest)
- **Modo demo:** na tela de login, toque em *"Explorar como convidado"* para testar sem cadastro.

## Funcionalidades

- Cadastro e login com Firebase Authentication (e-mail e senha)
- Sincronização em nuvem via Firestore (offline-first com cache local)
- Criação, edição e exclusão de baralhos (privado, grupo, público)
- Criação, edição e exclusão de flashcards (pergunta e resposta)
- Revisão com algoritmo **SM-2 simplificado** (SuperMemo 2)
- Geração assistida de cartões por IA (Google Gemini)
- Grupos de estudo abertos ou com aprovação
- Estatísticas de estudo (streak, taxa de acerto, gráfico semanal, maturidade)
- Exploração de baralhos públicos compartilhados pela comunidade

## Stack

- **React Native** (Expo SDK 51) com TypeScript
- **React Navigation** (stack + bottom tabs)
- **Firebase** — Authentication (e-mail/senha) e Firestore
- **AsyncStorage** — cache local offline-first
- **Google Gemini API** — geração assistida de flashcards
- **Jest** — testes unitários do algoritmo SM-2
- Algoritmo **SM-2** em `src/services/spacedRepetition.ts`

## Estrutura de pastas

```
flashcards-medicina/
├── App.tsx
├── index.ts
├── firestore.rules        # Regras de seguranca do Firestore
├── package.json
├── src/
│   ├── components/        # Button, Card, Input, Chip, EmptyState
│   ├── context/           # AuthContext, DataContext
│   ├── navigation/        # AppNavigator (Stack + Tabs)
│   ├── screens/           # 14 telas do app
│   ├── services/          # spacedRepetition, storage, firebase,
│   │                      # cloudSync, aiGenerator
│   ├── theme/             # paleta e espacamentos
│   └── types/             # tipos compartilhados
└── README.md
```

## Arquitetura de dados

O app segue um modelo **offline-first**:

1. **Leitura:** o cache local (AsyncStorage) responde imediatamente à UI; em seguida, o estado remoto é puxado do Firestore e sobrepõe o local.
2. **Escrita:** write-through — a alteração grava primeiro no cache (resposta instantânea) e depois é propagada ao Firestore por um mecanismo de diff que envia apenas o que mudou (create/update/delete).
3. **Segurança:** regras do Firestore em `firestore.rules` garantem que cada usuário só acesse os próprios dados; baralhos públicos são legíveis por qualquer autenticado.

## Como rodar

Pré-requisitos: Node.js 18+, npm.

```bash
npm install
npx expo start
```

Abrir no celular via app **Expo Go** (escanear QR code) ou pressionar `w` no terminal para rodar no navegador.

## Testes

```bash
npm test
```

10 casos cobrem a função central do algoritmo SM-2 (primeira revisão, repetições sucessivas, reinício de ciclo, piso do fator de facilidade, filtragem de cartões devidos).

## Geração por IA

A chave da API Google Gemini é informada pelo próprio usuário na tela de Configurações dentro do app e fica armazenada apenas localmente (AsyncStorage). Modelos suportados: `gemini-3.1-pro-preview` (padrão) e `gemini-3-flash-preview`.

## Licença

Projeto acadêmico. Uso livre para fins educacionais.
