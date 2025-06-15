
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cleanupAuthState } from "@/utils/cleanupAuthState";

export const LogoutButton = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Fallback extra: Se algo der errado, faz limpeza manual e força logout novamente
      setTimeout(() => {
        cleanupAuthState();
        window.location.href = "/auth";
      }, 500);
    } catch (error) {
      cleanupAuthState();
      window.location.href = "/auth";
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout}
      className="w-full justify-start"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sair
    </Button>
  );
};
