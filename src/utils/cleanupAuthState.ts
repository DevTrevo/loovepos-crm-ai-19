
/**
 * Limpa todos os tokens do Supabase do localStorage e sessionStorage 
 * para evitar "limbo" de autenticação
 */
export const cleanupAuthState = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
    // Em casos antigos:
    localStorage.removeItem('supabase.auth.token');
  } catch (err) {
    // Evitar erros silenciosos
    console.warn("Falha ao limpar local/sessionStorage Supabase", err);
  }
};
