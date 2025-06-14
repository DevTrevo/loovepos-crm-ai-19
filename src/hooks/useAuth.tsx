
import { useContext } from 'react';
import { AuthContext } from '@/components/auth/AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export AuthProvider for convenience
export { AuthProvider } from '@/components/auth/AuthProvider';
