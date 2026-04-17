import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, XCircle, Calendar, Clock, Loader2, Lock, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AIField } from '@/components/AIField';
import { toast } from 'sonner';

export default function SessionHistory() {
  const { id } = useParams(); // ID de la sesión
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [form, setForm] = useState({
    historia_detalle: '',
    tareas_pendientes: '',
    objetivos_alcanzados: ''
  });

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('sesiones')
        .select('*, pacientes(nombre, apellido, diagnosticoprincipal)')
        .eq('id', id)
        .single();

      if (data) {
        setSession(data);
        // BLOQUEO: Si la fecha de la sesión es mayor a hoy (futuro)
        const today = new Date().toISOString().split('T')[0];
        if (data.fecha > today) setIsLocked(true);

        // Cargar historia si ya existe
        const { data: hist } = await supabase.from('session_history').select('*').eq('session_id', id).single();
        if (hist) setForm(hist);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Guardar en session_history
      await supabase.from('session_history').upsert({
        session_id: id,
        paciente_id: session.paciente_id,
        ...form
      });

      // 2. Marcar sesión como completada
      await supabase.from('sesiones').update({ estado: 'completada' }).eq('id', id);

      toast.success("Historia guardada correctamente");
      navigate(-1);
    } catch (e) {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (confirm("¿Marcar sesión como cancelada?")) {
      await supabase.from('sesiones').update({ estado: 'cancelada' }).eq('id', id);
      navigate(-1);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 max-w-[800px] space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>
        <div className="flex gap-2">
          <Button variant="outline" className="text-destructive" onClick={handleCancel}>Cancelar Sesión</Button>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Agregar Historia de Sesión</h1>
        <p className="text-muted-foreground">{session.pacientes.nombre} {session.pacientes.apellido} · {session.fecha}</p>
      </div>

      {isLocked && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800">
          <Lock className="h-5 w-5" />
          <p className="text-sm font-medium">Esta sesión aún no ha ocurrido. El registro de historia está bloqueado.</p>
        </div>
      )}

      <div className={isLocked ? "opacity-50 pointer-events-none" : ""}>
        <Card className="border-border/60">
          <CardContent className="p-6 space-y-5">
            <AIField
              label="Detalle de la sesión"
              value={form.historia_detalle}
              onChange={(v) => setForm({...form, historia_detalle: v})}
              rows={8}
              placeholder="Escribe aquí lo acontecido en la sesión..."
              context={{ diagnostico: session.pacientes.diagnosticoprincipal }}
            />
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Objetivos alcanzados</Label>
                <Input value={form.objetivos_alcanzados} onChange={(e) => setForm({...form, objetivos_alcanzados: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Tareas pendientes</Label>
                <Input value={form.tareas_pendientes} onChange={(e) => setForm({...form, tareas_pendientes: e.target.value})} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate(`/sessions/reschedule/${id}`)}>Reprogramar</Button>
          <Button onClick={handleSave} disabled={saving || isLocked} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Guardar Historia y Finalizar
          </Button>
        </div>
      </div>
    </div>
  );
}