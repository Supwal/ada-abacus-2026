'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Pede o aceite dos Termos de Uso e da Política de Privacidade para quem ainda
 * não aceitou — contas criadas antes destes documentos ou antes de uma versão
 * nova. Enquanto o aceite não é registrado, o painel não aparece.
 *
 * Falha de rede não bloqueia o app: se a verificação não responder, o usuário
 * segue usando normalmente e o aceite é pedido no próximo acesso.
 */
export function ConsentGate({ children }: { children: React.ReactNode }) {
  const [precisaAceitar, setPrecisaAceitar] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [marcado, setMarcado] = useState(false);

  useEffect(() => {
    let ativo = true;

    const verificar = async () => {
      try {
        const resposta = await fetch('/api/consent');
        if (!resposta.ok) return;
        const dados = await resposta.json();
        if (ativo) setPrecisaAceitar(dados.accepted === false);
      } catch {
        /* offline ou instável — não bloquear o uso */
      } finally {
        if (ativo) setVerificando(false);
      }
    };

    verificar();
    return () => { ativo = false; };
  }, []);

  const registrarAceite = async () => {
    setEnviando(true);
    try {
      const resposta = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accepted: true }),
      });
      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        throw new Error(dados.error || 'Erro ao registrar o aceite.');
      }
      setPrecisaAceitar(false);
      toast.success('Aceite registrado. Obrigado!');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao registrar o aceite.');
    } finally {
      setEnviando(false);
    }
  };

  if (verificando || !precisaAceitar) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 my-8">
        <h2 className="text-lg font-bold text-gray-900">
          Precisamos da sua confirmação
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Atualizamos os documentos do aplicativo. Para continuar usando o A.D.A., leia e
          confirme os termos abaixo.
        </p>

        <div className="mt-5 flex items-start gap-2">
          <input
            id="aceiteAtualizacao"
            type="checkbox"
            checked={marcado}
            onChange={(e) => setMarcado(e.target.checked)}
            disabled={enviando}
            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="aceiteAtualizacao" className="text-xs text-gray-600 leading-relaxed">
            Li e aceito os{" "}
            <Link
              href="/termos"
              target="_blank"
              className="font-medium text-blue-600 hover:text-blue-500 underline"
            >
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link
              href="/privacidade"
              target="_blank"
              className="font-medium text-blue-600 hover:text-blue-500 underline"
            >
              Política de Privacidade
            </Link>
            , e autorizo o tratamento dos meus dados pessoais conforme a Lei Geral de Proteção
            de Dados.
          </label>
        </div>

        <Button
          onClick={registrarAceite}
          disabled={!marcado || enviando}
          className="w-full mt-6"
        >
          {enviando ? "Registrando..." : "Confirmar e continuar"}
        </Button>

        <p className="text-[11px] text-gray-400 text-center mt-3">
          Guardamos a data e a versão aceita, como exige a LGPD.
        </p>
      </div>
    </div>
  );
}
