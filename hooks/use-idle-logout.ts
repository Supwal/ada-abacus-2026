
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const IDLE_TIMEOUT = 2 * 60 * 1000; // 2 minutos em milissegundos
const LAST_ACTIVITY_KEY = 'lastActivityTime';
const SESSION_ACTIVE_KEY = 'sessionActive';

export function useIdleLogout() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = useCallback(async () => {
    // Limpar flags de sessão
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_ACTIVE_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    }
    
    // Fazer logout
    await signOut({ redirect: false });
    router.push('/auth/login');
  }, [router]);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    
    // Salvar última atividade no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
    }

    // Limpar timeout anterior
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Criar novo timeout
    timeoutIdRef.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIMEOUT);
  }, [handleLogout]);

  const checkLastActivity = useCallback(() => {
    if (typeof window === 'undefined') return;

    const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
    const sessionActive = localStorage.getItem(SESSION_ACTIVE_KEY);

    // Se não há sessão ativa registrada mas o usuário está logado, 
    // inicializar a sessão (primeiro acesso após login)
    if (!sessionActive || sessionActive !== 'true') {
      // Inicializar a sessão ao invés de fazer logout
      localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      return;
    }

    if (lastActivityStr) {
      const lastActivity = parseInt(lastActivityStr, 10);
      const timeSinceLastActivity = Date.now() - lastActivity;

      // Se passou mais de 5 minutos, fazer logout
      if (timeSinceLastActivity > IDLE_TIMEOUT) {
        handleLogout();
      }
    }
  }, [handleLogout]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Só ativar se o usuário estiver logado
    if (!session) {
      return;
    }

    // Verificar última atividade ao montar
    checkLastActivity();

    // Eventos que indicam atividade do usuário
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Adicionar listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Configurar timer inicial
    resetTimer();

    // Quando app vai para background: salva hora de saída e para de contar atividade
    // Quando volta: verifica se passou mais de 2 minutos desde a saída
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Salva o momento exato que o usuário saiu
        if (typeof window !== 'undefined') {
          localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        }
        // Cancela o timer — o tempo passa mesmo sem eventos
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
      } else if (document.visibilityState === 'visible') {
        checkLastActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listener para quando a janela ganha foco
    const handleFocus = () => {
      checkLastActivity();
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [session, handleActivity, resetTimer, checkLastActivity]);

  // Nota: Removido o beforeunload que limpava SESSION_ACTIVE_KEY
  // pois causava logout indesejado ao recarregar a página
  // O timeout de inatividade de 5 minutos já é suficiente para segurança
}
