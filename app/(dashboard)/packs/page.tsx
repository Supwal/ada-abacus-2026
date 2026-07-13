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
  Upload,
  X as XIcon,
  Send,
  Copy,
  MessageCircle,
  FolderOpen,
  Loader2,
  Link2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PacksPage() {
  const [packs, setPacks] = useState<any[]>([]);
  const [carregandoPacks, setCarregandoPacks] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [packParaEditar, setPackParaEditar] = useState<any>(null);
  const [packParaDeletar, setPackParaDeletar] = useState<any>(null);
  const [dialogDeleteAberto, setDialogDeleteAberto] = useState(false);
  // Venda: enviar pack ao cliente
  const [packParaVender, setPackParaVender] = useState<any>(null);
  const [dialogVenderAberto, setDialogVenderAberto] = useState(false);
  const [telefoneVenda, setTelefoneVenda] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [carregandoShare, setCarregandoShare] = useState(false);

  // Gerenciar arquivos reais (fotos/vídeos) do pack
  const [packParaGerenciarMidia, setPackParaGerenciarMidia] = useState<any>(null);
  const [dialogMidiaAberto, setDialogMidiaAberto] = useState(false);
  const [midias, setMidias] = useState<any[]>([]);
  const [carregandoMidias, setCarregandoMidias] = useState(false);
  const [enviandoMidia, setEnviandoMidia] = useState(false);
  const midiaFileInputRef = useRef<HTMLInputElement>(null);

  const [formPack, setFormPack] = useState({
    name: '',
    photos: '',
    videos: '',
    price: '',
    coverImage: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fotos/vídeos reais escolhidos já no dialog de criar/editar pack —
  // são enviados logo depois que o pack é salvo (precisa do id do pack)
  const [arquivosNovoPack, setArquivosNovoPack] = useState<File[]>([]);
  const novoPackFileInputRef = useRef<HTMLInputElement>(null);
  const [salvandoPack, setSalvandoPack] = useState(false);

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
    setArquivosNovoPack([]);
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
    setArquivosNovoPack([]);
    setModalAberto(true);
  };

  const salvarPack = async () => {
    try {
      if (!formPack.name || !formPack.photos || !formPack.videos || !formPack.price) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      setSalvandoPack(true);

      const dados = {
        name: formPack.name,
        photos: parseInt(formPack.photos),
        videos: parseInt(formPack.videos),
        price: parseFloat(formPack.price),
        coverImage: formPack.coverImage || null,
      };

      // Guarda o id do pack salvo para enviar os arquivos escolhidos em seguida
      let packSalvoId: string | null = null;

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
          packSalvoId = packAtualizado.id;
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
          packSalvoId = novoPack.id;
          toast.success('Pack criado com sucesso!');
        } else {
          toast.error('Erro ao criar pack');
        }
      }

      // Envia as fotos/vídeos escolhidos já no dialog (se houver)
      if (packSalvoId && arquivosNovoPack.length > 0) {
        toast(`📤 Enviando ${arquivosNovoPack.length} arquivo(s)...`);
        const enviados = await enviarArquivosParaPack(packSalvoId, arquivosNovoPack);
        if (enviados > 0) {
          toast.success(`${enviados} arquivo(s) do pack enviado(s)!`);
        }
        carregarPacks();
      }

      setModalAberto(false);
      setArquivosNovoPack([]);
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
    } finally {
      setSalvandoPack(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5 MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione apenas arquivos de imagem (JPG, PNG, WEBP).');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setFormPack(prev => ({ ...prev, coverImage: base64 }));
      setUploadingImage(false);
      toast.success('Imagem carregada com sucesso!');
    };
    reader.onerror = () => {
      toast.error('Erro ao carregar imagem');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const abrirDialogDelete = (pack: any) => {
    setPackParaDeletar(pack);
    setDialogDeleteAberto(true);
  };

  const buildShareLink = (token: string) =>
    typeof window !== 'undefined' ? `${window.location.origin}/p/${token}` : '';

  // Abre o dialog de venda (enviar pack ao cliente) — garante que existe um
  // link público antes de mostrar a mensagem, gerando na primeira vez.
  const abrirDialogVender = async (pack: any) => {
    setPackParaVender(pack);
    setTelefoneVenda('');
    setShareLink(pack.shareToken ? buildShareLink(pack.shareToken) : '');
    setDialogVenderAberto(true);

    if (!pack.shareToken) {
      setCarregandoShare(true);
      try {
        const response = await fetch(`/api/packs/${pack.id}/share`, { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          setShareLink(buildShareLink(data.shareToken));
          setPacks((prev) => prev.map((p) => (p.id === pack.id ? { ...p, shareToken: data.shareToken } : p)));
        } else {
          toast.error('Erro ao gerar o link do pack');
        }
      } catch (error) {
        console.error('Erro ao gerar link:', error);
        toast.error('Erro ao gerar o link do pack');
      } finally {
        setCarregandoShare(false);
      }
    }
  };

  // Abre o dialog de gerenciar arquivos (fotos/vídeos reais do pack)
  const abrirGerenciarMidia = (pack: any) => {
    setPackParaGerenciarMidia(pack);
    setDialogMidiaAberto(true);
    carregarMidias(pack.id);
  };

  const carregarMidias = async (packId: string) => {
    try {
      setCarregandoMidias(true);
      const response = await fetch(`/api/packs/${packId}/media`);
      if (response.ok) {
        setMidias(await response.json());
      } else {
        toast.error('Erro ao carregar arquivos do pack');
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error('Erro ao carregar arquivos do pack');
    } finally {
      setCarregandoMidias(false);
    }
  };

  const MAX_FOTO_BYTES = 8 * 1024 * 1024;  // 8MB — mesmo limite do servidor
  const MAX_VIDEO_BYTES = 30 * 1024 * 1024; // 30MB — mesmo limite do servidor

  // Valida e envia uma lista de arquivos para um pack; devolve quantos subiram.
  // Compartilhada entre o dialog de criar/editar e o "Gerenciar Arquivos".
  const enviarArquivosParaPack = async (packId: string, files: File[]) => {
    let enviados = 0;
    for (const file of files) {
      const tipo: 'photo' | 'video' = file.type.startsWith('video/') ? 'video' : 'photo';
      if (tipo === 'photo' && !file.type.startsWith('image/')) {
        toast.error(`"${file.name}": selecione apenas imagens ou vídeos.`);
        continue;
      }
      const maxBytes = tipo === 'photo' ? MAX_FOTO_BYTES : MAX_VIDEO_BYTES;
      if (file.size > maxBytes) {
        toast.error(`"${file.name}" é muito grande. Máximo ${Math.round(maxBytes / (1024 * 1024))}MB para ${tipo === 'photo' ? 'fotos' : 'vídeos'}.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', tipo);
      const response = await fetch(`/api/packs/${packId}/media`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        enviados++;
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || `Erro ao enviar "${file.name}"`);
      }
    }
    return enviados;
  };

  // Aceita vários arquivos de uma vez (input tem `multiple`) e envia um a um
  const handleUploadMidia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !packParaGerenciarMidia) return;
    e.target.value = '';

    setEnviandoMidia(true);
    try {
      const enviados = await enviarArquivosParaPack(packParaGerenciarMidia.id, files);
      if (enviados > 0) {
        toast.success(`${enviados} arquivo(s) enviado(s) com sucesso!`);
        carregarMidias(packParaGerenciarMidia.id);
        carregarPacks();
      }
    } catch (error) {
      console.error('Erro ao enviar arquivos:', error);
      toast.error('Erro ao enviar arquivos');
    } finally {
      setEnviandoMidia(false);
    }
  };

  const excluirMidia = async (mediaId: string) => {
    if (!packParaGerenciarMidia) return;
    try {
      const response = await fetch(`/api/packs/${packParaGerenciarMidia.id}/media/${mediaId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMidias((prev) => prev.filter((m) => m.id !== mediaId));
        carregarPacks();
      } else {
        toast.error('Erro ao excluir arquivo');
      }
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      toast.error('Erro ao excluir arquivo');
    }
  };

  const formatarTamanho = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // Máscara de celular (XX) XXXXX-XXXX
  const formatarCelular = (valor: string) => {
    const n = valor.replace(/\D/g, '');
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
  };

  // Monta a mensagem de oferta do pack, com o link de entrega no final
  const gerarMensagemVenda = (pack: any, link: string) => {
    if (!pack) return '';
    return (
      `✨ *${pack.name}* ✨\n\n` +
      `📸 ${pack.photos} fotos\n` +
      `🎬 ${pack.videos} vídeos\n\n` +
      `💰 Valor: R$ ${pack.price.toFixed(2)}\n\n` +
      `Garanta já o seu! 💖` +
      (link ? `\n\n📎 Suas fotos e vídeos:\n${link}` : '')
    );
  };

  // Compartilha a oferta via WhatsApp (com ou sem número do cliente)
  const compartilharWhatsApp = () => {
    const msg = gerarMensagemVenda(packParaVender, shareLink);
    const tel = telefoneVenda.replace(/\D/g, '');
    const base = tel ? `https://wa.me/55${tel}` : `https://wa.me/`;
    window.open(`${base}?text=${encodeURIComponent(msg)}`, '_blank');
    toast.success('Abrindo o WhatsApp...');
  };

  // Copia a mensagem de oferta para a área de transferência
  const copiarMensagem = async () => {
    try {
      await navigator.clipboard.writeText(gerarMensagemVenda(packParaVender, shareLink));
      toast.success('Mensagem copiada! Cole onde quiser.');
    } catch {
      toast.error('Não foi possível copiar a mensagem.');
    }
  };

  // Copia só o link de entrega (útil pra mandar por outro app, ex.: Instagram)
  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Link copiado!');
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
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

                  {/* Arquivos reais enviados */}
                  <p className={cn(
                    "text-xs mb-3 flex items-center gap-1",
                    (pack.mediaCount || 0) > 0 ? "text-emerald-600" : "text-amber-600"
                  )}>
                    <FolderOpen className="h-3.5 w-3.5" />
                    {(pack.mediaCount || 0) > 0
                      ? `${pack.mediaCount} arquivo(s) enviado(s)`
                      : 'Nenhum arquivo enviado ainda'}
                  </p>

                  {/* Botões */}
                  <div className="space-y-2">
                    {/* Vender / Enviar ao cliente — ação principal */}
                    <Button
                      onClick={() => abrirDialogVender(pack)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Vender / Enviar ao Cliente
                    </Button>
                    <Button
                      onClick={() => abrirGerenciarMidia(pack)}
                      variant="outline"
                      className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold flex items-center justify-center gap-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Gerenciar Arquivos
                    </Button>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Pack */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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

            {/* Upload de Imagem de Capa */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">🖼️ Imagem de Capa (Opcional)</Label>

              {/* Preview da imagem */}
              {formPack.coverImage ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-purple-300">
                  <img
                    src={formPack.coverImage}
                    alt="Capa do pack"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormPack(prev => ({ ...prev, coverImage: '' }))}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full h-36 border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer"
                >
                  {uploadingImage ? (
                    <p className="text-sm text-purple-600">Carregando...</p>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-purple-400" />
                      <p className="text-sm font-semibold text-purple-600">Toque para escolher foto</p>
                      <p className="text-xs text-gray-400">JPG, PNG ou WEBP • Máx 5 MB</p>
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Fotos e vídeos do pack — conteúdo real vendido ao cliente */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                📸 Fotos e vídeos do pack (opcional)
              </Label>
              <button
                type="button"
                onClick={() => novoPackFileInputRef.current?.click()}
                disabled={salvandoPack}
                className="w-full h-20 border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer disabled:opacity-60"
              >
                <Upload className="h-6 w-6 text-purple-400" />
                <p className="text-sm font-semibold text-purple-600">
                  {arquivosNovoPack.length > 0
                    ? `${arquivosNovoPack.length} arquivo(s) selecionado(s) — toque para adicionar mais`
                    : 'Selecionar fotos e vídeos (vários de uma vez)'}
                </p>
              </button>
              <input
                ref={novoPackFileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const novos = Array.from(e.target.files || []);
                  if (novos.length) setArquivosNovoPack((prev) => [...prev, ...novos]);
                  e.target.value = '';
                }}
              />
              {arquivosNovoPack.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {arquivosNovoPack.map((f, i) => (
                    <div
                      key={`${f.name}-${i}`}
                      className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700"
                    >
                      <span className="truncate">{f.type.startsWith('video/') ? '🎬' : '📷'} {f.name}</span>
                      <button
                        type="button"
                        onClick={() => setArquivosNovoPack((prev) => prev.filter((_, j) => j !== i))}
                        className="text-red-500 hover:text-red-700 shrink-0"
                        title="Remover da lista"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400">
                Os arquivos são enviados quando você salvar o pack. Depois também dá para adicionar/remover em "Gerenciar Arquivos".
              </p>
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
              disabled={salvandoPack}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg disabled:opacity-60"
            >
              {salvandoPack ? '⏳ Salvando...' : `💾 ${packParaEditar ? 'Atualizar' : 'Criar'} Pack`}
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

      {/* Dialog de Venda — enviar o pack ao cliente */}
      <Dialog open={dialogVenderAberto} onOpenChange={setDialogVenderAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-3 rounded-full">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                💸 Vender Pack
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-700 pt-2">
              Envie a oferta deste pack direto para o cliente pelo WhatsApp.
            </DialogDescription>
          </DialogHeader>

          {packParaVender && (
            <div className="space-y-4 py-2">
              {(packParaVender.mediaCount || 0) === 0 && (
                <div className="bg-amber-50 border border-amber-300 text-amber-800 px-3 py-2 rounded-md text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Este pack ainda não tem fotos/vídeos enviados — o cliente vai abrir o
                    link e não vai encontrar nada. Feche esta janela e use "Gerenciar
                    Arquivos" primeiro.
                  </span>
                </div>
              )}

              {/* Preview da mensagem */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs font-semibold text-green-700 mb-2">Prévia da mensagem:</p>
                {carregandoShare ? (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Gerando link...
                  </p>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
{gerarMensagemVenda(packParaVender, shareLink)}
                  </pre>
                )}
              </div>

              {/* Telefone do cliente (opcional) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  📱 WhatsApp do cliente (opcional)
                </Label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={telefoneVenda}
                  onChange={(e) => setTelefoneVenda(formatarCelular(e.target.value))}
                  maxLength={16}
                  className="shadow-sm"
                />
                <p className="text-xs text-gray-400">
                  Deixe em branco para escolher o contato na hora de enviar.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2">
            <Button
              onClick={compartilharWhatsApp}
              disabled={carregandoShare}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <MessageCircle className="h-5 w-5" />
              Enviar pelo WhatsApp
            </Button>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={copiarMensagem}
                disabled={carregandoShare}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border-2 border-gray-300 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Copy className="h-4 w-4" />
                Copiar mensagem
              </Button>
              <Button
                variant="outline"
                onClick={copiarLink}
                disabled={carregandoShare}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border-2 border-gray-300 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Link2 className="h-4 w-4" />
                Copiar link
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Gerenciar Arquivos — upload real de fotos/vídeos do pack */}
      <Dialog open={dialogMidiaAberto} onOpenChange={setDialogMidiaAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-3 rounded-full">
                <FolderOpen className="h-6 w-6 text-purple-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                📁 Arquivos do Pack
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-700 pt-2">
              {packParaGerenciarMidia?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <button
              type="button"
              onClick={() => midiaFileInputRef.current?.click()}
              disabled={enviandoMidia}
              className="w-full h-24 border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer disabled:opacity-60"
            >
              {enviandoMidia ? (
                <>
                  <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                  <p className="text-sm text-purple-600">Enviando...</p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-purple-400" />
                  <p className="text-sm font-semibold text-purple-600">Adicionar fotos ou vídeos</p>
                  <p className="text-xs text-gray-400">Pode selecionar vários • Fotos até 8MB • Vídeos até 30MB</p>
                </>
              )}
            </button>
            <input
              ref={midiaFileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleUploadMidia}
            />

            {carregandoMidias ? (
              <p className="text-sm text-gray-500 text-center py-4">Carregando arquivos...</p>
            ) : midias.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum arquivo enviado ainda.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {midias.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      {m.type === 'video' ? (
                        <Video className="h-4 w-4 text-blue-600 shrink-0" />
                      ) : (
                        <Images className="h-4 w-4 text-purple-600 shrink-0" />
                      )}
                      <span>{m.type === 'video' ? 'Vídeo' : 'Foto'} · {formatarTamanho(m.sizeBytes)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => excluirMidia(m.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogMidiaAberto(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border-2 border-gray-300"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
