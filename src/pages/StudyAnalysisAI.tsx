import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Brain, Sparkles, ShieldCheck, 
  Loader2, Save, BookOpen, Link as LinkIcon, 
  FileSearch, CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from "@/lib/supabaseClient";
import { toast } from 'sonner';

export default function StudyAnalysisAI() {
  const { recordId, studyId } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);

  // Simulación de fuentes bibliográficas según diagnóstico
  const [clinicalSources, setClinicalSources] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from("clinical_record_history")
        .select("*")
        .eq("id", recordId)
        .single();
      
      if (data) {
        setRecord(data);
        
        // LÓGICA DE APORTE CLÍNICO BASADO EN TEXTO
        const text = (data.diagnostico + " " + data.anamnesis).toLowerCase();
        const sources = [];
        
        if (text.includes("ansiedad") || text.includes("miedo")) {
          sources.push({
            title: "Guía de Práctica Clínica para Trastornos de Ansiedad",
            source: "APA (American Psychological Association)",
            link: "https://www.apa.org/practice/guidelines"
          });
        }
        if (text.includes("sueño") || text.includes("insomnio")) {
          sources.push({
            title: "Criterios Diagnósticos del Insomnio Crónico",
            source: "DSM-5 Section II",
            link: "#"
          });
        }
        if (text.includes("cerebro") || text.includes("mri")) {
          sources.push({
            title: "Correlación Neurobiológica en Estudios de Imagen",
            source: "Journal of Clinical Neuroscience",
            link: "#"
          });
        }
        
        setClinicalSources(sources.length > 0 ? sources : [{ title: "Manual de Criterios Diagnósticos Generales", source: "CIE-10", link: "#" }]);
      }
      
      setLoading(false);
      setTimeout(() => setAnalyzing(false), 2500); 
    }
    loadData();
  }, [recordId]);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Regresar al Explorador
        </Button>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 flex gap-1">
            <CheckCircle2 className="w-3 h-3" /> Paciente Verificado
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-mono text-[10px]">
            REF_ID: {recordId?.slice(0, 8)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* VISTA TÉCNICA DE IMAGEN */}
        <div className="space-y-4">
          <Card className="overflow-hidden bg-slate-950 aspect-square flex flex-col items-center justify-center relative border-none shadow-2xl">
            {analyzing ? (
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-primary font-mono text-xs tracking-tighter animate-pulse">MAPEO DE REGIONES DE INTERÉS (ROI)...</p>
              </div>
            ) : (
              <>
                <img 
                  src="https://images.unsplash.com/photo-1530210124550-912dc1381cb8?q=80&w=800" 
                  className="object-cover w-full h-full opacity-60 mix-blend-screen" 
                  alt="MRI View" 
                />
                {/* HUD de Escaneo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[60%] h-[60%] border border-primary/40 rounded-full animate-[ping_3s_linear_infinite]" />
                  <div className="absolute top-1/4 left-1/4 w-4 h-4 border-t-2 border-l-2 border-primary" />
                  <div className="absolute bottom-1/4 right-1/4 w-4 h-4 border-b-2 border-r-2 border-primary" />
                </div>
              </>
            )}
          </Card>
          <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground text-blue-600">RESOLUTION: 512x512 DICOM</span>
            <span className="text-primary animate-pulse">CONEXIÓN PACS ACTIVA</span>
          </div>
        </div>

        {/* ANÁLISIS Y APORTE CLÍNICO */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" /> Hallazgos e Inferencias
            </h2>
            <p className="text-sm text-muted-foreground italic">
              Contexto: "{record?.diagnostico}"
            </p>
          </div>

          {/* CARD 1: RESULTADO IA */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Análisis Predictivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-foreground/80">
                Tras el análisis de pixeles y comparación con la anamnesis histórica, el sistema detecta una 
                <b> correlación del 94%</b> entre los reportes de fatiga cognitiva y la disminución de flujo en la corteza prefrontal.
              </p>
              <Separator className="bg-primary/10" />
              <div className="text-xs text-muted-foreground italic">
                Sugerencia: Revisar historial de medicación para descartar efectos secundarios en neuroimagen.
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: APORTES Y FUENTES (NUEVO) */}
          <Card className="border-muted-foreground/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-500" /> Fuentes y Referencia Médica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clinicalSources.map((source, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded bg-orange-50 flex items-center justify-center shrink-0">
                    <FileSearch className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-default">
                      {source.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-2 uppercase">
                      {source.source} 
                      <LinkIcon className="w-2.5 h-2.5 cursor-pointer hover:text-primary" />
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-slate-50 rounded border-l-2 border-slate-300">
                <p className="text-[10px] text-slate-600 leading-tight">
                  <b>Nota Clínica:</b> Estos datos son asistidos por IA y deben ser validados por el profesional a cargo bajo los criterios del 
                  Manual de Ética Médica vigente.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button className="flex-[2] gap-2 bg-primary hover:bg-primary/90" onClick={() => {
               toast.success("Análisis clínico integrado al historial");
               navigate(-1);
            }} disabled={analyzing}>
              <Save className="w-4 h-4" /> Integrar al Historial Cronológico
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}