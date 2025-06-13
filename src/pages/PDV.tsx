
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User,
  CreditCard,
  ShoppingCart
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const PDV = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("");

  const products: Product[] = [
    { id: 1, name: "Whey Protein", price: 89.90, category: "Suplemento", stock: 15 },
    { id: 2, name: "Creatina", price: 45.50, category: "Suplemento", stock: 22 },
    { id: 3, name: "Shampoo Fortificante", price: 28.90, category: "Cosmético", stock: 8 },
    { id: 4, name: "Vitamina D", price: 32.00, category: "Vitamina", stock: 30 },
    { id: 5, name: "Óleo de Coco", price: 24.90, category: "Natural", stock: 12 },
    { id: 6, name: "Colágeno", price: 67.80, category: "Suplemento", stock: 18 }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const getTotalValue = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const finalizeSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Venda finalizada!",
      description: `Venda de R$ ${getTotalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })} finalizada com sucesso.`,
    });

    // Reset do carrinho e cliente
    setCart([]);
    setSelectedClient("");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 bg-gray-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">PDV - Ponto de Venda</h1>
                  <p className="text-gray-600">Sistema de vendas integrado</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Produtos */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Produtos
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => addToCart(product)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{product.name}</h3>
                            <Badge variant="secondary">{product.category}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-bold text-green-600">
                              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-gray-600">Estoque: {product.stock}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Carrinho */}
              <div className="space-y-6">
                {/* Cliente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="CPF, Email ou Telefone"
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                    />
                  </CardContent>
                </Card>

                {/* Carrinho */}
                <Card>
                  <CardHeader>
                    <CardTitle>Carrinho de Compras</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cart.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Carrinho vazio</p>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-green-600">
                              R$ {getTotalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={finalizeSale}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Finalizar Venda
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PDV;
