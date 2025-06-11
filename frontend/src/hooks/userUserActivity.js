// src/hooks/useUserActivity.js
import { useEffect } from 'react';

export function useUserActivity(onActive) {
  useEffect(() => {
    let timeout;

    const handleActivity = () => {
      onActive(); // chama função passada (ex: renovar token)
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // sem atividade após X milissegundos
        onActive(true); // true = sinaliza inatividade
      }, 30 * 60 * 1000); // 30 minutos
    };

    const events = ['mousemove', 'keydown', 'click'];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    handleActivity(); // iniciar contador já

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimeout(timeout);
    };
  }, [onActive]);
}
