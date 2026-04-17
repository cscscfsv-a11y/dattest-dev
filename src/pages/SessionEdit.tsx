import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from "@/lib/supabaseClient";
import { toast } from 'sonner';

export default function SessionEdit() {
  const { id } = useParams(); // ID de la sesión
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fecha: '',
    hora: '',
    duracion: '',
    modalidad: '',
    tipo: '',
  });
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    async function loadSession() {
      const { data, error } = await supabase
        .from("sesiones")
        .select("*, pacientes(nombre, apellido)")
        .eq("id", id)
        .single();

      if (data) {
        setForm({
          fecha: data.fecha,
          hora: data.hora,
          duracion: data.duracion.toString(),
          modalidad: data.modalidad,
          tipo: data.tipo,
        });
        setPatientName(`${data.pacientes.nombre} ${data.pacientes.apellido}`);
      }
      setLoading(false);
    }
    loadSession();
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("sesiones")
      .update({
        fecha: form.fecha,
        hora: form.hora,
        duracion: parseInt(form.duracion),
        modalidad: form.modalidad,
        tipo: form.tipo,
      })
      .eq("id", id);

    if (!error) {
      toast.success("Sesión reprogramada correctamente");
      navigate(-1);
    } else {
      toast.error("Error al actualizar la sesión");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-20 text-center italic">Cargando datos de la sesión...</div>;

  return (
    <div className="p-6 max-w-[600px] mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-2 text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Reprogramar Sesión</h1>
        <p className="text-muted-foreground">Paciente: {patientName}</p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={form.fecha} onChange={(e) => setForm({...form, fecha: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input type="time" value={form.hora} onChange={(e) => setForm({...form, hora: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duración</Label>
            <Select value={form.duracion} onValueChange={(v) => setForm({...form, duracion: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
                <SelectItem value="90">90 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Modalidad</Label>
            <Select value={form.modalidad} onValueChange={(v) => setForm({...form, modalidad: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button onClick={handleUpdate} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}