'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MapPin } from 'lucide-react'

interface Sugestao {
  nome: string
  sigla: string
}

interface Props {
  cidade: string
  estado: string
  onSelect: (cidade: string, estado: string) => void
  className?: string
  required?: boolean
}

function toTitleCase(str: string) {
  const minusculas = ['da', 'de', 'do', 'das', 'des', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos']
  return str
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i === 0 || !minusculas.includes(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w)
    .join(' ')
}

export function CidadeAutocomplete({ cidade, estado, onSelect, className, required }: Props) {
  const [texto, setTexto] = useState('')
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [aberto, setAberto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })

  // Inicializa texto quando vêm dados externos (modo editar)
  useEffect(() => {
    if (cidade && estado) {
      setTexto(`${toTitleCase(cidade)} - ${estado.toUpperCase()}`)
    }
  }, [cidade, estado])

  const atualizarPosicao = () => {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setDropPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    })
  }

  const buscar = useCallback(async (q: string) => {
    if (q.length < 2) { setSugestoes([]); setAberto(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/brasil?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      const lista: Sugestao[] = data.sugestoes || []
      setSugestoes(lista)
      setHighlightIdx(-1)
      if (lista.length > 0) {
        atualizarPosicao()
        setAberto(true)
      } else {
        setAberto(false)
      }
    } catch {
      setSugestoes([])
      setAberto(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTexto(val)
    setAberto(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => buscar(val), 300)
  }

  const handleSelect = (s: Sugestao) => {
    const nomeFmt = toTitleCase(s.nome)
    setTexto(`${nomeFmt} - ${s.sigla}`)
    setSugestoes([])
    setAberto(false)
    onSelect(nomeFmt, s.sigla)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!aberto) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx(i => Math.min(i + 1, sugestoes.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault()
      handleSelect(sugestoes[highlightIdx])
    } else if (e.key === 'Escape') {
      setAberto(false)
    }
  }

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const dropdown = aberto && sugestoes.length > 0 && typeof document !== 'undefined'
    ? createPortal(
        <ul
          style={{
            position: 'absolute',
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            zIndex: 99999,
          }}
          className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
        >
          {sugestoes.map((s, idx) => (
            <li
              key={`${s.nome}-${s.sigla}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s) }}
              className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm
                ${idx === highlightIdx
                  ? 'bg-pink-100 dark:bg-pink-900/40'
                  : 'hover:bg-gray-50 dark:hover:bg-zinc-700'
                }`}
            >
              <MapPin className="h-3.5 w-3.5 text-pink-500 flex-shrink-0" />
              <span className="text-gray-900 dark:text-gray-100">
                <span className="font-semibold">{toTitleCase(s.nome)}</span>
                <span className="text-gray-400 dark:text-gray-400"> — {s.sigla}</span>
              </span>
            </li>
          ))}
        </ul>,
        document.body
      )
    : null

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={texto}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => sugestoes.length > 0 && (atualizarPosicao(), setAberto(true))}
          required={required}
          autoComplete="off"
          spellCheck={false}
          placeholder="Ex: Santo André, Salvador, Curitiba..."
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            ring-offset-background placeholder:text-muted-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            shadow-sm pr-8 ${className ?? ''}`}
        />
        {loading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {dropdown}

      {/* Confirmação após seleção */}
      {estado && cidade && texto.includes(' - ') && (
        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
          ✓ {toTitleCase(cidade)} — {estado.toUpperCase()}
        </p>
      )}
    </div>
  )
}
