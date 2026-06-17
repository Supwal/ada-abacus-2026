
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail,
  Home,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  _count?: {
    appointments: number;
  };
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        toast.error("Erro ao carregar clientes");
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestão de Clientes
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus clientes e histórico de atendimentos
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Menu Principal
            </Button>
          </Link>
          <Link href="/clientes/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription>
                      {client._count?.appointments || 0} atendimento{(client._count?.appointments || 0) !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {client.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                
                {client.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                )}

                {client.notes && (
                  <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded text-ellipsis overflow-hidden">
                    {client.notes.length > 100 ? `${client.notes.substring(0, 100)}...` : client.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-gray-400">
                    Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Link href={`/clientes/${client.id}/editar`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        // TODO: Implementar delete
                        toast.info("Função em desenvolvimento");
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <User className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  {searchTerm 
                    ? "Tente alterar os termos da busca" 
                    : "Comece cadastrando seu primeiro cliente"
                  }
                </p>
                {!searchTerm && (
                  <Link href="/clientes/novo">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredClients.length}
                </div>
                <div className="text-sm text-gray-500">
                  {searchTerm ? 'Encontrados' : 'Total de Clientes'}
                </div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredClients.filter(c => c._count?.appointments && c._count.appointments > 0).length}
                </div>
                <div className="text-sm text-gray-500">Com Histórico</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {filteredClients.filter(c => c.email).length}
                </div>
                <div className="text-sm text-gray-500">Com Email</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {filteredClients.filter(c => c.phone).length}
                </div>
                <div className="text-sm text-gray-500">Com Telefone</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
