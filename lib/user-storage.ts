'use client'

/**
 * Armazenamento local ISOLADO POR USUÁRIO.
 *
 * O `localStorage` pertence ao navegador, não à conta. Enquanto o app gravava
 * direto em chaves fixas ("despesas", "ada_contador_2026-07-30", ...), qualquer
 * pessoa que entrasse com outro e-mail no mesmo aparelho herdava o estado da
 * conta anterior — foi assim que um cadastro novo começou em "Cli006",
 * continuando a numeração de outro usuário.
 *
 * Aqui toda chave passa a viver dentro do escopo do usuário logado:
 *
 *     ada:u:<escopo>:<nome>
 *
 * Regras:
 * - Sem escopo definido, ler devolve o padrão e gravar é ignorado (nunca cai
 *   de volta na chave global — é exatamente esse fallback que vazava dados).
 * - Cada conta mantém o próprio espaço; trocar de usuário não apaga o do outro,
 *   só deixa de enxergá-lo.
 */

const PREFIXO = 'ada:u:'

/** Chaves da versão antiga, sem dono definido — não dá para saber de quem são. */
const CHAVES_LEGADAS_EXATAS = [
  'despesas',
  'categoriasDespesas',
  'categoriasDespesasPersonalizadas',
  'tiposPagamentoPersonalizados',
]

const PREFIXOS_LEGADOS = ['ada_contador_', 'ada_form_prefs_', 'agendamentos_']

let escopoAtual: string | null = null

function temStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

/**
 * Define o usuário dono do armazenamento local. Deve ser chamado antes de
 * qualquer leitura/escrita (o `UserScopeGuard` faz isso no layout do painel).
 */
export function setUserScope(id: string | null | undefined) {
  escopoAtual = id ? String(id).trim().toLowerCase() : null
}

export function getUserScope(): string | null {
  return escopoAtual
}

export function hasUserScope(): boolean {
  return escopoAtual !== null && escopoAtual !== ''
}

/** Monta a chave completa. Devolve null quando não há usuário definido. */
export function scopedKey(nome: string): string | null {
  if (!hasUserScope()) return null
  return `${PREFIXO}${escopoAtual}:${nome}`
}

export function readItem(nome: string): string | null {
  if (!temStorage()) return null
  const chave = scopedKey(nome)
  if (!chave) return null
  try {
    return window.localStorage.getItem(chave)
  } catch {
    return null
  }
}

export function writeItem(nome: string, valor: string): void {
  if (!temStorage()) return
  const chave = scopedKey(nome)
  if (!chave) return
  try {
    window.localStorage.setItem(chave, valor)
  } catch {
    /* cota cheia ou modo privativo — ignorar */
  }
}

export function removeItem(nome: string): void {
  if (!temStorage()) return
  const chave = scopedKey(nome)
  if (!chave) return
  try {
    window.localStorage.removeItem(chave)
  } catch {
    /* ignorar */
  }
}

export function readJson<T>(nome: string, padrao: T): T {
  const bruto = readItem(nome)
  if (bruto === null) return padrao
  try {
    const valor = JSON.parse(bruto)
    return (valor ?? padrao) as T
  } catch {
    return padrao
  }
}

export function writeJson(nome: string, valor: unknown): void {
  try {
    writeItem(nome, JSON.stringify(valor))
  } catch {
    /* ignorar */
  }
}

/** Nomes (sem prefixo) de todas as chaves do usuário atual. */
export function listScopedNames(): string[] {
  if (!temStorage() || !hasUserScope()) return []
  const inicio = `${PREFIXO}${escopoAtual}:`
  try {
    return Object.keys(window.localStorage)
      .filter((k) => k.startsWith(inicio))
      .map((k) => k.slice(inicio.length))
  } catch {
    return []
  }
}

/** Apaga tudo que pertence ao usuário atual (usado em "limpar dados"). */
export function clearCurrentScope(): void {
  if (!temStorage()) return
  listScopedNames().forEach((nome) => removeItem(nome))
}

/**
 * Remove o resíduo da versão anterior — chaves globais que não têm dono
 * identificável e que, se ficassem, continuariam sendo lidas por qualquer
 * conta que entrasse no aparelho. Roda uma única vez por navegador.
 */
export function purgeLegacyKeys(): number {
  if (!temStorage()) return 0
  const MARCADOR = 'ada:legacy-purged'
  try {
    if (window.localStorage.getItem(MARCADOR) === '1') return 0

    let removidas = 0
    Object.keys(window.localStorage).forEach((chave) => {
      const ehLegada =
        CHAVES_LEGADAS_EXATAS.includes(chave) ||
        PREFIXOS_LEGADOS.some((p) => chave.startsWith(p))
      if (ehLegada) {
        window.localStorage.removeItem(chave)
        removidas++
      }
    })

    window.localStorage.setItem(MARCADOR, '1')
    return removidas
  } catch {
    return 0
  }
}
