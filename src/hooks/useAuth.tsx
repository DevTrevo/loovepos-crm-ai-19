
import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/components/auth/AuthProvider';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export AuthProvider para conveniência
export { AuthProvider } from '@/components/auth/AuthProvider';
