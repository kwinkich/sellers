import WebApp from '@twa-dev/sdk';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType, useNavigate } from 'react-router-dom';
import { isRootPath } from '@/app/navigation/root-paths';

type NavType = ReturnType<typeof useNavigationType>;

export function TelegramBackSync({ closeOnRootBack = false }: { closeOnRootBack?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navType: NavType = useNavigationType();
  const stackRef = useRef<string[]>([location.pathname + location.search]);

  // click handler на кнопку в хедере Телеграма
  useEffect(() => {
    const onBack = () => {
      const canGoBack = stackRef.current.length > 1;
      if (canGoBack) {
        navigate(-1);
      } else if (closeOnRootBack) {
        try { WebApp.close(); } catch {}
      }
    };

    if (WebApp?.BackButton) {
      WebApp.BackButton.onClick(onBack);
      return () => {
        try { WebApp.BackButton.offClick(onBack); } catch {}
      };
    }
  }, [navigate, closeOnRootBack]);

  // Ведём свой мини-стек и показываем/прячем кнопку
  useEffect(() => {
    const path = location.pathname + location.search;

    if (navType === 'PUSH') {
      if (stackRef.current[stackRef.current.length - 1] !== path) {
        stackRef.current.push(path);
      }
    } else if (navType === 'POP') {
      // защищаемся от «лишних» POP (на всякий)
      if (stackRef.current.length > 1) stackRef.current.pop();
    } else if (navType === 'REPLACE') {
      stackRef.current[stackRef.current.length - 1] = path;
    }

    const atRoot = isRootPath(location.pathname) || stackRef.current.length <= 1;
    if (WebApp?.BackButton) {
      if (atRoot) WebApp.BackButton.hide();
      else WebApp.BackButton.show();
    }
  }, [location, navType]);

  return null;
}
