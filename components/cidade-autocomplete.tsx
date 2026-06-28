'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface Sugestao {
  nome: string
  sigla: string
}

interface Props {
  cidade: string
  estado: string
  onSelect: (cidade: string, estado: string) => void
  required?: boolean
}

// Capitaliza preservando preposições
function fmt(str: string) {
  const prep = new Set(['da', 'de', 'do', 'das', 'dos', 'des', 'e', 'em', 'na', 'no', 'nas', 'nos'])
  return str.toLowerCase().split(' ').map((w, i) =>
    i === 0 || !prep.has(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w
  ).join(' ')
}

export function CidadeAutocomplete({ cidade, estado, onSelect, required }: Props) {
  const [input, setInput] = useState('')
  const [lista, setLista] = useState<Sugestao[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const [idx, setIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const mounted = useRef(false)

  useEffect(() => { mounted.current = true }, [])

  // Carrega valor inicial no modo editar
  useEffect(() => {
    if (cidade && estado) setInput(`${fmt(cidade)} - ${estado.toUpperCase()}`)
  }, [cidade, estado])

  const calcPos = () => {
    if (!inputRef.current) return
    const r = inputRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + window.scrollY + 2, left: r.left + window.scrollX, width: r.width })
  }

  const buscar = useCallback(async (q: string) => {
    if (q.length < 2) { setLista([]); setOpen(false); return }
    setBusy(true)
    try {
      const r = await fetch(`/api/brasil?q=${encodeURIComponent(q)}`)
      if (!r.ok) throw new Error('erro')
      const d = await r.json()
      const res: Sugestao[] = d.sugestoes ?? []
      setLista(res)
      setIdx(-1)
      if (res.length > 0) { calcPos(); setOpen(true) } else setOpen(false)
    } catch {
      setLista([]); setOpen(false)
    } finally {
      setBusy(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInput(v)
    setOpen(false)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => buscar(v), 300)
  }

  const pick = (s: Sugestao) => {
    const nome = fmt(s.nome)
    setInput(`${nome} - ${s.sigla}`)
    setLista([])
    setOpen(false)
    onSelect(nome, s.sigla)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, lista.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); pick(lista[idx]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKey}
          onFocus={() => { if (lista.length > 0) { calcPos(); setOpen(true) } }}
          required={required}
          autoComplete="off"
          spellCheck={false}
          placeholder="Digite o nome da cidade..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm
            ring-offset-background placeholder:text-muted-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {busy
            ? <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            : <MapPin className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </div>

      {/* Dropdown fixo — escapa qualquer overflow do layout */}
      {open && lista.length > 0 && mounted.current && (
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
          className="rounded-lg border border-border bg-popover shadow-xl overflow-hidden"
        >
          <ul className="max-h-56 overflow-y-auto py-1">
            {lista.map((s, i) => (
              <li
                key={`${s.nome}-${s.sigla}`}
                onMouseDown={(e) => { e.preventDefault(); pick(s) }}
                className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer text-sm transition-colors
                  ${i === idx ? 'bg-accent' : 'hover:bg-accent'}`}
              >
                <MapPin className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                <span className="text-popover-foreground">
                  <span className="font-medium">{fmt(s.nome)}</span>
                  <span className="text-muted-foreground"> — {s.sigla}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
