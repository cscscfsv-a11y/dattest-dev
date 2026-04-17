import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Image, Brain, Filter, ChevronRight, FileSearch, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from "@/lib/supabaseClient";

export default function ClinicalHistoryList() {
  const { id } = useParams(); // ID del paciente
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecords() {
      if (!id) return;
      setLoading(true);
      try {
        // Consultamos la tabla clinical_record_history para ver todas las versiones guardadas
        const { data, error } = await supabase
          .from("clinical_record_history")
          .select("*")
          .eq("patient_id", id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRecords(data || []);
      } catch (err) {
        console.error("Error cargando historial cronológico:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, [id]);

  const filteredRecords = records.filter(r => 
    r.diagnostico?.toLowerCase().includes(search.toLowerCase()) ||
    r.anamnesis?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="p-20 text-center">
      <Loader2 className="animate-spin mx-auto text-primary mb-4" />
      <p className="text-muted-foreground italic">Recuperando versiones históricas...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cronología de Historia Clínica</h1>
          <p className="text-sm text-muted-foreground">Seleccione una versión para buscar imágenes y realizar análisis IA</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
          onClick={() => navigate(`/patient/${id}/history-search/all`)}
        >
          <Brain className="w-4 h-4" /> Búsqueda Global IA
        </Button>
      </div>

      {/* Buscador */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar en el historial de diagnósticos y anamnesis..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon"><Filter className="w-4 h-4" /></Button>
      </div>

      {/* Lista de Versiones */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center text-muted-foreground">
              <FileSearch className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No se encontraron registros en el historial.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card 
              key={record.id} 
              className="hover:shadow-md transition-all cursor-pointer group border-border/60 active:scale-[0.99]"
              // NAVEGACIÓN: Al presionar, vamos a la búsqueda de imágenes con el contexto de este ID de registro
              onClick={() => navigate(`/patient/${id}/history-search/${record.id}`)}
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Clock className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-0.5">HIST</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">{record.diagnostico || 'Diagnóstico Sin Título'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      Versión del: {new Date(record.created_at).toLocaleDateString('es-MX', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {record.anamnesis && (
                      <p className="text-sm mt-2 line-clamp-2 italic text-muted-foreground border-l-2 border-primary/20 pl-3">
                        {record.anamnesis}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden group-hover:flex items-center text-[10px] font-bold text-primary mr-2 uppercase tracking-tighter">
                    <Image className="w-3 h-3 mr-1" /> Analizar Imágenes
                  </div>
                  <ChevronRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* IA Image Analysis Section */}
      <Card className="border-dashed border-primary/40 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Image className="w-4 h-4 text-primary" /> Gestión de Estudios Analizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cada vez que selecciona un registro histórico, el sistema permite buscar imágenes (Rayos X, MRI) en la nube 
            y cruzarlas con la tabla de <b>history_analysis</b> para obtener correlaciones clínicas asistidas por IA.
          </p>
          <Button 
            variant="link" 
            className="text-primary p-0 h-auto mt-2 text-xs font-bold"
            onClick={() => navigate(`/analysis/overview/${id}`)}
          >
            Ver base de datos de imágenes analizadas →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}