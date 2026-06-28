'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'

interface Sugestao {
  nome: string
  sigla: string
  label: string
}

interface Props {
  cidade: string
  estado: string
  onSelect: (cidade: string, estado: string) => void
  className?: string
  required?: boolean
}

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (w) =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  )
}

export function CidadeAutocomplete({ cidade, estado, onSelect, className, required }: Props) {
  const [texto, setTexto] = useState(cidade && estado ? `${toTitleCase(cidade)} - ${estado}` : '')
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [aberto, setAberto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selecionado, setSelecionado] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sincroniza quando valor externo muda (ex: editar página carrega dados)
  useEffect(() => {
    if (cidade && estado && !selecionado) {
      setTexto(`${toTitleCase(cidade)} - ${estado}`)
    }
  }, [cidade, estado])

  const buscar = useCallback(async (q: string) => {
    if (q.length < 2) { setSugestoes([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/brasil?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSugestoes(data.sugestoes || [])
      setAberto((data.sugestoes?.length ?? 0) > 0)
    } catch {
      setSugestoes([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTexto(val)
    setSelecionado(false)
    setAberto(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => buscar(val), 280)
  }

  const handleSelect = (s: Sugestao) => {
    const display = `${toTitleCase(s.nome)} - ${s.sigla}`
    setTexto(display)
    setSugestoes([])
    setAberto(false)
    setSelecionado(true)
    onSelect(toTitleCase(s.nome), s.sigla)
  }

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        type="text"
        value={texto}
        onChange={handleChange}
        onFocus={() => sugestoes.length > 0 && setAberto(true)}
        className={`w-full shadow-sm pr-8 ${className ?? ''}`}
        placeholder="Ex: Curitiba - PR"
        required={required}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
      )}

      {aberto && sugestoes.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {sugestoes.map((s) => (
            <li
              key={`${s.nome}-${s.sigla}`}
              onMouseDown={() => handleSelect(s)}
              className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-pink-50 text-sm"
            >
              <MapPin className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
              <span>
                <span className="font-medium">{toTitleCase(s.nome)}</span>
                <span className="text-gray-500"> - {s.sigla}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
