'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MapPin, Search, Star } from 'lucide-react'

interface Estado {
  id: number
  sigla: string
  nome: string
  regiao: string
}

interface Cidade {
  id: number
  nome: string
  capital: boolean
  sigla: string
  estado: string
}

const CORES_REGIAO: Record<string, string> = {
  'Norte':        'bg-emerald-100 text-emerald-800',
  'Nordeste':     'bg-orange-100 text-orange-800',
  'Centro-Oeste': 'bg-yellow-100 text-yellow-800',
  'Sudeste':      'bg-blue-100 text-blue-800',
  'Sul':          'bg-purple-100 text-purple-800',
}

export default function CidadesPage() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [estadoSel, setEstadoSel] = useState<Estado | null>(null)
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [busca, setBusca] = useState('')
  const [buscaEstado, setBuscaEstado] = useState('')
  const [loading, setLoading] = useState(false)
  const [totalCidades, setTotalCidades] = useState(0)

  useEffect(() => {
    fetch('/api/brasil')
      .then(r => r.json())
      .then(d => {
        setEstados(d.estados || [])
      })
  }, [])

  useEffect(() => {
    if (!estadoSel) return
    setLoading(true)
    setBusca('')
    fetch(`/api/brasil?sigla=${estadoSel.sigla}`)
      .then(r => r.json())
      .then(d => {
        setCidades(d.cidades || [])
        setTotalCidades(d.cidades?.length || 0)
      })
      .finally(() => setLoading(false))
  }, [estadoSel])

  const estadosFiltrados = estados.filter(e =>
    e.nome.toLowerCase().includes(buscaEstado.toLowerCase()) ||
    e.sigla.toLowerCase().includes(buscaEstado.toLowerCase())
  )

  const cidadesFiltradas = cidades.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Estados & Cidades</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Base IBGE completa — {estados.length} estados · selecione um estado para ver os municípios
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coluna de estados */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Estados</span>
              <span className="text-xs font-normal text-muted-foreground">{estados.length} UFs</span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estado..."
                className="pl-8 h-9"
                value={buscaEstado}
                onChange={e => setBuscaEstado(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[480px] overflow-y-auto">
              {['Norte','Nordeste','Centro-Oeste','Sudeste','Sul'].map(regiao => {
                const lista = estadosFiltrados.filter(e => e.regiao === regiao)
                if (lista.length === 0) return null
                return (
                  <div key={regiao}>
                    <div className={`px-4 py-1.5 text-xs font-semibold sticky top-0 z-10 ${CORES_REGIAO[regiao] || 'bg-gray-100'}`}>
                      {regiao}
                    </div>
                    {lista.map(e => (
                      <button
                        key={e.id}
                        onClick={() => setEstadoSel(e)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent transition-colors border-b border-border/40
                          ${estadoSel?.sigla === e.sigla ? 'bg-primary/10 font-semibold' : ''}`}
                      >
                        <span className="text-lg font-mono font-bold text-primary w-8">{e.sigla}</span>
                        <span className="flex-1 text-sm">{e.nome}</span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Coluna de cidades */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>
                {estadoSel
                  ? `Municípios — ${estadoSel.sigla}`
                  : 'Municípios'}
              </span>
              {estadoSel && (
                <span className="text-xs font-normal text-muted-foreground">
                  {cidadesFiltradas.length}/{totalCidades}
                </span>
              )}
            </CardTitle>
            {estadoSel && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar em ${estadoSel.nome}...`}
                  className="pl-8 h-9"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {!estadoSel && (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                <MapPin className="h-10 w-10 opacity-30" />
                <p className="text-sm">Selecione um estado</p>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                Carregando municípios...
              </div>
            )}
            {!loading && estadoSel && (
              <div className="max-h-[480px] overflow-y-auto">
                {/* Capitais primeiro */}
                {cidadesFiltradas.filter(c => c.capital).map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40 bg-primary/5"
                  >
                    <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">Capital · IBGE {c.id}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Capital</Badge>
                  </div>
                ))}
                {/* Demais cidades */}
                {cidadesFiltradas.filter(c => !c.capital).map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">IBGE {c.id}</p>
                    </div>
                  </div>
                ))}
                {cidadesFiltradas.length === 0 && busca && (
                  <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                    Nenhuma cidade encontrada para "{busca}"
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo por região */}
      {estados.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribuição por Região</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['Norte','Nordeste','Centro-Oeste','Sudeste','Sul'].map(regiao => {
                const count = estados.filter(e => e.regiao === regiao).length
                return (
                  <div key={regiao} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${CORES_REGIAO[regiao]}`}>
                    <span>{regiao}</span>
                    <span className="opacity-70">({count} UFs)</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
