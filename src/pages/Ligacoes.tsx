
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, 
  PhoneCall, 
  Clock, 
  CheckCircle,
  XCircle,
  Calendar,
  Mic,
  MicOff
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

interface Call {
  id: number;
  clientName: string;
  clientPhone: string;
  status: 'scheduled' | 'completed' | 'missed' | 'in-progress';
  scheduledTime: string;
  duration?: number;
  notes?: string;
  result?: 'sale' | 'follow-up' | 'not-interested';
}

const Ligacoes = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [callNotes, setCallNotes] = useState("");

  const calls: Call[] = [
    {
      id: 1,
      clientName: "Maria Silva",
      clientPhone: "(11) 99999-1111",
      status: 'scheduled',
      scheduledTime: "2024-06-13 14:30"
    },
    {
      id: 2,
      clientName: "João Santos",
      clientPhone: "(11) 99999-2222",
      status: 'completed',
      scheduledTime: "2024-06-13 10:00",
      duration: 8,
      result: 'sale',
      notes: "Cliente interessado em whey protein. Venda finalizada por R$ 89,90."
    },
    {
      id: 3,
      clientName: "Ana Costa",
      clientPhone: "(11) 99999-3333",
      status: 'missed',
      scheduledTime: "2024-06-12 16:00"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Realizada';
      case 'missed': return 'Perdida';
      case 'in-progress': return 'Em Andamento';
      default: return status;
    }
  };

  const getResultColor = (result?: string) => {
    switch (result) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'follow-up': return 'bg-blue-100 text-blue-800';
      case 'not-interested': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultLabel = (result?: string) => {
    switch (result) {
      case 'sale': return 'Venda';
      case 'follow-up': return 'Follow-up';
      case 'not-interested': return 'Não Interessado';
      default: return '';
    }
  };

  const startCall = (call: Call) => {
    setCurrentCall(call);
    toast({
      title: "Ligação iniciada",
      description: `Ligando para ${call.clientName}...`,
    });
  };

  const endCall = () => {
    if (currentCall) {
      toast({
        title: "Ligação finalizada",
        description: "Notas salvas com sucesso.",
      });
      setCurrentCall(null);
      setCallNotes("");
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Gravação parada" : "Gravação iniciada",
      description: isRecording ? "A gravação foi pausada." : "A ligação está sendo gravada.",
    });
  };

  const aiScripts = [
    {
      type: "Reativação",
      script: "Olá [Nome], aqui é da [Loja]. Notamos que você não nos visita há um tempo. Temos uma promoção especial de 15% de desconto só para você! Que tal passarmos os detalhes?"
    },
    {
      type: "Cross-sell",
      script: "Oi [Nome]! Vi que você comprou whey protein conosco. Para potencializar seus resultados, que tal conhecer nossa creatina? Ela combina perfeitamente com o whey!"
    },
    {
      type: "Follow-up",
      script: "Olá [Nome], como está sendo sua experiência com os produtos que adquiriu? Estou ligando para saber se precisa de alguma orientação ou se tem interesse em algo mais."
    }
  ];

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
                  <h1 className="text-3xl font-bold text-gray-900">Sistema de Ligações</h1>
                  <p className="text-gray-600">Gerencie ligações e follow-ups com clientes</p>
                </div>
              </div>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Ligação
              </Button>
            </div>

            {/* Ligação em Andamento */}
            {currentCall && (
              <Card className="mb-6 border-2 border-blue-300 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <PhoneCall className="w-5 h-5" />
                    Ligação em Andamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{currentCall.clientName}</h3>
                      <p className="text-gray-600">{currentCall.clientPhone}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleRecording}
                        className={isRecording ? 'bg-red-50 border-red-300' : ''}
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isRecording ? 'Parar Gravação' : 'Gravar'}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={endCall}>
                        <XCircle className="w-4 h-4 mr-1" />
                        Finalizar
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Anotações da Ligação
                    </label>
                    <Textarea
                      placeholder="Digite suas anotações durante a ligação..."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="schedule" className="space-y-6">
              <TabsList>
                <TabsTrigger value="schedule">Agenda</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="scripts">Scripts IA</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Ligações Agendadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {calls.filter(call => call.status === 'scheduled').map((call) => (
                        <div key={call.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{call.clientName}</h3>
                              <p className="text-gray-600">{call.clientPhone}</p>
                              <p className="text-sm text-gray-500">
                                Agendada para {new Date(call.scheduledTime).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(call.status)}>
                                {getStatusLabel(call.status)}
                              </Badge>
                              <Button size="sm" onClick={() => startCall(call)}>
                                <Phone className="w-4 h-4 mr-1" />
                                Ligar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Histórico de Ligações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {calls.filter(call => call.status !== 'scheduled').map((call) => (
                        <div key={call.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium text-lg">{call.clientName}</h3>
                              <p className="text-gray-600">{call.clientPhone}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(call.scheduledTime).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(call.status)}>
                                {getStatusLabel(call.status)}
                              </Badge>
                              {call.result && (
                                <Badge className={getResultColor(call.result)}>
                                  {getResultLabel(call.result)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {call.duration && (
                            <p className="text-sm text-gray-600 mb-2">
                              Duração: {call.duration} minutos
                            </p>
                          )}
                          
                          {call.notes && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{call.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scripts">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Scripts Gerados pela IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {aiScripts.map((script, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant="secondary" className="mb-2">
                              {script.type}
                            </Badge>
                            <Button size="sm" variant="outline">
                              Usar Script
                            </Button>
                          </div>
                          <div className="p-3 bg-white rounded border">
                            <p className="text-gray-700 italic">"{script.script}"</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                      <h3 className="font-medium text-lg mb-2">🤖 Scripts Personalizados</h3>
                      <p className="text-gray-600 mb-4">
                        A IA Looveble pode gerar scripts personalizados para cada cliente baseados em:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Histórico de compras do cliente</li>
                        <li>Tempo desde a última compra</li>
                        <li>Produtos de interesse baseados no perfil</li>
                        <li>Ocasiões especiais (aniversário, sazonalidade)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Ligacoes;
