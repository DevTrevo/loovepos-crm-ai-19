
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useStockMovements } from "@/hooks/useStockMovements";
import { StockMovementForm } from "@/components/inventory/StockMovementForm";
import { StockMovementsTable } from "@/components/inventory/StockMovementsTable";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const Estoque = () => {
  const { data: products } = useProducts();
  const { data: movements, isLoading } = useStockMovements();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredMovements = movements?.filter(movement =>
    movement.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProducts = products?.filter(p => p.status === 'active') || [];
  const lowStockCount = activeProducts.filter(p => p.stock_quantity <= p.min_stock).length;
  const totalStockValue = activeProducts.reduce((total, product) => 
    total + (product.price * product.stock_quantity), 0
  );

  const recentInMovements = movements?.filter(m => 
    m.movement_type === 'in' && 
    new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length || 0;

  const recentOutMovements = movements?.filter(m => 
    m.movement_type === 'out' && 
    new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length || 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Controle de Estoque</h1>
                <p className="text-gray-600">Gerencie movimentações e níveis de estoque</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Movimentação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Registrar Movimentação</DialogTitle>
                  </DialogHeader>
                  <StockMovementForm onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total Estoque</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {totalStockValue.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entradas (7d)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{recentInMovements}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saídas (7d)</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{recentOutMovements}</div>
                </CardContent>
              </Card>
            </div>

            {lowStockCount > 0 && <LowStockAlert />}

            <Card>
              <CardHeader>
                <CardTitle>Movimentações Recentes</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Buscar movimentações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Carregando movimentações...</div>
                ) : (
                  <StockMovementsTable movements={filteredMovements || []} />
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Estoque;
