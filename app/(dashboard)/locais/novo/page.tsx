
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const estadosBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function NovoLocalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nomeLocal: '',
    endereco: '',
    cidade: '',
    estado: '',
    telefone: '',
    pessoaContato: '',
    diasFuncionamento: '',
    horarioInicio: '',
    horarioFim: '',
    observacoes: ''
  });
  
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCidade, setFiltroCidade] = useState('todas');
  const [locaisEncontrados, setLocaisEncontrados] = useState(12);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatTelefone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers.length > 0 ? `(${numbers}` : '';
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    handleInputChange('telefone', formatted);
  };

  const limparFiltros = () => {
    setFiltroEstado('todos');
    setFiltroCidade('todas');
    setLocaisEncontrados(12);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeLocal || !formData.endereco || !formData.cidade || !formData.estado) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      // Salvar via API
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.nomeLocal,
          address: `${formData.endereco}, ${formData.cidade} - ${formData.estado}`,
          description: `Telefone: ${formData.telefone || 'N/A'}\nPessoa de Contato: ${formData.pessoaContato || 'N/A'}\nDias: ${formData.diasFuncionamento || 'N/A'}\nHorário: ${formData.horarioInicio || 'N/A'} - ${formData.horarioFim || 'N/A'}\nObservações: ${formData.observacoes || 'N/A'}`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao salvar local');
      }

      const novoLocal = await response.json();
      console.log('Local salvo:', novoLocal);

      // Redirecionar para a página de confirmação
      router.push('/locais/confirmacao');
    } catch (error) {
      console.error('Erro ao salvar local:', error);
      const msg = error instanceof Error ? error.message : 'Erro ao salvar local';
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    // Limpar formulário
    setFormData({
      nomeLocal: '',
      endereco: '',
      cidade: '',
      estado: '',
      telefone: '',
      pessoaContato: '',
      diasFuncionamento: '',
      horarioInicio: '',
      horarioFim: '',
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
              Locais e Clínicas
            </h1>
          </div>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
            + Novo Local
          </Button>
        </div>

        {/* Filters Section */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Filtro Estado */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Filtrar por Estado
                </Label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os estados</SelectItem>
                    {estadosBrasil.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Cidade */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Filtrar por Cidade
                </Label>
                <Select value={filtroCidade} onValueChange={setFiltroCidade}>
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as cidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={limparFiltros}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-blue-600">
              {locaisEncontrados} locais encontrados
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome do Local */}
              <div className="space-y-2">
                <Label htmlFor="nomeLocal" className="text-sm font-medium text-gray-700">
                  Nome do Local
                </Label>
                <Input
                  id="nomeLocal"
                  type="text"
                  value={formData.nomeLocal}
                  onChange={(e) => handleInputChange('nomeLocal', e.target.value)}
                  className="w-full shadow-sm"
                  placeholder="Preencha este campo..."
                />
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">
                  Endereço
                </Label>
                <Input
                  id="endereco"
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  className="w-full shadow-sm"
                  placeholder=""
                />
              </div>

              {/* Cidade e Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    className="w-full shadow-sm"
                    placeholder=""
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                    Estado
                  </Label>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                    <SelectTrigger className="shadow-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasil.map((estado) => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  type="text"
                  value={formData.telefone}
                  onChange={handleTelefoneChange}
                  className="w-full shadow-sm"
                  placeholder="(XX) XXXXX-XXXX"
                  maxLength={15}
                />
              </div>

              {/* Pessoa de Contato */}
              <div className="space-y-2">
                <Label htmlFor="pessoaContato" className="text-sm font-medium text-gray-700">
                  Pessoa de Contato
                </Label>
                <Input
                  id="pessoaContato"
                  type="text"
                  value={formData.pessoaContato}
                  onChange={(e) => handleInputChange('pessoaContato', e.target.value)}
                  className="w-full shadow-sm"
                  placeholder=""
                />
              </div>

              {/* Funcionamento */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Funcionamento
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select 
                    value={formData.diasFuncionamento} 
                    onValueChange={(value) => handleInputChange('diasFuncionamento', value)}
                  >
                    <SelectTrigger className="shadow-sm">
                      <SelectValue placeholder="Dias de funcionamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seg-sex">Segunda a Sexta</SelectItem>
                      <SelectItem value="seg-sab">Segunda a Sábado</SelectItem>
                      <SelectItem value="todos">Todos os dias</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative">
                    <Input
                      type="time"
                      value={formData.horarioInicio}
                      onChange={(e) => handleInputChange('horarioInicio', e.target.value)}
                      className="w-full shadow-sm"
                      placeholder="--:--"
                    />
                  </div>

                  <div className="relative">
                    <Input
                      type="time"
                      value={formData.horarioFim}
                      onChange={(e) => handleInputChange('horarioFim', e.target.value)}
                      className="w-full shadow-sm"
                      placeholder="--:--"
                    />
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
              <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleCancel}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
                >
                  Salvar Local
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
