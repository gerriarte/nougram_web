"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, 
  Search, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api-client"

interface ApolloSearchResult {
  id?: string
  name?: string
  first_name?: string
  last_name?: string
  email?: string
  title?: string
  organization_name?: string
  [key: string]: any
}

interface ApolloSearchResponse {
  results: ApolloSearchResult[]
  total: number
  query: string
  error?: string
}

export default function IntegrationsPage() {
  const { toast } = useToast()
  const [apolloQuery, setApolloQuery] = useState("")
  const [apolloSearchType, setApolloSearchType] = useState<"people" | "companies">("people")
  const [apolloResults, setApolloResults] = useState<ApolloSearchResult[]>([])
  const [isApolloSearching, setIsApolloSearching] = useState(false)
  const [apolloError, setApolloError] = useState<string | null>(null)

  const [sheetsUrl, setSheetsUrl] = useState("")
  const [sheetsRange, setSheetsRange] = useState("A1:Z100")
  const [isSyncing, setIsSyncing] = useState(false)

  const handleApolloSearch = async () => {
    if (!apolloQuery.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una consulta de búsqueda",
        variant: "destructive",
      })
      return
    }

    setIsApolloSearching(true)
    setApolloError(null)

    try {
      const params = new URLSearchParams({
        query: apolloQuery,
        search_type: apolloSearchType,
        limit: "10",
      })

      const response = await apiRequest<ApolloSearchResponse>(
        `/integrations/apollo/search?${params.toString()}`
      )

      if (response.error) {
        setApolloError(response.error)
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else if (response.data) {
        setApolloResults(response.data.results || [])
        if (response.data.error) {
          setApolloError(response.data.error)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al buscar en Apollo.io"
      setApolloError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsApolloSearching(false)
    }
  }

  const handleSheetsSync = async () => {
    // Extract sheet ID from URL
    const sheetIdMatch = sheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (!sheetIdMatch) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL válida de Google Sheets",
        variant: "destructive",
      })
      return
    }

    const sheetId = sheetIdMatch[1]
    setIsSyncing(true)

    try {
      const response = await apiRequest(
        `/integrations/sheets/sync`,
        {
          method: "POST",
          body: JSON.stringify({
            sheet_id: sheetId,
            range: sheetsRange,
          }),
        }
      )

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else if ((response.data as any)?.success) {
        toast({
          title: "Éxito",
          description: `Se sincronizaron ${(response.data as any).records_synced || 0} registros desde Google Sheets`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al sincronizar Google Sheets",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-grey-900">Integraciones</h1>
        <p className="text-grey-600 mt-1">
          Conecta con servicios externos para mejorar tu flujo de trabajo
        </p>
      </div>

      <Tabs defaultValue="apollo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="apollo">Apollo.io</TabsTrigger>
          <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
        </TabsList>

        {/* Apollo.io Integration */}
        <TabsContent value="apollo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Búsqueda Apollo.io
              </CardTitle>
              <CardDescription>
                Busca contactos y empresas en Apollo.io para autocompletar información de clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-type">Tipo de Búsqueda</Label>
                <select
                  id="search-type"
                  value={apolloSearchType}
                  onChange={(e) => setApolloSearchType(e.target.value as "people" | "companies")}
                  className="w-full h-10 px-3 rounded-md border border-grey-300 bg-white"
                >
                  <option value="people">Personas</option>
                  <option value="companies">Empresas</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apollo-query">Consulta de Búsqueda</Label>
                <div className="flex gap-2">
                  <Input
                    id="apollo-query"
                    placeholder={apolloSearchType === "people" ? "Nombre o correo..." : "Nombre de empresa..."}
                    value={apolloQuery}
                    onChange={(e) => setApolloQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleApolloSearch()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleApolloSearch}
                    disabled={isApolloSearching || !apolloQuery.trim()}
                    className="bg-primary-500 hover:bg-primary-700 text-white"
                  >
                    {isApolloSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {apolloError && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-error-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-error-900">Error</p>
                    <p className="text-sm text-error-700">{apolloError}</p>
                  </div>
                </div>
              )}

              {apolloResults.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Resultados ({apolloResults.length})</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setApolloResults([])}
                    >
                      Limpiar
                    </Button>
                  </div>
                  <div className="border border-grey-200 rounded-lg divide-y divide-grey-200 max-h-96 overflow-y-auto">
                    {apolloResults.map((result, idx) => (
                      <div key={idx} className="p-4 hover:bg-grey-50 transition-colors">
                        {apolloSearchType === "people" ? (
                          <div>
                            <p className="font-medium text-grey-900">
                              {result.first_name} {result.last_name}
                            </p>
                            {result.email && (
                              <p className="text-sm text-grey-600">{result.email}</p>
                            )}
                            {result.title && (
                              <p className="text-sm text-grey-500">{result.title}</p>
                            )}
                            {result.organization_name && (
                              <p className="text-sm text-grey-500">{result.organization_name}</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-grey-900">{result.name}</p>
                            {result.website_url && (
                              <a
                                href={result.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                              >
                                {result.website_url}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!apolloError && apolloResults.length === 0 && !isApolloSearching && (
                <div className="text-center py-8 text-grey-500">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Ingresa una consulta de búsqueda para encontrar contactos o empresas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Sheets Integration */}
        <TabsContent value="sheets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Sincronización Google Sheets
              </CardTitle>
              <CardDescription>
                Sincroniza datos desde Google Sheets para importar costos, miembros del equipo y otros datos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-info-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-info-900">Configuración Requerida</p>
                    <p className="text-sm text-info-700 mt-1">
                      La integración con Google Sheets requiere que se configure una Cuenta de Servicio en el backend.
                      Contacta a tu administrador para las instrucciones de configuración.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sheets-url">URL de Google Sheets</Label>
                <Input
                  id="sheets-url"
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                />
                <p className="text-xs text-grey-500">
                  Ingresa la URL completa de la hoja de Google Sheets que deseas sincronizar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sheets-range">Rango de Hoja</Label>
                <Input
                  id="sheets-range"
                  placeholder="A1:Z100"
                  value={sheetsRange}
                  onChange={(e) => setSheetsRange(e.target.value)}
                />
                <p className="text-xs text-grey-500">
                  Especifica el rango a sincronizar (ej: A1:Z100, Sheet1!A1:Z100)
                </p>
              </div>

              <Button
                onClick={handleSheetsSync}
                disabled={isSyncing || !sheetsUrl.trim()}
                className="w-full bg-primary-500 hover:bg-primary-700 text-white"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sincronizar desde Google Sheets
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}








