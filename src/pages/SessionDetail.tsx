import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Save, 
  Loader2, 
  Target, 
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// ARREGLADO: Importación de Label añadida
import { Label } from '@/components/ui/label'; 
import { supabase } from "@/lib/supabaseClient";
import { AIField } from '@/components/AIField';
import { toast } from 'sonner';

export default function SessionDetail() {
  const { id } = useParams(); // ID de la SESIÓN
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [session, setSession] = useState<any>(null);
  const [history, setHistory] = useState({
    historia_detalle: '',
    tareas_pendientes: '',
    objetivos_alcanzados: ''
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Enlace: sesiones -> pacientes (vía llave foránea)
      const { data: sessionData } = await supabase
        .from("sesiones")
        .select("*, pacientes(nombre, apellido, diagnosticoprincipal)")
        .eq("id", id)
        .single();
      
      if (sessionData) {
        setSession(sessionData);

        // Enlace: session_history -> sesiones
        const { data: historyData } = await supabase
          .from("session_history")
          .select("*")
          .eq("session_id", id)
          .single();

        if (historyData) {
          setHistory({
            historia_detalle: historyData.historia_detalle || '',
            tareas_pendientes: historyData.tareas_pendientes || '',
            objetivos_alcanzados: historyData.objetivos_alcanzados || ''
          });
        }
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("session_history")
      .upsert({
        session_id: id,
        paciente_id: session.paciente_id,
        ...history,
        created_at: new Date().toISOString()
      });

    if (!error) {
      toast.success("Registro actualizado correctamente");
    } else {
      toast.error("Error al actualizar");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-20 text-center animate-pulse italic">Cargando evolución de sesión...</div>;

  return (
    <div className="p-6 max-w-[850px] mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2 text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver al expediente
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Detalle de Evolución
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-none">
              Sesión {session?.estado}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Paciente: <span className="font-semibold text-foreground">{session?.pacientes?.nombre} {session?.pacientes?.apellido}</span>
          </p>
        </div>
        
        <Button onClick={handleUpdate} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-muted/20 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Fecha</p>
              <p className="text-sm font-medium">{session?.fecha ? new Date(session.fecha + 'T00:00:00').toLocaleDateString() : '---'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Horario</p>
              <p className="text-sm font-medium">{session?.hora} ({session?.duracion} min)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Modalidad</p>
              <p className="text-sm font-medium capitalize">{session?.modalidad}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Notas de Evolución Clínica
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <AIField
            label="Detalle de lo trabajado"
            value={history.historia_detalle}
            onChange={(v) => setHistory({...history, historia_detalle: v})}
            rows={12}
            context={{ diagnostico: session?.pacientes?.diagnosticoprincipal }}
            placeholder="No hay notas registradas para esta sesión..."
          />
          
          <Separator className="bg-border/40" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Target className="w-3.5 h-3.5 text-primary" /> Objetivos Alcanzados
              </Label>
              <AIField
                label=""
                value={history.objetivos_alcanzados}
                onChange={(v) => setHistory({...history, objetivos_alcanzados: v})}
                rows={3}
                placeholder="Metas cumplidas hoy..."
              />
            </div>
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Tareas Pendientes
              </Label>
              <AIField
                label=""
                value={history.tareas_pendientes}
                onChange={(v) => setHistory({...history, tareas_pendientes: v})}
                rows={3}
                placeholder="Asignaciones para el paciente..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}