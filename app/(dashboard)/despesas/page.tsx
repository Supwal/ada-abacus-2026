
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Plus } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const categoriasDefault = [
  { value: "alimentacao", label: "Alimentação" },
  { value: "transporte", label: "Transporte" },
  { value: "materiais", label: "Materiais" },
  { value: "equipamentos", label: "Equipamentos" },
  { value: "marketing", label: "Marketing" },
  { value: "consultoria", label: "Consultoria" },
  { value: "outros", label: "Outros" }
];

export default function DespesasPage() {
  const router = useRouter();
  const [periodoSelecionado, setPeriodoSelecionado] = useState('diaria');
  const [totalDespesas, setTotalDespesas] = useState('R$ 0,00');
  const [despesas, setDespesas] = useState<any[]>([]);
  const [mostrarFiltroPeriodo, setMostrarFiltroPeriodo] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [periodoFiltro, setPeriodoFiltro] = useState({
    dataInicial: '',
    dataFinal: ''
  });
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: 'R$ 0,00',
    data: '',
    categoria: '',
    observacoes: ''
  });

  // Estados para categorias personalizadas
  const [categoriasDespesas, setCategoriasDespesas] = useState(categoriasDefault);
  const [dialogCategoriaAberto, setDialogCategoriaAberto] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  // Função para calcular datas do período selecionado
  const calcularDatasDoperiodo = useCallback((periodo: string) => {
    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    
    if (periodo === 'diaria') {
      return { dataInicial: hojeStr, dataFinal: hojeStr };
    } else if (periodo === 'semanal') {
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6); // Sábado
      
      const inicioStr = `${inicioSemana.getFullYear()}-${String(inicioSemana.getMonth() + 1).padStart(2, '0')}-${String(inicioSemana.getDate()).padStart(2, '0')}`;
      const fimStr = `${fimSemana.getFullYear()}-${String(fimSemana.getMonth() + 1).padStart(2, '0')}-${String(fimSemana.getDate()).padStart(2, '0')}`;
      
      return { dataInicial: inicioStr, dataFinal: fimStr };
    } else if (periodo === 'mensal') {
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      
      const inicioStr = `${inicioMes.getFullYear()}-${String(inicioMes.getMonth() + 1).padStart(2, '0')}-${String(inicioMes.getDate()).padStart(2, '0')}`;
      const fimStr = `${fimMes.getFullYear()}-${String(fimMes.getMonth() + 1).padStart(2, '0')}-${String(fimMes.getDate()).padStart(2, '0')}`;
      
      return { dataInicial: inicioStr, dataFinal: fimStr };
    }
    
    return { dataInicial: hojeStr, dataFinal: hojeStr };
  }, []);

  const carregarDespesas = useCallback(() => {
    const despesasSalvas = JSON.parse(localStorage.getItem('despesas') || '[]');
    
    // Calcular as datas do período selecionado
    const { dataInicial, dataFinal } = periodoFiltro.dataInicial && periodoFiltro.dataFinal
      ? periodoFiltro
      : calcularDatasDoperiodo(periodoSelecionado);
    
    // Filtrar despesas pelo período
    const despesasFiltradas = despesasSalvas.filter((despesa: any) => {
      const dataDespesa = despesa.data.split('T')[0]; // Normalizar formato da data
      return dataDespesa >= dataInicial && dataDespesa <= dataFinal;
    });
    
    setDespesas(despesasFiltradas);
    
    // Calcular total das despesas filtradas
    const total = despesasFiltradas.reduce((acc: number, despesa: any) => {
      const valor = parseFloat(despesa.valor.replace('R$', '').replace('.', '').replace(',', '.').trim());
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    setTotalDespesas(total.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }));
  }, [periodoFiltro, periodoSelecionado, calcularDatasDoperiodo]);

  // Inicializar com data atual
  useEffect(() => {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      data: dataFormatada
    }));
  }, []);

  // Carregar categorias personalizadas do localStorage
  useEffect(() => {
    const categoriasPersonalizadas = JSON.parse(localStorage.getItem('categoriasDespesasPersonalizadas') || '[]');
    if (categoriasPersonalizadas.length > 0) {
      const categoriasCompletas = [...categoriasDefault, ...categoriasPersonalizadas.map((cat: string) => ({
        value: cat.toLowerCase().replace(/\s+/g, '_'),
        label: cat
      }))];
      setCategoriasDespesas(categoriasCompletas);
    }
  }, []);

  // Recarregar despesas quando o filtro de período mudar
  useEffect(() => {
    carregarDespesas();
  }, [carregarDespesas]);

  const handleAdicionarCategoria = () => {
    if (novaCategoria.trim() === '') {
      toast.error('Por favor, digite o nome da categoria.');
      return;
    }

    // Verificar se a categoria já existe
    const categoriaExiste = categoriasDespesas.some(cat => 
      cat.label.toLowerCase() === novaCategoria.trim().toLowerCase()
    );
    
    if (categoriaExiste) {
      toast.error('Esta categoria já existe!');
      return;
    }

    // Adicionar a nova categoria
    const categoriasPersonalizadas = JSON.parse(localStorage.getItem('categoriasDespesasPersonalizadas') || '[]');
    categoriasPersonalizadas.push(novaCategoria.trim());
    localStorage.setItem('categoriasDespesasPersonalizadas', JSON.stringify(categoriasPersonalizadas));

    // Atualizar o estado
    const novaCategoriaObj = {
      value: novaCategoria.trim().toLowerCase().replace(/\s+/g, '_'),
      label: novaCategoria.trim()
    };
    setCategoriasDespesas([...categoriasDespesas, novaCategoriaObj]);
    
    // Selecionar a nova categoria automaticamente
    handleInputChange('categoria', novaCategoriaObj.value);
    
    // Fechar o dialog e limpar o campo
    setNovaCategoria('');
    setDialogCategoriaAberto(false);
  };

  const aplicarFiltroPeriodo = () => {
    if (!periodoFiltro.dataInicial || !periodoFiltro.dataFinal) {
      toast.error('Por favor, selecione as datas inicial e final.');
      return;
    }
    
    if (new Date(periodoFiltro.dataInicial) > new Date(periodoFiltro.dataFinal)) {
      toast.error('A data inicial deve ser anterior à data final.');
      return;
    }
    
    carregarDespesas();
    setMostrarFiltroPeriodo(false);
  };

  const limparFiltroPeriodo = () => {
    setPeriodoFiltro({
      dataInicial: '',
      dataFinal: ''
    });
    carregarDespesas();
    setMostrarFiltroPeriodo(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatarValor = (valor: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = valor.replace(/\D/g, '');
    
    // Converte para centavos
    const cents = parseInt(numbers) || 0;
    
    // Converte para reais
    const reais = cents / 100;
    
    // Formata como moeda brasileira
    return reais.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarValor(e.target.value);
    handleInputChange('valor', valorFormatado);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.categoria) {
      toast.error('Por favor, preencha a descrição e categoria.');
      return;
    }

    // Salvar despesa
    const novaDespesa = {
      ...formData,
      id: Date.now(),
      dataCriacao: new Date().toISOString()
    };

    const despesasExistentes = JSON.parse(localStorage.getItem('despesas') || '[]');
    despesasExistentes.push(novaDespesa);
    localStorage.setItem('despesas', JSON.stringify(despesasExistentes));

    // Limpar formulário
    handleCancel();
    
    // Recarregar despesas
    carregarDespesas();
    
    // Fechar o formulário e mostrar mensagem de sucesso
    setMostrarFormulario(false);
    toast.success('Despesa adicionada com sucesso!');
  };

  const handleCancel = () => {
    setFormData({
      descricao: '',
      valor: 'R$ 0,00',
      data: new Date().toISOString().split('T')[0],
      categoria: '',
      observacoes: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Menu
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Despesas
            </h1>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={periodoSelecionado === 'diaria' ? "default" : "outline"}
            onClick={() => {
              setPeriodoFiltro({ dataInicial: '', dataFinal: '' });
              setPeriodoSelecionado('diaria');
            }}
            className={periodoSelecionado === 'diaria' ? "bg-pink-500 hover:bg-pink-600 text-white" : ""}
          >
            Diária
          </Button>
          <Button
            variant={periodoSelecionado === 'semanal' ? "default" : "outline"}
            onClick={() => {
              setPeriodoFiltro({ dataInicial: '', dataFinal: '' });
              setPeriodoSelecionado('semanal');
            }}
            className={periodoSelecionado === 'semanal' ? "bg-pink-500 hover:bg-pink-600 text-white" : ""}
          >
            Semanal
          </Button>
          <Button
            variant={periodoSelecionado === 'mensal' ? "default" : "outline"}
            onClick={() => {
              setPeriodoFiltro({ dataInicial: '', dataFinal: '' });
              setPeriodoSelecionado('mensal');
            }}
            className={periodoSelecionado === 'mensal' ? "bg-pink-500 hover:bg-pink-600 text-white" : ""}
          >
            Mensal
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setMostrarFiltroPeriodo(!mostrarFiltroPeriodo)}
          >
            <Calendar className="h-4 w-4" />
            Filtrar por Período
          </Button>
          <Button 
            className="bg-pink-500 hover:bg-pink-600 text-white"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            + Nova Despesa
          </Button>
        </div>

        {/* Filtro por Período */}
        {mostrarFiltroPeriodo && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrar por Período</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Data Inicial */}
              <div className="space-y-2">
                <Label htmlFor="dataInicial" className="text-sm font-medium text-gray-700">
                  Período Inicial
                </Label>
                <Input
                  id="dataInicial"
                  type="date"
                  value={periodoFiltro.dataInicial}
                  onChange={(e) => setPeriodoFiltro(prev => ({
                    ...prev,
                    dataInicial: e.target.value
                  }))}
                  className="w-full shadow-sm"
                />
              </div>

              {/* Data Final */}
              <div className="space-y-2">
                <Label htmlFor="dataFinal" className="text-sm font-medium text-gray-700">
                  Período Final
                </Label>
                <Input
                  id="dataFinal"
                  type="date"
                  value={periodoFiltro.dataFinal}
                  onChange={(e) => setPeriodoFiltro(prev => ({
                    ...prev,
                    dataFinal: e.target.value
                  }))}
                  className="w-full shadow-sm"
                />
              </div>
            </div>

            {/* Botões de Ação do Filtro */}
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={limparFiltroPeriodo}
                className="text-gray-600 hover:text-gray-800"
              >
                Limpar
              </Button>
              <Button 
                onClick={aplicarFiltroPeriodo}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                Aplicar Filtro
              </Button>
            </div>
          </div>
        )}

        {/* Adicionar Despesa Form */}
        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Despesa</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            
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
                  className="w-full shadow-sm"
                  placeholder=""
                />
              </div>

              {/* Valor, Data e Categoria em linha */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Valor */}
                <div className="space-y-2">
                  <Label htmlFor="valor" className="text-sm font-medium text-gray-700">
                    Valor
                  </Label>
                  <Input
                    id="valor"
                    type="text"
                    value={formData.valor}
                    onChange={handleValorChange}
                    className="w-full shadow-sm"
                  />
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <Label htmlFor="data" className="text-sm font-medium text-gray-700">
                    Data
                  </Label>
                  <div className="relative">
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => handleInputChange('data', e.target.value)}
                      className="w-full shadow-sm"
                      placeholder="Preencha este campo."
                    />
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm font-medium text-gray-700">
                    Categoria
                  </Label>
                  <div className="flex gap-2">
                    <Select value={formData.categoria || undefined} onValueChange={(value) => handleInputChange('categoria', value)}>
                      <SelectTrigger className="shadow-sm flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasDespesas.map((categoria) => (
                          <SelectItem key={categoria.value} value={categoria.value}>
                            {categoria.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button"
                      onClick={() => setDialogCategoriaAberto(true)}
                      className="bg-pink-500 hover:bg-pink-600 text-white h-10 w-10 p-0 shrink-0"
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
                  className="w-full min-h-[120px] resize-none shadow-sm"
                  placeholder=""
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    handleCancel();
                    setMostrarFormulario(false);
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
                >
                  Adicionar Despesa
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Total de Despesas */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Total de Despesas</span>
            <span className="text-xl font-bold text-pink-500">{totalDespesas}</span>
          </div>
        </div>

        {/* Lista de Despesas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {despesas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                Nenhuma despesa encontrada para o período selecionado.
              </p>
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => setMostrarFormulario(true)}
              >
                + Adicionar Despesa
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Despesas Cadastradas ({despesas.length})
                </h3>
              </div>
              <div className="space-y-4">
                {despesas.map((despesa, index) => (
                  <div key={despesa.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900">
                          {despesa.descricao}
                        </h4>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          <p>📅 {new Date(despesa.data).toLocaleDateString('pt-BR')}</p>
                          <p>🏷️ {categoriasDespesas.find(cat => cat.value === despesa.categoria)?.label || despesa.categoria}</p>
                          {despesa.observacoes && (
                            <p className="text-gray-500">💬 {despesa.observacoes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-semibold text-red-600">
                          {despesa.valor}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para adicionar nova categoria */}
      <Dialog open={dialogCategoriaAberto} onOpenChange={setDialogCategoriaAberto}>
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
                setDialogCategoriaAberto(false);
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
