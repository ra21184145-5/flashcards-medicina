import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    storage.getUser().then((u) => {
      setUser(u);
      setCarregando(false);
    });
  }, []);

  async function entrar(email: string, senha: string) {
    // Validacao simples. Em producao usamos Firebase Auth com email/senha ou Google.
    if (!email || !senha) {
      throw new Error('Informe email e senha.');
    }
    const novoUser: User = {
      id: email.toLowerCase(),
      email: email.toLowerCase(),
      nome: email.split('@')[0],
    };
    await storage.setUser(novoUser);
    setUser(novoUser);
  }

  async function cadastrar(nome: string, email: string, senha: string) {
    if (!nome || !email || !senha) {
      throw new Error('Preencha todos os campos.');
    }
    if (senha.length < 6) {
      throw new Error('A senha deve ter ao menos 6 caracteres.');
    }
    const novoUser: User = {
      id: email.toLowerCase(),
      email: email.toLowerCase(),
      nome,
    };
    await storage.setUser(novoUser);
    setUser(novoUser);
  }

  async function sair() {
    await storage.setUser(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, carregando, entrar, cadastrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}
