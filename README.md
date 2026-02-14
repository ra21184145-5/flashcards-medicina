# Flashcards Medicina

Aplicativo Android de flashcards com revisão espaçada, voltado a estudantes e profissionais de medicina. Permite criar baralhos personalizados, organizar flashcards, estudar com intervalos calculados automaticamente e compartilhar conteúdo em grupos de estudo ou publicamente.

Este repositório faz parte do **TCC II** do curso de Engenharia de Software da Unicesumar (autor: Bruno Ubirajara Torres Osanes).

## Funcionalidades

- Cadastro e login de usuário
- Criação e organização de baralhos (privado, grupo, público)
- Criação de flashcards (pergunta e resposta)
- Revisão com algoritmo **SM-2 simplificado** (SuperMemo 2)
- Grupos de estudo abertos ou com aprovação
- Navegação por abas (Início, Grupos, Explorar, Perfil)

## Stack

- **React Native** (Expo SDK 51) com TypeScript
- **React Navigation** (stack + bottom tabs)
- **AsyncStorage** para persistência local (modo de desenvolvimento)
- **Firebase** (Authentication + Firestore) — preparado para uso em produção; ativa-se automaticamente quando as variáveis de ambiente estão preenchidas
- Algoritmo **SM-2** em `src/services/spacedRepetition.ts`

## Estrutura de pastas

```
flashcards-medicina/
├── App.tsx
├── index.ts
├── package.json
├── src/
│   ├── components/        # Button, Card, Input, Chip, EmptyState
│   ├── context/           # AuthContext, DataContext
│   ├── navigation/        # AppNavigator (Stack + Tabs)
│   ├── screens/           # Telas do app
│   ├── services/          # spacedRepetition, storage, firebase
│   ├── theme/             # paleta e espaçamentos
│   └── types/             # tipos compartilhados
└── README.md
```

## Como rodar

Pré-requisitos: Node.js 18+, npm.

```bash
npm install
npx expo start
```

Abrir no celular via app **Expo Go** (escanear QR code) ou pressionar `w` no terminal para rodar no navegador.

## Configurar Firebase (opcional)

Criar um arquivo `.env` na raiz com as chaves do seu projeto Firebase:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Sem o `.env` o aplicativo segue funcionando em modo local (AsyncStorage).

## Licença

Projeto acadêmico. Uso livre para fins educacionais.
