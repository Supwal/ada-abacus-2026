/**
 * Validação e normalização de dados de cadastro.
 *
 * Usado tanto no cliente (feedback imediato no formulário) quanto no servidor
 * (a checagem que vale). Nunca confiar apenas na validação do navegador.
 */

/** Domínios digitados errado com frequência → sugestão de correção. */
const ERROS_COMUNS_DOMINIO: Record<string, string> = {
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'yahoo.co': 'yahoo.com.br',
  'bol.com': 'bol.com.br',
  'uol.com': 'uol.com.br',
}

/**
 * Deixa o e-mail em um formato único: sem espaços e em minúsculas.
 * Sem isso, "Maria@Gmail.com" e "maria@gmail.com" viram duas contas diferentes.
 */
export function normalizeEmail(email: unknown): string {
  if (typeof email !== 'string') return ''
  return email.trim().toLowerCase()
}

/**
 * Valida o formato do e-mail.
 *
 * Regras: exatamente um "@", parte local não vazia, domínio com pelo menos um
 * ponto, extensão com 2+ letras, sem espaços, sem pontos duplicados ou nas
 * pontas, e tamanho dentro do limite do padrão (254 caracteres).
 */
export function isValidEmail(email: unknown): boolean {
  const valor = normalizeEmail(email)

  if (!valor || valor.length > 254) return false
  if (/\s/.test(valor)) return false

  const partes = valor.split('@')
  if (partes.length !== 2) return false

  const [local, dominio] = partes

  if (!local || local.length > 64) return false
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false
  if (!/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return false

  if (!dominio || dominio.length > 253) return false
  if (dominio.startsWith('.') || dominio.endsWith('.') || dominio.includes('..')) return false
  if (dominio.startsWith('-') || dominio.endsWith('-')) return false
  if (!/^[a-z0-9.-]+$/.test(dominio)) return false

  const rotulos = dominio.split('.')
  if (rotulos.length < 2) return false
  if (rotulos.some((r) => r.length === 0 || r.startsWith('-') || r.endsWith('-'))) return false

  const extensao = rotulos[rotulos.length - 1]
  if (!/^[a-z]{2,}$/.test(extensao)) return false

  return true
}

/**
 * Sugere a correção quando o domínio parece um erro de digitação conhecido.
 * Devolve null quando não há sugestão.
 */
export function suggestEmailFix(email: unknown): string | null {
  const valor = normalizeEmail(email)
  const arroba = valor.lastIndexOf('@')
  if (arroba < 0) return null

  const local = valor.slice(0, arroba)
  const dominio = valor.slice(arroba + 1)
  const correcao = ERROS_COMUNS_DOMINIO[dominio]

  return correcao ? `${local}@${correcao}` : null
}

/** Mensagem pronta para exibir ao usuário, ou null quando o e-mail está válido. */
export function emailErrorMessage(email: unknown): string | null {
  const valor = normalizeEmail(email)
  if (!valor) return 'Informe o e-mail.'
  if (!valor.includes('@')) return 'E-mail inválido: está faltando o "@".'
  if (!isValidEmail(valor)) return 'E-mail inválido. Confira o endereço digitado (ex.: nome@provedor.com).'

  const sugestao = suggestEmailFix(valor)
  if (sugestao) return `Você quis dizer "${sugestao}"?`

  return null
}

export const MIN_SENHA = 8

/** Regras mínimas de senha. Devolve a mensagem de erro ou null. */
export function passwordErrorMessage(senha: unknown): string | null {
  if (typeof senha !== 'string' || senha.length === 0) return 'Informe a senha.'
  if (senha.length < MIN_SENHA) return `A senha deve ter pelo menos ${MIN_SENHA} caracteres.`
  if (!/[a-zA-Z]/.test(senha)) return 'A senha deve conter pelo menos uma letra.'
  if (!/[0-9]/.test(senha)) return 'A senha deve conter pelo menos um número.'
  return null
}
