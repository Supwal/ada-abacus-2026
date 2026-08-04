
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Instagram,
  Send,
  MessageCircle,
  Lock,
  ExternalLink,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CHANNEL_DEFS,
  buildChannelUrl,
  channelErrorMessage,
  normalizeHandle,
  type ChannelType,
} from "@/lib/channels";

const ICONES: Record<ChannelType, any> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  telegram: Send,
  privacy: Lock,
};

const CORES: Record<ChannelType, { icone: string; botao: string }> = {
  whatsapp: {
    icone: "text-green-600",
    botao: "bg-green-600 hover:bg-green-700 text-white",
  },
  instagram: {
    icone: "text-pink-600",
    botao: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white",
  },
  telegram: {
    icone: "text-sky-500",
    botao: "bg-sky-500 hover:bg-sky-600 text-white",
  },
  privacy: {
    icone: "text-purple-600",
    botao: "bg-purple-600 hover:bg-purple-700 text-white",
  },
};

/** Estado de um canal na tela. */
type EstadoCanal = { handle: string; greeting: string };

const VAZIO: Record<ChannelType, EstadoCanal> = {
  whatsapp: { handle: '', greeting: '' },
  instagram: { handle: '', greeting: '' },
  telegram: { handle: '', greeting: '' },
  privacy: { handle: '', greeting: '' },
};

export default function RedesSociaisPage() {
  const [canais, setCanais] = useState<Record<ChannelType, EstadoCanal>>(VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Partial<Record<ChannelType, string>>>({});

  // Carrega o que já está salvo
  useEffect(() => {
    const carregar = async () => {
      try {
        const resp = await fetch('/api/channels');
        if (resp.ok) {
          const lista = await resp.json();
          const novo = { ...VAZIO };
          for (const c of lista) {
            if (c.type in novo) {
              novo[c.type as ChannelType] = {
                handle: c.handle || '',
                greeting: c.greeting || '',
              };
            }
          }
          setCanais(novo);
        }
      } catch {
        toast.error('Não foi possível carregar seus canais.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const atualizar = (tipo: ChannelType, campo: keyof EstadoCanal, valor: string) => {
    setCanais(prev => ({ ...prev, [tipo]: { ...prev[tipo], [campo]: valor } }));
    setErros(prev => ({ ...prev, [tipo]: undefined }));
  };

  // Abre o canal de verdade, para ela conferir antes de divulgar
  const testar = (tipo: ChannelType) => {
    const { handle, greeting } = canais[tipo];
    const erro = channelErrorMessage(tipo, handle);
    if (erro) {
      setErros(prev => ({ ...prev, [tipo]: erro }));
      toast.error(erro);
      return;
    }
    const url = buildChannelUrl(tipo, handle, greeting);
    if (!url) {
      toast.error('Preencha o campo acima primeiro.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copiarLink = async (tipo: ChannelType) => {
    const url = buildChannelUrl(tipo, canais[tipo].handle, canais[tipo].greeting);
    if (!url) {
      toast.error('Preencha o campo acima primeiro.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado! Cole na sua bio.');
    } catch {
      toast.error('Não foi possível copiar. Copie manualmente: ' + url);
    }
  };

  const salvar = async () => {
    // Valida tudo antes de mandar
    const novosErros: Partial<Record<ChannelType, string>> = {};
    for (const def of CHANNEL_DEFS) {
      const erro = channelErrorMessage(def.type, canais[def.type].handle);
      if (erro) novosErros[def.type] = erro;
    }
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      toast.error('Confira os campos destacados.');
      return;
    }

    setSalvando(true);
    try {
      const resp = await fetch('/api/channels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: CHANNEL_DEFS.map((def, i) => ({
            type: def.type,
            handle: canais[def.type].handle,
            greeting: canais[def.type].greeting,
            active: true,
            sortOrder: i,
          })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao salvar');
      }

      // Reflete o que o servidor gravou (números e @ já normalizados)
      const lista = await resp.json();
      const novo = { ...VAZIO };
      for (const c of lista) {
        if (c.type in novo) {
          novo[c.type as ChannelType] = { handle: c.handle || '', greeting: c.greeting || '' };
        }
      }
      setCanais(novo);
      toast.success('✅ Canais salvos!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  const configurados = CHANNEL_DEFS.filter(
    d => normalizeHandle(d.type, canais[d.type].handle) !== ''
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header com botão voltar */}
        <div>
          <Link href="/painel-controle">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Menu
            </Button>
          </Link>
        </div>

        {/* Título */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Canais de Atendimento
          </h1>
          <p className="text-gray-600 mt-2">
            Cadastre onde o cliente fala com você. O app monta o link que abre a
            conversa direto — sem o cliente precisar procurar seu contato.
          </p>
          {!carregando && (
            <p className="text-sm text-gray-500 mt-1">
              {configurados} de {CHANNEL_DEFS.length} canais configurados
            </p>
          )}
        </div>

        {carregando ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {CHANNEL_DEFS.map((def) => {
                const Icone = ICONES[def.type];
                const cor = CORES[def.type];
                const estado = canais[def.type];
                const preenchido = normalizeHandle(def.type, estado.handle) !== '';
                const erro = erros[def.type];

                return (
                  <Card
                    key={def.type}
                    className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200 bg-white"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Ícone e título */}
                      <div className="flex items-center gap-3">
                        <div className={cor.icone}>
                          <Icone className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{def.label}</h3>
                        {preenchido && (
                          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                            <Check className="h-3 w-3" />
                            Ativo
                          </span>
                        )}
                      </div>

                      {/* Identificador */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">
                          {def.type === 'whatsapp' ? 'Seu número' : 'Seu usuário'}
                        </Label>
                        <Input
                          value={estado.handle}
                          onChange={(e) => atualizar(def.type, 'handle', e.target.value)}
                          placeholder={def.placeholder}
                          inputMode={def.type === 'whatsapp' ? 'tel' : 'text'}
                          className={erro ? 'border-red-500 focus-visible:ring-red-500' : ''}
                        />
                        <p className={`text-xs ${erro ? 'text-red-600' : 'text-gray-500'}`}>
                          {erro || def.ajuda}
                        </p>
                      </div>

                      {/* Mensagem de abertura — só o WhatsApp aceita */}
                      {def.aceitaMensagem && (
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-gray-700">
                            Mensagem que já vem escrita
                          </Label>
                          <Input
                            value={estado.greeting}
                            onChange={(e) => atualizar(def.type, 'greeting', e.target.value)}
                            placeholder="Ex: Oi! Vi seu link e quero saber os horários"
                          />
                          <p className="text-xs text-gray-500">
                            O cliente abre a conversa com esse texto pronto — é só ele enviar.
                          </p>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={() => testar(def.type)}
                          disabled={!preenchido}
                          className={`flex-1 font-semibold ${cor.botao}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {def.acao}
                        </Button>
                        <Button
                          onClick={() => copiarLink(def.type)}
                          disabled={!preenchido}
                          variant="outline"
                          title="Copiar o link para colar na bio"
                        >
                          Copiar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Salvar */}
            <div className="sticky bottom-4">
              <Button
                onClick={salvar}
                disabled={salvando}
                size="lg"
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold shadow-lg"
              >
                {salvando ? '⏳ Salvando...' : '💾 Salvar canais'}
              </Button>
            </div>

            {/* Como usar */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-xl font-bold text-gray-900">Como usar</h2>
                <ul className="text-gray-600 text-sm space-y-2 list-disc pl-5">
                  <li>
                    <strong>Testar antes de divulgar:</strong> o botão colorido abre o
                    canal de verdade. Se abrir a conversa certa, está pronto.
                  </li>
                  <li>
                    <strong>Copiar:</strong> pega o link para colar na bio do Instagram,
                    no Privacy ou onde quiser.
                  </li>
                  <li>
                    <strong>WhatsApp:</strong> é o único que aceita mensagem pronta. Use
                    isso para saber de onde o cliente veio.
                  </li>
                  <li>
                    <strong>Privacy:</strong> lá a conversa acontece dentro da plataforma,
                    só para assinantes — por isso o botão convida a assinar.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
