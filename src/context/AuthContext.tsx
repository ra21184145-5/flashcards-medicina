import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { cloudSync } from '../services/cloudSync';
import { storage } from '../services/storage';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  entrarComGoogle: (idToken: string) => Promise<void>;
  entrarComoDemo: () => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapear(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    nome: fbUser.displayName ?? (fbUser.email ?? '').split('@')[0],
  };
}

function traduzirErro(e: any): Error {
  const code: string | undefined = e?.code;
  const mapa: Record<string, string> = {
    'auth/invalid-credential': 'E-mail ou senha invalidos.',
    'auth/invalid-email': 'E-mail invalido.',
    'auth/user-not-found': 'Usuario nao encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/email-already-in-use': 'Este e-mail ja esta em uso.',
    'auth/weak-password': 'A senha deve ter ao menos 6 caracteres.',
    'auth/network-request-failed': 'Falha de rede. Verifique sua conexao.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente em alguns minutos.',
  };
  if (code && mapa[code]) return new Error(mapa[code]);
  if (e instanceof Error) return e;
  return new Error('Erro desconhecido.');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Restaura usuario demo do cache local (nao passa por Firebase).
    (async () => {
      const cached = await storage.getUser();
      if (cached && cached.id.startsWith('demo-')) {
        setUser(cached);
        setCarregando(false);
      }
    })();

    // onAuthStateChanged dispara na inicializacao com o estado restaurado
    // do AsyncStorage, permitindo manter o usuario logado entre sessoes.
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const u = mapear(fbUser);
        await storage.setUser(u);
        setUser(u);
      } else {
        // So limpa se o usuario atual nao for demo.
        const cached = await storage.getUser();
        if (!cached || !cached.id.startsWith('demo-')) {
          await storage.setUser(null);
          setUser(null);
        }
      }
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  async function entrar(email: string, senha: string) {
    if (!email || !senha) {
      throw new Error('Informe email e senha.');
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
    } catch (e) {
      throw traduzirErro(e);
    }
    // A sincronizacao dos dados fica a cargo do DataContext, que reage
    // a mudanca do usuario e puxa o estado remoto para o cache local.
  }

  async function cadastrar(nome: string, email: string, senha: string) {
    if (!nome || !email || !senha) {
      throw new Error('Preencha todos os campos.');
    }
    if (senha.length < 6) {
      throw new Error('A senha deve ter ao menos 6 caracteres.');
    }
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
    } catch (e) {
      throw traduzirErro(e);
    }
    try {
      await updateProfile(cred.user, { displayName: nome });
      await cloudSync.salvarPerfilUsuario(cred.user.uid, nome, cred.user.email ?? email);
    } catch (e) {
      console.warn('Falha ao salvar perfil remoto:', e);
    }
  }

  async function entrarComGoogle(idToken: string) {
    if (!idToken) throw new Error('Token do Google nao foi recebido.');
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const cred = await signInWithCredential(auth, credential);
      // Na primeira vez que o usuario entra com Google, salva o perfil no Firestore
      // para que o nome aparece na exploracao de baralhos publicos.
      const nome = cred.user.displayName ?? (cred.user.email ?? '').split('@')[0];
      await cloudSync.salvarPerfilUsuario(cred.user.uid, nome, cred.user.email ?? '');
    } catch (e) {
      throw traduzirErro(e);
    }
  }

  async function entrarComoDemo() {
    // Modo demo: usuario local sem Firebase. Util para a banca avaliadora
    // e para capturas de tela automatizadas. Nao sincroniza com nuvem.
    const demo: User = {
      id: `demo-${Date.now().toString(36)}`,
      email: 'demo@flashcards.local',
      nome: 'Convidado',
    };
    await storage.setUser(demo);
    setUser(demo);
    setCarregando(false);
  }

  async function sair() {
    // Se for usuario demo (sem Firebase), so limpa o cache local.
    if (user?.id.startsWith('demo-')) {
      await storage.limpar();
      setUser(null);
      return;
    }
    await signOut(auth);
    await storage.limpar();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        carregando,
        entrar,
        cadastrar,
        entrarComGoogle,
        entrarComoDemo,
        sair,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}
