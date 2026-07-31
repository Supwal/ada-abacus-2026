import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  APP_NAME,
  CONTACT_EMAIL,
  CONTROLLER_ADDRESS,
  CONTROLLER_DOC,
  CONTROLLER_NAME,
  LEGAL_EFFECTIVE_DATE,
  RETENTION_PERIOD,
  TERMS_VERSION,
} from "@/lib/legal";

export const metadata = {
  title: `Política de Privacidade — ${APP_NAME}`,
  description: `Como o aplicativo ${APP_NAME} coleta, usa e protege dados pessoais.`,
};

export default function PrivacidadePage() {
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

        <article className="bg-white rounded-xl shadow-sm p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-gray-900">Política de Privacidade</h1>
          <p className="text-sm text-gray-500 mt-1">
            Versão {TERMS_VERSION} — vigente desde {LEGAL_EFFECTIVE_DATE}
          </p>

          <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Controlador dos dados</h2>
              <p>
                {CONTROLLER_NAME}, nº {CONTROLLER_DOC}, com endereço em {CONTROLLER_ADDRESS}, é o
                controlador dos dados pessoais tratados no {APP_NAME}, nos termos da Lei Geral de
                Proteção de Dados (Lei 13.709/2018).
              </p>
              <p className="mt-2">
                Contato para assuntos de privacidade:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Dados que coletamos</h2>

              <h3 className="font-medium text-gray-900 mt-4">Dados da sua conta</h3>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>nome e sobrenome;</li>
                <li>e-mail (usado como identificador de login);</li>
                <li>telefone;</li>
                <li>profissão;</li>
                <li>
                  senha — guardada apenas como código embaralhado irreversível (PBKDF2), nunca em
                  texto legível.
                </li>
              </ul>

              <h3 className="font-medium text-gray-900 mt-4">Dados que você cadastra</h3>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>clientes (nome, telefone, e-mail e observações);</li>
                <li>agendamentos (data, horário, local, valor e forma de pagamento);</li>
                <li>locais de atendimento e serviços;</li>
                <li>ganhos e despesas;</li>
                <li>arquivos que você envia ao aplicativo.</li>
              </ul>

              <h3 className="font-medium text-gray-900 mt-4">Dados de uso</h3>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>registros técnicos de acesso, necessários para segurança;</li>
                <li>
                  informações guardadas no seu próprio aparelho (preferências de tela e alguns
                  lançamentos), separadas por conta.
                </li>
              </ul>
              <p className="mt-3">
                Não coletamos dados de geolocalização precisa, não usamos os seus dados para
                treinar modelos de inteligência artificial e não fazemos decisões automatizadas
                que afetem você.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                3. Por que usamos esses dados
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse mt-2">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 border border-gray-200 font-medium">
                        Finalidade
                      </th>
                      <th className="text-left p-2 border border-gray-200 font-medium">
                        Base legal (LGPD)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-gray-200">
                        Criar e manter sua conta e prestar o serviço
                      </td>
                      <td className="p-2 border border-gray-200">
                        Execução de contrato (art. 7º, V)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-200">
                        Processar pagamentos de assinatura
                      </td>
                      <td className="p-2 border border-gray-200">
                        Execução de contrato e obrigação legal (art. 7º, V e II)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-200">
                        Segurança, prevenção a fraude e registro de acessos
                      </td>
                      <td className="p-2 border border-gray-200">
                        Legítimo interesse e obrigação legal (art. 7º, IX e II)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-200">Suporte ao usuário</td>
                      <td className="p-2 border border-gray-200">
                        Execução de contrato (art. 7º, V)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-200">
                        Comunicações promocionais (quando houver)
                      </td>
                      <td className="p-2 border border-gray-200">
                        Consentimento (art. 7º, I) — revogável a qualquer momento
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                <strong>Não vendemos seus dados</strong> e não os compartilhamos para publicidade
                de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                4. Separação entre contas
              </h2>
              <p>
                Cada conta tem seu próprio espaço de dados. Agendamentos, clientes, locais,
                serviços, ganhos e despesas são gravados vinculados ao dono e toda consulta é
                filtrada por esse vínculo — inclusive as informações guardadas no aparelho. Nenhum
                usuário enxerga o cadastro de outro, mesmo usando o mesmo celular ou computador.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Com quem compartilhamos</h2>
              <p>Apenas com fornecedores necessários para o funcionamento do serviço:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                  <strong>Provedor de banco de dados e hospedagem</strong> — armazenamento e
                  entrega do aplicativo;
                </li>
                <li>
                  <strong>Processador de pagamentos</strong> — cobrança das assinaturas;
                </li>
                <li>
                  <strong>Autoridades públicas</strong> — quando houver ordem judicial ou
                  obrigação legal.
                </li>
              </ul>
              <p className="mt-2">
                Parte da infraestrutura pode estar fora do Brasil. Nesses casos, a transferência
                internacional segue o art. 33 da LGPD, com cláusulas contratuais de proteção.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Por quanto tempo guardamos</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Conta ativa:</strong> enquanto durar a relação com você.
                </li>
                <li>
                  <strong>Após o encerramento:</strong> dados fiscais e de cobrança por{" "}
                  {RETENTION_PERIOD}, por exigência legal; o restante é apagado ou anonimizado em
                  até 30 dias.
                </li>
                <li>
                  <strong>Registros de acesso:</strong> 6 meses, conforme o Marco Civil da
                  Internet.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Seus direitos</h2>
              <p>
                A LGPD (art. 18) garante a você o direito de confirmar a existência de tratamento,
                acessar seus dados, corrigir dados incompletos ou desatualizados, solicitar
                anonimização ou exclusão, pedir a portabilidade, revogar consentimento e se opor a
                tratamentos feitos com base em legítimo interesse.
              </p>
              <p className="mt-2">
                Para exercer qualquer um deles, escreva para{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                  {CONTACT_EMAIL}
                </a>
                . Respondemos em até 15 dias. Você também pode reclamar à ANPD (
                <span className="whitespace-nowrap">gov.br/anpd</span>).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Segurança</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>conexão criptografada (HTTPS) em todo o aplicativo;</li>
                <li>senhas guardadas apenas como código embaralhado irreversível;</li>
                <li>sessão em cookie protegido, com encerramento automático por inatividade;</li>
                <li>toda consulta ao banco filtrada pelo dono do dado.</li>
              </ul>
              <p className="mt-2">
                Nenhum sistema é 100% seguro. Havendo incidente com risco relevante, avisaremos
                você e a ANPD nos prazos legais.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Crianças e adolescentes</h2>
              <p>
                O {APP_NAME} é destinado a maiores de 18 anos e não coleta intencionalmente dados
                de menores. Identificando um cadastro nessas condições, a conta será removida.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Alterações</h2>
              <p>
                Esta política pode ser atualizada. Mudanças relevantes serão avisadas no
                aplicativo com pelo menos 15 dias de antecedência.
              </p>
            </section>
          </div>
        </article>

        <p className="text-center text-xs text-gray-500 mt-6">
          <Link href="/termos" className="hover:underline">
            Termos de Uso
          </Link>
        </p>
      </div>
    </div>
  );
}
