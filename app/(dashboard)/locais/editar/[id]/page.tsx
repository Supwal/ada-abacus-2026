'use client';

export const runtime = 'edge';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

const estadosBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function EditarLocalPage() {
  const router = useRouter();
  const params = useParams();
  const localId = params?.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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
    observacoes: '',
  });

  useEffect(() => {
    if (!localId) return;
    fetch(`/api/locations/${localId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Local não encontrado');
        return res.json();
      })
      .then((loc) => {
        setFormData({
          nomeLocal: loc.name || '',
          endereco: loc.address || '',
          cidade: loc.city || '',
          estado: loc.state || '',
          telefone: loc.phone || '',
          pessoaContato: loc.contactPerson || '',
          diasFuncionamento: loc.workingDays || '',
          horarioInicio: loc.openTime || '',
          horarioFim: loc.closeTime || '',
          observacoes: loc.notes || '',
        });
      })
      .catch(() => {
        toast.error('Local não encontrado');
        router.push('/locais');
      })
      .finally(() => setIsFetching(false));
  }, [localId, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers.length > 0 ? `(${numbers}` : '';
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomeLocal || !formData.endereco || !formData.cidade || !formData.estado) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/locations/${localId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.nomeLocal,
          address: formData.endereco,
          city: formData.cidade,
          state: formData.estado,
          phone: formData.telefone,
          contactPerson: formData.pessoaContato,
          workingDays: formData.diasFuncionamento,
          openTime: formData.horarioInicio,
          closeTime: formData.horarioFim,
          notes: formData.observacoes,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao atualizar local');
      }
      toast.success('Local atualizado com sucesso!');
      router.push('/locais');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar local';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <Link href="/locais" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Locais
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Editar Local/Clínica</h1>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nomeLocal" className="text-sm font-medium text-gray-700">Nome do Local *</Label>
                <Input id="nomeLocal" type="text" value={formData.nomeLocal}
                  onChange={(e) => handleInputChange('nomeLocal', e.target.value)}
                  className="w-full shadow-sm" placeholder="Nome da clínica ou local" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">Endereço *</Label>
                <Input id="endereco" type="text" value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  className="w-full shadow-sm" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">Cidade *</Label>
                  <Input id="cidade" type="text" value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    className="w-full shadow-sm" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm font-medium text-gray-700">Estado *</Label>
                  <Select value={formData.estado} onValueChange={(v) => handleInputChange('estado', v)}>
                    <SelectTrigger className="shadow-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {estadosBrasil.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">Telefone</Label>
                <Input id="telefone" type="text" value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', formatTelefone(e.target.value))}
                  className="w-full shadow-sm" placeholder="(XX) XXXXX-XXXX" maxLength={15} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pessoaContato" className="text-sm font-medium text-gray-700">Pessoa de Contato</Label>
                <Input id="pessoaContato" type="text" value={formData.pessoaContato}
                  onChange={(e) => handleInputChange('pessoaContato', e.target.value)}
                  className="w-full shadow-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Funcionamento</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={formData.diasFuncionamento} onValueChange={(v) => handleInputChange('diasFuncionamento', v)}>
                    <SelectTrigger className="shadow-sm"><SelectValue placeholder="Dias de funcionamento" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seg-sex">Segunda a Sexta</SelectItem>
                      <SelectItem value="seg-sab">Segunda a Sábado</SelectItem>
                      <SelectItem value="todos">Todos os dias</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="time" value={formData.horarioInicio}
                    onChange={(e) => handleInputChange('horarioInicio', e.target.value)}
                    className="w-full shadow-sm" />
                  <Input type="time" value={formData.horarioFim}
                    onChange={(e) => handleInputChange('horarioFim', e.target.value)}
                    className="w-full shadow-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">Observações</Label>
                <Textarea id="observacoes" value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  className="w-full min-h-[120px] resize-none shadow-sm" />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                <Button type="button" variant="outline" onClick={() => router.push('/locais')}
                  className="px-6 py-2 text-gray-600">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}
                  className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg">
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
