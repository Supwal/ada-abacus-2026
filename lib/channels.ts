/**
 * Canais de atendimento — onde a cliente conversa (ou assina).
 *
 * Não existe "conectar" de verdade nessas plataformas sem API oficial cara e
 * burocrática (Meta Business, WhatsApp Cloud API paga por conversa). O que
 * funciona hoje, de graça e em qualquer celular, é o link direto — mesmo
 * padrão que a tela de Packs já usa para mandar a oferta no WhatsApp.
 */

export type ChannelType = 'whatsapp' | 'instagram' | 'telegram' | 'privacy'

/**
 * Natureza do canal — muda o que o botão promete ao cliente.
 * - 'conversa': abre um chat direto (WhatsApp, Telegram, Instagram)
 * - 'vitrine' : leva ao perfil; a conversa só acontece lá dentro (Privacy)
 */
export type ChannelKind = 'conversa' | 'vitrine'

export interface ChannelDef {
  type: ChannelType
  label: string
  kind: ChannelKind
  /** Texto do botão que abre o canal. */
  acao: string
  /** O que a profissional digita no campo. */
  placeholder: string
  ajuda: string
  /** Aceita mensagem de abertura pré-preenchida? (só o WhatsApp aceita) */
  aceitaMensagem: boolean
}

export const CHANNEL_DEFS: ChannelDef[] = [
  {
    type: 'whatsapp',
    label: 'WhatsApp',
    kind: 'conversa',
    acao: 'Chamar no WhatsApp',
    placeholder: '(11) 99999-9999',
    ajuda: 'Seu número com DDD. O cliente abre a conversa já com a mensagem escrita.',
    aceitaMensagem: true,
  },
  {
    type: 'instagram',
    label: 'Instagram',
    kind: 'conversa',
    acao: 'Chamar no Direct',
    placeholder: 'seu_usuario',
    ajuda: 'Seu @ sem o arroba. O link abre o Direct direto na sua conta.',
    aceitaMensagem: false,
  },
  {
    type: 'telegram',
    label: 'Telegram',
    kind: 'conversa',
    acao: 'Chamar no Telegram',
    placeholder: 'seu_usuario',
    ajuda: 'Seu nome de usuário do Telegram, sem o arroba.',
    aceitaMensagem: false,
  },
  {
    type: 'privacy',
    label: 'Privacy',
    kind: 'vitrine',
    acao: 'Assinar meu Privacy',
    placeholder: 'seu_usuario  ou  cole a URL do seu perfil',
    ajuda:
      'No Privacy a conversa acontece dentro da plataforma, só para assinantes — por isso o botão convida a assinar, não a conversar. Se o link montado não abrir seu perfil, cole a URL completa aqui.',
    aceitaMensagem: false,
  },
]

export function getChannelDef(type: string): ChannelDef | undefined {
  return CHANNEL_DEFS.find((c) => c.type === type)
}

/** Só dígitos — usado no telefone do WhatsApp. */
function apenasDigitos(valor: string): string {
  return (valor || '').replace(/\D/g, '')
}

/** Tira @, espaços e uma URL inteira colada, deixando só o nome de usuário. */
export function normalizeHandle(type: ChannelType, valor: string): string {
  const bruto = (valor || '').trim()
  if (!bruto) return ''

  if (type === 'whatsapp') return apenasDigitos(bruto)

  // Se colaram a URL inteira, fica com o último pedaço do caminho.
  if (/^https?:\/\//i.test(bruto)) {
    // No Privacy a URL completa é guardada como está: o formato do perfil
    // varia e uma URL que já funciona vale mais que um palpite nosso.
    if (type === 'privacy') return bruto
    try {
      const partes = new URL(bruto).pathname.split('/').filter(Boolean)
      return (partes[partes.length - 1] || '').replace(/^@/, '')
    } catch {
      return bruto.replace(/^@/, '')
    }
  }

  return bruto.replace(/^@/, '').replace(/\s+/g, '')
}

/** Validação do que foi digitado. Devolve a mensagem de erro ou null. */
export function channelErrorMessage(type: ChannelType, valor: string): string | null {
  const handle = normalizeHandle(type, valor)
  if (!handle) return null // vazio = canal não configurado, não é erro

  if (type === 'whatsapp') {
    // 10 = fixo com DDD, 11 = celular com DDD, 12/13 = já com o 55 na frente
    if (handle.length < 10 || handle.length > 13) {
      return 'Número incompleto. Use DDD + número, ex.: (11) 99999-9999.'
    }
    return null
  }

  if (type === 'privacy' && /^https?:\/\//i.test(handle)) {
    return null // URL completa colada — aceita como está
  }

  if (!/^[a-zA-Z0-9._-]{2,40}$/.test(handle)) {
    return 'Usuário inválido. Use apenas letras, números, ponto, hífen ou _.'
  }
  return null
}

/**
 * Monta o link que abre o canal.
 *
 * O WhatsApp é o único que aceita mensagem pronta (parâmetro ?text=).
 * Devolve null quando o canal não tem identificador configurado.
 */
export function buildChannelUrl(
  type: ChannelType,
  valor: string,
  mensagem?: string | null
): string | null {
  const handle = normalizeHandle(type, valor)
  if (!handle) return null

  switch (type) {
    case 'whatsapp': {
      // wa.me exige o código do país. Menos de 12 dígitos = número nacional
      // sem o 55, então acrescentamos.
      const numero = handle.length >= 12 ? handle : `55${handle}`
      const texto = mensagem?.trim()
      return `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`
    }

    // ig.me/m/<usuario> abre a caixa de mensagens, não o perfil.
    case 'instagram':
      return `https://ig.me/m/${handle}`

    case 'telegram':
      return `https://t.me/${handle}`

    case 'privacy':
      return /^https?:\/\//i.test(handle)
        ? handle
        : `https://privacy.com.br/${handle}`

    default:
      return null
  }
}
