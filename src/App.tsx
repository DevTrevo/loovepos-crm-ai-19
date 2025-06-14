
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PDV from "./pages/PDV";
import CRM from "./pages/CRM";
import EmailMarketing from "./pages/EmailMarketing";
import Ligacoes from "./pages/Ligacoes";
import Produtos from "./pages/Produtos";
import Categorias from "./pages/Categorias";
import Fornecedores from "./pages/Fornecedores";
import Estoque from "./pages/Estoque";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/pdv" element={
              <ProtectedRoute>
                <PDV />
              </ProtectedRoute>
            } />
            <Route path="/crm" element={
              <ProtectedRoute>
                <CRM />
              </ProtectedRoute>
            } />
            <Route path="/email-marketing" element={
              <ProtectedRoute>
                <EmailMarketing />
              </ProtectedRoute>
            } />
            <Route path="/ligacoes" element={
              <ProtectedRoute>
                <Ligacoes />
              </ProtectedRoute>
            } />
            <Route path="/produtos" element={
              <ProtectedRoute>
                <Produtos />
              </ProtectedRoute>
            } />
            <Route path="/categorias" element={
              <ProtectedRoute>
                <Categorias />
              </ProtectedRoute>
            } />
            <Route path="/fornecedores" element={
              <ProtectedRoute>
                <Fornecedores />
              </ProtectedRoute>
            } />
            <Route path="/estoque" element={
              <ProtectedRoute>
                <Estoque />
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <Relatorios />
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
