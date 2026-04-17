import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Brain, Eye, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function MentalStatusExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  
  const [form, setForm] = useState({
    apariencia: '',
    conciencia: '',
    orientacion: '',
    afecto_animo: '',
    pensamiento: '',
    observaciones_alta: ''
  });

  useEffect(() => {
    async function loadData() {
      const { data: p } = await supabase.from('pacientes').select('*').eq('id', id).single();
      setPatient(p);
      const { data: exam } = await supabase.from('mental_status_exams').select('*').eq('patient_id', id).single();
      if (exam) setForm(exam);
    }
    loadData();
  }, [id]);

  const handleSave = async () => {
    setLoading(true);
    // Guardar examen y si hay observaciones de alta, actualizar tabla pacientes
    const { error } = await supabase.from('mental_status_exams').upsert({
      patient_id: id,
      ...form
    });

    if (form.observaciones_alta) {
        await supabase.from('pacientes').update({ estado: 'alta', notas: form.observaciones_alta }).eq('id', id);
    }

    if (!error) {
      toast.success("Examen mental actualizado correctamente");
      navigate(-1);
    } else {
      toast.error("Error al guardar");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Directorio
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> Examen Mental: {patient?.nombre}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4" /> Observación</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Apariencia y Actitud</Label>
              <Textarea value={form.apariencia} onChange={e => setForm({...form, apariencia: e.target.value})} placeholder="Higiene, contacto visual, actitud..." />
            </div>
            <div className="space-y-2">
              <Label>Conciencia</Label>
              <Textarea value={form.conciencia} onChange={e => setForm({...form, conciencia: e.target.value})} placeholder="Alerta, somnoliento..." />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm flex items-center gap-2"><UserCheck className="w-4 h-4" /> Evaluación</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Orientación</Label>
              <Textarea value={form.orientacion} onChange={e => setForm({...form, orientacion: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Pensamiento y Afecto</Label>
              <Textarea value={form.afecto_animo} onChange={e => setForm({...form, afecto_animo: e.target.value})} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <Label className="text-primary font-bold">Observaciones para Alta Médica</Label>
          <Textarea 
            value={form.observaciones_alta} 
            onChange={e => setForm({...form, observaciones_alta: e.target.value})} 
            className="mt-2 bg-white" 
            placeholder="Si escribes aquí, el paciente pasará a estado 'Alta Médica' automáticamente al guardar..."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? 'Procesando...' : <><Save className="w-4 h-4" /> Guardar Todo</>}
        </Button>
      </div>
    </div>
  );
}