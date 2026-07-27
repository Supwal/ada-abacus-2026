/**
 * FASE 3 da migração para Clerk — ponte entre a conta Clerk e o usuário
 * que já existe na tabela `users`.
 *
 * Objetivo: quando a profissional entrar pelo login novo, ela continua
 * vendo TODOS os dados dela (agendamentos, packs, locais, despesas), em
 * vez de cair numa conta vazia.
 *
 * ⚠️ SEGURANÇA — por que exigimos e-mail verificado:
 * O vínculo é feito casando o e-mail da conta Clerk com o e-mail do
 * usuário existente. Se aceitássemos um e-mail NÃO verificado, qualquer
 * pessoa poderia se cadastrar na Clerk digitando o e-mail da profissional
 * e, sem nunca provar que é dona dele, herdar a conta inteira dela —
 * um sequestro de conta. Por isso `vincularUsuarioClerk` só aceita
 * e-mails que a Clerk confirmou (código enviado e validado).
 */

export interface ResultadoVinculo {
  userId: string
  /** 'vinculado' = conta antiga reaproveitada | 'criado' = usuário novo | 'ja-vinculado' = nada a fazer */
  acao: 'ja-vinculado' | 'vinculado' | 'criado'
}

/** Cliente SQL do Neon (o mesmo que `getDb()` devolve). */
type ClienteSql = (
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<Record<string, any>[]>

/**
 * Encontra (ou cria) o usuário do app correspondente à conta Clerk.
 *
 * Recebe o cliente SQL por parâmetro (em vez de chamar `getDb()` aqui) para
 * não arrastar dependências do runtime do Next — assim esta lógica, que é
 * sensível para a segurança, pode ser testada isoladamente.
 *
 * @param sql          Cliente SQL (a rota passa `getDb()`).
 * @param clerkUserId  ID do usuário na Clerk (ex.: "user_2abc...").
 * @param email        E-mail da conta Clerk — DEVE estar verificado.
 * @param emailVerificado  Resultado da verificação vindo da Clerk.
 * @param nome         Nome para exibição, quando a Clerk fornecer.
 */
export async function vincularUsuarioClerk(
  sql: ClienteSql,
  clerkUserId: string,
  email: string,
  emailVerificado: boolean,
  nome?: string | null
): Promise<ResultadoVinculo> {
  if (!clerkUserId) throw new Error('clerkUserId é obrigatório')
  if (!email) throw new Error('email é obrigatório')
  if (!emailVerificado) {
    // Nunca vincular/criar a partir de e-mail não confirmado (ver nota acima).
    throw new Error('E-mail ainda não verificado na Clerk — vínculo recusado')
  }

  const emailNormalizado = email.trim().toLowerCase()

  // 1) Já vinculado? Caminho mais comum depois do primeiro login.
  const jaVinculado = await sql`
    SELECT id FROM users WHERE clerk_user_id = ${clerkUserId} LIMIT 1
  `
  if (jaVinculado.length) {
    return { userId: jaVinculado[0].id as string, acao: 'ja-vinculado' }
  }

  // 2) Existe conta antiga com esse e-mail? Vincula, preservando os dados.
  //    O WHERE com clerk_user_id IS NULL evita roubar uma conta já ligada
  //    a outra identidade Clerk.
  const vinculado = await sql`
    UPDATE users
    SET clerk_user_id = ${clerkUserId}, updated_at = NOW()
    WHERE LOWER(email) = ${emailNormalizado} AND clerk_user_id IS NULL
    RETURNING id
  `
  if (vinculado.length) {
    return { userId: vinculado[0].id as string, acao: 'vinculado' }
  }

  // 2b) O UPDATE acima não pegou nada. Se ainda assim existe alguém com esse
  //     e-mail, é porque a conta já está ligada a OUTRA identidade Clerk.
  //     Recusa explicitamente: criar seria violar o UNIQUE de email e, pior,
  //     tentar dar a conta de alguém a outra identidade.
  const emailOcupado = await sql`
    SELECT id FROM users WHERE LOWER(email) = ${emailNormalizado} LIMIT 1
  `
  if (emailOcupado.length) {
    throw new Error(
      'Este e-mail já está vinculado a outra conta de acesso. Entre com a conta original ou fale com o suporte.'
    )
  }

  // 3) Ninguém com esse e-mail: cria usuário novo já vinculado.
  //    Sem hashed_password — quem nasce pela Clerk não usa o login antigo.
  const id = crypto.randomUUID()
  const criado = await sql`
    INSERT INTO users (id, email, name, clerk_user_id, email_verified, created_at, updated_at)
    VALUES (${id}, ${emailNormalizado}, ${nome || null}, ${clerkUserId}, NOW(), NOW(), NOW())
    RETURNING id
  `
  return { userId: criado[0].id as string, acao: 'criado' }
}
