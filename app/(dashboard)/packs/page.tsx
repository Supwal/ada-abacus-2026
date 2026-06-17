'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Images,
  Video,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PacksPage() {
  const [packs, setPacks] = useState<any[]>([]);
  const [carregandoPacks, setCarregandoPacks] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [packParaEditar, setPackParaEditar] = useState<any>(null);
  const [packParaDeletar, setPackParaDeletar] = useState<any>(null);
  const [dialogDeleteAberto, setDialogDeleteAberto] = useState(false);

  const [formPack, setFormPack] = useState({
    name: '',
    photos: '',
    videos: '',
    price: '',
    coverImage: '',
  });

  // Carregar packs ao montar
  useEffect(() => {
    carregarPacks();
  }, []);

  const carregarPacks = async () => {
    try {
      setCarregandoPacks(true);
      const response = await fetch('/api/packs');
      if (response.ok) {
        const data = await response.json();
        setPacks(data);
      } else {
        toast.error('Erro ao carregar packs');
      }
    } catch (error) {
      console.error('Erro ao carregar packs:', error);
      toast.error('Erro ao carregar packs');
    } finally {
      setCarregandoPacks(false);
    }
  };

  const abrirModalNovo = () => {
    setPackParaEditar(null);
    setFormPack({
      name: '',
      photos: '',
      videos: '',
      price: '',
      coverImage: '',
    });
    setModalAberto(true);
  };

  const abrirModalEditar = (pack: any) => {
    setPackParaEditar(pack);
    setFormPack({
      name: pack.name,
      photos: pack.photos.toString(),
      videos: pack.videos.toString(),
      price: pack.price.toString(),
      coverImage: pack.coverImage || '',
    });
    setModalAberto(true);
  };

  const salvarPack = async () => {
    try {
      if (!formPack.name || !formPack.photos || !formPack.videos || !formPack.price) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const dados = {
        name: formPack.name,
        photos: parseInt(formPack.photos),
        videos: parseInt(formPack.videos),
        price: parseFloat(formPack.price),
        coverImage: formPack.coverImage || null,
      };

      if (packParaEditar) {
        // Editar pack existente
        const response = await fetch(`/api/packs/${packParaEditar.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados),
        });

        if (response.ok) {
          const packAtualizado = await response.json();
          setPacks(packs.map((p) => (p.id === packAtualizado.id ? packAtualizado : p)));
          toast.success('Pack atualizado com sucesso!');
        } else {
          toast.error('Erro ao atualizar pack');
        }
      } else {
        // Criar novo pack
        const response = await fetch('/api/packs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados),
        });

        if (response.ok) {
          const novoPack = await response.json();
          setPacks([novoPack, ...packs]);
          toast.success('Pack criado com sucesso!');
        } else {
          toast.error('Erro ao criar pack');
        }
      }

      setModalAberto(false);
      setFormPack({
        name: '',
        photos: '',
        videos: '',
        price: '',
        coverImage: '',
      });
    } catch (error) {
      console.error('Erro ao salvar pack:', error);
      toast.error('Erro ao salvar pack');
    }
  };

  const abrirDialogDelete = (pack: any) => {
    setPackParaDeletar(pack);
    setDialogDeleteAberto(true);
  };

  const confirmarDelete = async () => {
    try {
      const response = await fetch(`/api/packs/${packParaDeletar.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPacks(packs.filter((p) => p.id !== packParaDeletar.id));
        toast.success('Pack removido com sucesso!');
      } else {
        toast.error('Erro ao remover pack');
      }

      setDialogDeleteAberto(false);
      setPackParaDeletar(null);
    } catch (error) {
      console.error('Erro ao deletar pack:', error);
      toast.error('Erro ao remover pack');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Voltar ao Menu</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">📦 Meus Packs</h1>
          <p className="text-gray-600">Gerencia seus pacotes de fotos e vídeos</p>
        </div>

        {/* Botão Novo Pack */}
        <div className="mb-6 flex justify-center">
          <Button
            onClick={abrirModalNovo}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            📦 Novo Pack
          </Button>
        </div>

        {/* Grid de Packs */}
        {carregandoPacks ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando packs...</p>
          </div>
        ) : packs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-gray-100">
            <div className="mb-4">
              <Images className="h-16 w-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Nenhum pack criado</h3>
            <p className="text-sm text-gray-500">
              Crie seus primeiro pack clicando no botão acima
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-purple-100"
              >
                {/* Imagem de Capa */}
                {pack.coverImage ? (
                  <div className="h-40 bg-gray-200 relative">
                    <img
                      src={pack.coverImage}
                      alt={pack.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-r from-purple-300 to-pink-300 flex items-center justify-center">
                    <Images className="h-16 w-16 text-purple-600 opacity-50" />
                  </div>
                )}

                {/* Conteúdo */}
                <div className="p-4">
                  {/* Nome */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{pack.name}</h3>

                  {/* Detalhes */}
                  <div className="space-y-2 mb-4">
                    {/* Fotos */}
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Images className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">{pack.photos} fotos</span>
                    </div>

                    {/* Vídeos */}
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Video className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">{pack.videos} vídeos</span>
                    </div>

                    {/* Preço */}
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-bold text-lg text-green-600">
                        R$ {pack.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Descrição do Pack */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-4 border border-purple-200">
                    <p className="text-sm text-gray-700 font-medium">
                      <span className="block text-purple-700 font-bold mb-1">" {pack.photos} fotos + {pack.videos} vídeos = R$ {pack.price.toFixed(2)}"</span>
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => abrirModalEditar(pack)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => abrirDialogDelete(pack)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Pack */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-3 rounded-full">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {packParaEditar ? '✏️ Editar Pack' : '📦 Novo Pack'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-700 pt-2">
              {packParaEditar
                ? 'Atualize os dados do seu pack'
                : 'Crie um novo pacote de fotos e vídeos'}
            </DialogDescription>
          </DialogHeader>

          {/* Formulário */}
          <div className="space-y-4 py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Nome do Pack</Label>
              <Input
                placeholder="Ex: Pack Premium"
                value={formPack.name}
                onChange={(e) => setFormPack({ ...formPack, name: e.target.value })}
                className="shadow-sm"
              />
            </div>

            {/* Fotos */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">📷 Quantidade de Fotos</Label>
              <Input
                type="number"
                min="1"
                placeholder="Ex: 20"
                value={formPack.photos}
                onChange={(e) => setFormPack({ ...formPack, photos: e.target.value })}
                className="shadow-sm"
              />
            </div>

            {/* Vídeos */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">🎬 Quantidade de Vídeos</Label>
              <Input
                type="number"
                min="0"
                placeholder="Ex: 5"
                value={formPack.videos}
                onChange={(e) => setFormPack({ ...formPack, videos: e.target.value })}
                className="shadow-sm"
              />
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">💰 Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 35.00"
                value={formPack.price}
                onChange={(e) => setFormPack({ ...formPack, price: e.target.value })}
                className="shadow-sm"
              />
            </div>

            {/* URL da Capa (Opcional) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">🖼️ URL da Imagem de Capa (Opcional)</Label>
              <Input
                type="url"
                placeholder="Ex: https://exemplo.com/imagem.jpg"
                value={formPack.coverImage}
                onChange={(e) => setFormPack({ ...formPack, coverImage: e.target.value })}
                className="shadow-sm"
              />
            </div>
          </div>

          {/* Botões */}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border-2 border-gray-300"
            >
              ❌ Cancelar
            </Button>
            <Button
              onClick={salvarPack}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg"
            >
              💾 {packParaEditar ? 'Atualizar' : 'Criar'} Pack
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de Confirmação de Delete */}
      <AlertDialog open={dialogDeleteAberto} onOpenChange={setDialogDeleteAberto}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                Confirmar Exclusão
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-700 pt-2">
              {packParaDeletar && (
                <div className="space-y-3">
                  <p className="font-medium">
                    Deseja realmente excluir o pack "<strong>{packParaDeletar.name}</strong>"?
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 border-2 border-gray-200">
                    <p className="text-sm text-gray-600">
                      📄 {packParaDeletar.photos} fotos + {packParaDeletar.videos} vídeos
                    </p>
                    <p className="text-sm text-gray-600">
                      💵 R$ {packParaDeletar.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-red-600 font-medium text-sm">
                    ⚠️ Esta ação não poderá ser desfeita!
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border-2 border-gray-300">
              ❌ Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDelete}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg"
            >
              🗑️ Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
