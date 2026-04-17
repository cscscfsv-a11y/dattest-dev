import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Image as ImageIcon, 
  ChevronRight, FileText, Loader2, Sparkles, 
  PlayCircle, Video 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/lib/supabaseClient";

export default function HistoryImageSearch() {
  const { id, recordId } = useParams(); 
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);

  useEffect(() => {
    async function getRecord() {
      const { data } = await supabase
        .from("clinical_record_history")
        .select("*")
        .eq("id", recordId)
        .single();
      
      if (data) {
        setRecord(data);
        // SIMULACIÓN DE ANÁLISIS DE TEXTO POR IA PARA BUSCAR IMÁGENES
        // Extraemos palabras clave del texto guardado
        const text = (data.anamnesis + " " + data.diagnostico).toLowerCase();
        const keywords = [];
        if (text.includes("cerebro") || text.includes("ansiedad") || text.includes("sueño")) keywords.push("Neurología", "MRI");
        if (text.includes("corazón") || text.includes("pecho") || text.includes("ritmo")) keywords.push("Cardiología", "EKG");
        if (text.includes("fractura") || text.includes("dolor") || text.includes("espalda")) keywords.push("Radiología", "X-Ray");
        setDetectedKeywords(keywords.length > 0 ? keywords : ["General"]);
      }
      setLoading(false);
    }
    getRecord();
  }, [recordId]);

  // BANCO DE MEDIA (Imágenes y Videos) referenciales según el paciente
  const mediaLibrary = [
    { id: '1', type: 'MRI Cerebral Profunda', category: 'Neurología', format: 'image', date: '2024-03-10', img: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?q=80&w=500' },
    { id: '2', type: 'Mapeo de Actividad Neuronal', category: 'Neurología', format: 'video', date: '2024-03-11', img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=500' },
    { id: '3', type: 'Ecografía de Tejidos', category: 'General', format: 'image', date: '2024-02-15', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=500' },
    { id: '4', type: 'Rayos X de Tórax Post-Crisis', category: 'Cardiología', format: 'image', date: '2024-01-20', img: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=500' },
  ];

  // Filtrar por búsqueda manual + sugerencias de IA basadas en el texto
  const filteredMedia = mediaLibrary.filter(m => {
    const matchSearch = m.type.toLowerCase().includes(search.toLowerCase());
    const matchAI = detectedKeywords.some(k => m.category.includes(k) || m.type.includes(k));
    return search ? matchSearch : matchAI;
  });

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2 text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Regresar al Historial
      </Button>

      {/* ANÁLISIS DE TEXTO IA */}
      <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
           <Sparkles className="w-5 h-5 text-primary/40 animate-pulse" />
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Contexto Clínico Detectado</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">{record?.diagnostico}</h2>
            <p className="text-sm text-muted-foreground mt-2 italic border-l-2 border-primary/20 pl-4">
              "{record?.anamnesis}"
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[10px] font-medium text-muted-foreground mr-2">ETIQUETAS IA:</span>
            {detectedKeywords.map(k => (
              <Badge key={k} variant="secondary" className="bg-primary/10 text-primary text-[9px] px-2 py-0">
                {k}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar otros estudios manuales..." 
            className="pl-9 bg-background border-border/60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
           <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Estudios Relacionados Sugeridos</p>
           <p className="text-[10px] text-primary italic">Resultados basados en la historia clínica vinculada</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMedia.map((study) => (
            <Card 
              key={study.id} 
              className="overflow-hidden hover:ring-2 ring-primary cursor-pointer transition-all group border-border/40 bg-card"
              onClick={() => navigate(`/analysis/${recordId}/${study.id}`)}
            >
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img 
                   src={study.img} 
                   alt={study.type} 
                   className="object-cover w-full h-full opacity-60 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" 
                />
                
                {/* Overlay para videos */}
                {study.format === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                     <PlayCircle className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                )}

                <div className="absolute top-2 left-2 flex gap-1">
                   {study.format === 'video' ? (
                      <Badge className="bg-red-500/80 text-[9px] py-0 border-none"><Video className="w-3 h-3 mr-1" /> VIDEO</Badge>
                   ) : (
                      <Badge className="bg-blue-500/80 text-[9px] py-0 border-none"><ImageIcon className="w-3 h-3 mr-1" /> IMAGEN</Badge>
                   )}
                </div>
                
                <Badge className="absolute top-2 right-2 bg-black/60 text-[9px] border-none">{study.category}</Badge>
              </div>
              
              <CardContent className="p-3">
                <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{study.type}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-muted-foreground">{new Date(study.date).toLocaleDateString()}</p>
                  <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}