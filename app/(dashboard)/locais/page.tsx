
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Phone, User, Edit, Trash2, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Local {
  id: string;
  name: string;
  address: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function LocaisPage() {
  const router = useRouter();
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCidade, setFiltroCidade] = useState('todas');
  const [locaisFiltrados, setLocaisFiltrados] = useState<Local[]>([]);
  const [todosLocais, setTodosLocais] = useState<Local[]>([]);
  const [localParaExcluir, setLocalParaExcluir] = useState<Local | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const estados = ['SP', 'RJ', 'SC', 'MG', 'PR', 'RS'];
  const cidades = ['São Paulo', 'Rio de Janeiro', 'Porto Alegre', 'Belo Horizonte', 'Curitiba', 'Salvador'];

  // Carregar todos os locais via API
  useEffect(() => {
    carregarLocais();
  }, []);

  const carregarLocais = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const locais = await response.json();
        setTodosLocais(locais);
        setLocaisFiltrados(locais);
      }
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
    }
  };

  // Aplicar filtros automaticamente quando os dados ou filtros mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [filtroEstado, filtroCidade, todosLocais]);

  const aplicarFiltros = () => {
    let locais = todosLocais;

    if (filtroEstado !== 'todos') {
      locais = locais.filter(local => {
        const address = local.address || '';
        return address.includes(filtroEstado);
      });
    }

    if (filtroCidade !== 'todas') {
      locais = locais.filter(local => {
        const address = local.address || '';
        return address.includes(filtroCidade);
      });
    }

    setLocaisFiltrados(locais);
  };

  const limparFiltros = () => {
    setFiltroEstado('todos');
    setFiltroCidade('todas');
  };

  const abrirDialogExclusao = (local: Local) => {
    setLocalParaExcluir(local);
    setShowDeleteDialog(true);
  };

  const confirmarExclusao = async () => {
    if (!localParaExcluir) return;
    
    try {
      const response = await fetch(`/api/locations/${localParaExcluir.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recarregar dados
        await carregarLocais();
        setShowDeleteDialog(false);
        setLocalParaExcluir(null);
      } else {
        toast.error('Erro ao excluir local.');
      }
    } catch (error) {
      console.error('Erro ao excluir local:', error);
      toast.error('Erro ao excluir local.');
    }
  };

  const cancelarExclusao = () => {
    setShowDeleteDialog(false);
    setLocalParaExcluir(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); router.push('/dashboard'); }}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Menu
            </a>
            <h1 className="text-2xl font-bold text-gray-900">
              Locais e Clínicas
            </h1>
          </div>
          <Link href="/locais/novo">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Local
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Filtro Estado */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Filtrar por Estado
                </label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os estados</SelectItem>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Cidade */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Filtrar por Cidade
                </label>
                <Select value={filtroCidade} onValueChange={setFiltroCidade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as cidades</SelectItem>
                    {cidades.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={carregarLocais} variant="outline" className="bg-green-50 hover:bg-green-100">
                  🔄 Atualizar
                </Button>
                <Button onClick={limparFiltros} variant="outline">
                  Limpar Filtros
                </Button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              {locaisFiltrados.length} locais encontrados
            </div>
          </CardContent>
        </Card>

        {/* Locais Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locaisFiltrados.map((local) => (
            <Card key={local.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {local.name || 'Local sem nome'}
                  </h3>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Editar local"
                      onClick={() => router.push(`/locais/editar/${local.id}`)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => abrirDialogExclusao(local)}
                      title="Excluir local"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Endereço */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-600">{local.address || 'Endereço não informado'}</p>
                  </div>

                  {/* Descrição */}
                  {local.description && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 whitespace-pre-line">{local.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {locaisFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum local encontrado com os filtros aplicados</p>
            </div>
            <Button onClick={limparFiltros} variant="outline">
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Confirmar Exclusão</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Tem certeza que deseja excluir o local{' '}
              <span className="font-semibold text-gray-900">
                {localParaExcluir?.name}
              </span>
              ?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                Esta ação não pode ser desfeita.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={cancelarExclusao}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmarExclusao}
              className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
            >
              Excluir Local
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
