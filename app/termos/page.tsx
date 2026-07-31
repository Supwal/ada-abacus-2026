import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  APP_NAME,
  CONTACT_EMAIL,
  CONTROLLER_ADDRESS,
  CONTROLLER_DOC,
  CONTROLLER_NAME,
  JURISDICTION,
  LEGAL_EFFECTIVE_DATE,
  TERMS_VERSION,
} from "@/lib/legal";

export const metadata = {
  title: `Termos de Uso — ${APP_NAME}`,
  description: `Termos de Uso do aplicativo ${APP_NAME}.`,
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <article className="bg-white rounded-xl shadow-sm p-6 sm:p-10 prose-sm">
          <h1 className="text-2xl font-bold text-gray-900">Termos de Uso</h1>
          <p className="text-sm text-gray-500 mt-1">
            Versão {TERMS_VERSION} — vigente desde {LEGAL_EFFECTIVE_DATE}
          </p>

          <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Quem somos</h2>
              <p>
                O aplicativo {APP_NAME} é oferecido por {CONTROLLER_NAME}, inscrito sob o
                nº {CONTROLLER_DOC}, com endereço em {CONTROLLER_ADDRESS} (&quot;nós&quot;).
                Ao criar uma conta, você concorda com estes Termos de Uso e com a{" "}
                <Link href="/privacidade" className="text-blue-600 hover:underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. O que o aplicativo faz</h2>
              <p>
                O {APP_NAME} é uma ferramenta de organização profissional que permite registrar
                agendamentos, clientes, locais de atendimento, serviços, ganhos e despesas. O
                aplicativo é um apoio administrativo: não presta serviços de saúde, não emite
                documentos fiscais e não substitui obrigações contábeis ou tributárias do usuário.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Cadastro e conta</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>É necessário ter 18 anos ou mais para criar uma conta.</li>
                <li>Os dados informados no cadastro devem ser verdadeiros e atualizados.</li>
                <li>
                  A conta é pessoal e intransferível. Você é responsável por manter a senha em
                  sigilo e por todas as atividades realizadas na sua conta.
                </li>
                <li>
                  Cada conta possui dados totalmente separados. Agendamentos, clientes e registros
                  financeiros de uma conta não são acessíveis por outra.
                </li>
                <li>
                  Suspeitando de acesso indevido, troque a senha imediatamente e avise em{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                  .
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                4. Dados que você cadastra sobre terceiros
              </h2>
              <p>
                Ao registrar clientes (nome, telefone, observações), <strong>você</strong> é o
                responsável por esses dados perante a Lei Geral de Proteção de Dados (Lei
                13.709/2018). Cabe a você ter base legal para coletá-los, informar seus clientes
                sobre o uso e atender aos pedidos deles. Nós atuamos como operador, tratando esses
                dados apenas para fazer o aplicativo funcionar.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Uso permitido</h2>
              <p>Ao usar o {APP_NAME}, você se compromete a não:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>usar o aplicativo para atividade ilegal ou para lesar terceiros;</li>
                <li>tentar acessar dados ou contas de outros usuários;</li>
                <li>
                  burlar limites de plano, testar falhas de segurança sem autorização ou aplicar
                  engenharia reversa;
                </li>
                <li>
                  enviar conteúdo que viole direitos de terceiros ou publicar material de
                  terceiros sem autorização.
                </li>
              </ul>
              <p className="mt-2">
                O descumprimento pode levar à suspensão ou ao encerramento da conta.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Planos e pagamento</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Há plano gratuito e planos pagos por assinatura mensal, com os valores exibidos
                  no aplicativo no momento da contratação.
                </li>
                <li>
                  A cobrança é processada por parceiro de pagamento. Não armazenamos números
                  completos de cartão.
                </li>
                <li>
                  A assinatura pode ser cancelada a qualquer momento e permanece ativa até o fim do
                  período já pago. Não há reembolso proporcional de período em curso, salvo
                  exigência legal.
                </li>
                <li>
                  Alterações de preço são comunicadas com pelo menos 30 dias de antecedência e só
                  valem para as cobranças seguintes.
                </li>
                <li>
                  Conforme o art. 49 do Código de Defesa do Consumidor, você pode desistir da
                  contratação em até 7 dias corridos, com devolução integral do valor.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                7. Disponibilidade e responsabilidade
              </h2>
              <p>
                Trabalhamos para manter o serviço disponível, mas ele pode ficar fora do ar por
                manutenção, falha de terceiros ou motivo de força maior. O aplicativo é fornecido
                &quot;no estado em que se encontra&quot;. Não respondemos por lucros cessantes nem
                por decisões de negócio tomadas com base nas informações do aplicativo. Nada aqui
                afasta os direitos garantidos pelo Código de Defesa do Consumidor.
              </p>
              <p className="mt-2">
                <strong>Faça backup dos seus dados importantes.</strong> Alguns dados (como
                despesas lançadas) podem ficar salvos apenas no seu aparelho — limpar os dados do
                navegador ou desinstalar o aplicativo apaga essas informações.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Encerramento</h2>
              <p>
                Você pode encerrar sua conta a qualquer momento pelo próprio aplicativo ou
                solicitando em {CONTACT_EMAIL}. Podemos encerrar contas que violem estes Termos,
                com aviso prévio sempre que possível. Após o encerramento, os dados são tratados
                conforme a Política de Privacidade.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Alterações</h2>
              <p>
                Estes Termos podem ser atualizados. Mudanças relevantes serão avisadas no
                aplicativo com pelo menos 15 dias de antecedência, e o uso após esse prazo indica
                concordância com a nova versão.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Lei e foro</h2>
              <p>
                Aplica-se a legislação brasileira. Fica eleito o foro de {JURISDICTION}, sem
                prejuízo do direito do consumidor de acionar o foro do seu domicílio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Contato</h2>
              <p>
                Dúvidas sobre estes Termos:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </article>

        <p className="text-center text-xs text-gray-500 mt-6">
          <Link href="/privacidade" className="hover:underline">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
