
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const categoriasDefault = [
  'Alimentação',
  'Transporte', 
  'Material de Trabalho',
  'Marketing',
  'Equipamentos',
  'Manutenção',
  'Aluguel',
  'Contas',
  'Outros'
];

export default function NovaDespesaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0], // Data atual
    categoria: '',
    observacoes: ''
  });

  const [filtroAtivo, setFiltroAtivo] = useState('Diária');
  const [categorias, setCategorias] = useState<string[]>(categoriasDefault);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  // Carregar categorias personalizadas do localStorage
  useEffect(() => {
    const categoriasPersonalizadas = JSON.parse(localStorage.getItem('categoriasDespesas') || '[]');
    if (categoriasPersonalizadas.length > 0) {
      setCategorias([...categoriasDefault, ...categoriasPersonalizadas]);
    }
  }, []);

  const handleAdicionarCategoria = () => {
    if (novaCategoria.trim() === '') {
      toast.error("Atenção", {
        description: "Por favor, digite o nome da categoria.",
      });
      return;
    }

    // Verificar se a categoria já existe
    if (categorias.includes(novaCategoria.trim())) {
      toast.error("Atenção", {
        description: "Esta categoria já existe!",
      });
      return;
    }

    // Adicionar a nova categoria
    const categoriasPersonalizadas = JSON.parse(localStorage.getItem('categoriasDespesas') || '[]');
    categoriasPersonalizadas.push(novaCategoria.trim());
    localStorage.setItem('categoriasDespesas', JSON.stringify(categoriasPersonalizadas));

    // Atualizar o estado
    setCategorias([...categorias, novaCategoria.trim()]);
    
    // Selecionar a nova categoria automaticamente
    handleInputChange('categoria', novaCategoria.trim());
    
    // Mostrar mensagem de sucesso
    toast.success("Sucesso!", {
      description: `Categoria "${novaCategoria.trim()}" adicionada com sucesso.`,
    });
    
    // Fechar o dialog e limpar o campo
    setNovaCategoria('');
    setDialogAberto(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    
    // Converte para formato de moeda
    const amount = parseFloat(numbers) / 100;
    
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    handleInputChange('valor', formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.valor || !formData.categoria) {
      toast.error("Atenção", {
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    // Aqui você salvaria os dados no backend ou localStorage
    console.log('Dados da despesa:', formData);
    
    // Salvar no localStorage (temporário)
    const despesas = JSON.parse(localStorage.getItem('despesas') || '[]');
    despesas.push({
      ...formData,
      id: Date.now(),
      dataCriacao: new Date().toISOString()
    });
    localStorage.setItem('despesas', JSON.stringify(despesas));
    
    // Mostrar mensagem de sucesso
    toast.success("✅ Despesa Cadastrada!", {
      description: "Sua despesa foi registrada com sucesso no sistema.",
      duration: 4000,
    });
    
    // Limpar o formulário
    setFormData({
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: '',
      observacoes: ''
    });
    
    // Redirecionar para a lista de despesas após 2 segundos
    setTimeout(() => {
      router.push('/despesas');
    }, 2000);
  };

  const handleCancel = () => {
    setFormData({
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: '',
      observacoes: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Menu
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Despesas
            </h1>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['Diária', 'Semanal', 'Mensal'].map((filtro) => (
            <Button
              key={filtro}
              variant={filtroAtivo === filtro ? "default" : "outline"}
              onClick={() => setFiltroAtivo(filtro)}
              className={filtroAtivo === filtro ? "bg-pink-500 hover:bg-pink-600 text-white" : ""}
            >
              {filtro}
            </Button>
          ))}
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Filtrar por Período
          </Button>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-2 ml-auto">
            <Plus className="h-4 w-4" />
            Nova Despesa
          </Button>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">
                  Descrição
                </Label>
                <Input
                  id="descricao"
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  className="w-full"
                  placeholder="Digite a descrição da despesa"
                  required
                />
              </div>

              {/* Valor, Data e Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor" className="text-sm font-medium text-gray-700">
                    Valor
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      id="valor"
                      type="text"
                      value={formData.valor}
                      onChange={handleValorChange}
                      className="w-full pl-10"
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data" className="text-sm font-medium text-gray-700">
                    Data
                  </Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleInputChange('data', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm font-medium text-gray-700">
                    Categoria
                  </Label>
                  <div className="flex gap-2">
                    <Select value={formData.categoria || undefined} onValueChange={(value) => handleInputChange('categoria', value)} required>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button"
                      onClick={() => setDialogAberto(true)}
                      className="bg-pink-500 hover:bg-pink-600 text-white h-10 w-10 p-0"
                      title="Adicionar nova categoria"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  className="w-full min-h-[120px] resize-none"
                  placeholder="Digite observações adicionais sobre esta despesa"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleCancel}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white"
                >
                  Salvar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Total Section */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total de Despesas</span>
              <span className="text-2xl font-bold text-pink-500">R$ 0,00</span>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-6">
              Nenhuma despesa encontrada para o período selecionado.
            </p>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Despesa
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para adicionar nova categoria */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Adicionar Nova Categoria
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="novaCategoria" className="text-sm font-medium text-gray-700">
                Nome da Categoria
              </Label>
              <Input
                id="novaCategoria"
                type="text"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                className="w-full"
                placeholder="Digite o nome da categoria"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdicionarCategoria();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setDialogAberto(false);
                setNovaCategoria('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleAdicionarCategoria}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
