import { useState, useEffect } from 'react'; // Agregado useEffect
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Building2,
  ChevronRight,
  Brain,
  Loader2,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// IMPORTA TU CLIENTE
import { supabase } from '@/lib/SupabaseClient';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ESTADO DEL FORMULARIO
  const [profile, setProfile] = useState({
    nombre: '',
    apellidos: '',
    especialidad: '',
    cedula: '',
    email: '',
    ai_diagnostico: true,
    ai_autocompletado: true
  });

  // 1. CARGAR DATOS
  useEffect(() => {
    async function loadSettings() {
      // Aquí podrías filtrar por el ID del usuario actual
      const { data, error } = await supabase
        .from('configuracion_perfil')
        .select('*')
        .single();

      if (data) {
        setProfile({
          nombre: data.nombre || '',
          apellidos: data.apellidos || '',
          especialidad: data.especialidad || '',
          cedula: data.cedula || '',
          email: data.email || '',
          ai_diagnostico: data.ai_diagnostico,
          ai_autocompletado: data.ai_autocompletado
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  // 2. GUARDAR DATOS
  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('configuracion_perfil')
      .upsert({ 
        id: '05581c6e-6b03-4d0f-a3bb-c95b7341c42b', // Usa el ID real del usuario
        ...profile,
        updated_at: new Date().toISOString()
      });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="p-6 max-w-[800px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Profile card dinámico */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
                {profile.nombre[0]}{profile.apellidos[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">{profile.nombre} {profile.apellidos}</h3>
              <p className="text-muted-foreground text-sm">{profile.especialidad} · Cédula: {profile.cedula}</p>
              <p className="text-muted-foreground text-sm">{profile.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Perfil profesional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input 
                value={profile.nombre} 
                onChange={(e) => setProfile({...profile, nombre: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Apellidos</Label>
              <Input 
                value={profile.apellidos} 
                onChange={(e) => setProfile({...profile, apellidos: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Especialidad</Label>
              <Input 
                value={profile.especialidad} 
                onChange={(e) => setProfile({...profile, especialidad: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cédula profesional</Label>
              <Input 
                value={profile.cedula} 
                onChange={(e) => setProfile({...profile, cedula: e.target.value})}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Correo electrónico</Label>
              <Input 
                type="email" 
                value={profile.email} 
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
          </div>
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
            {saving ? 'Guardando...' : saved ? '¡Cambios guardados!' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>

      {/* AI Settings con lógica de Switch */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Asistente IA
            <Badge className="text-[10px] h-4 px-1.5 bg-primary/15 text-primary border-0 ml-1">ACTIVO</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm">
            <p className="text-foreground font-medium">Inteligencia Artificial habilitada</p>
            <p className="text-muted-foreground mt-0.5">Basado en el diagnóstico del paciente.</p>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Sugerencias automáticas</p>
              <p className="text-xs text-muted-foreground">Sugiere códigos CIE-10 basados en síntomas</p>
            </div>
            <Switch 
              checked={profile.ai_diagnostico} 
              onCheckedChange={(val) => setProfile({...profile, ai_diagnostico: val})}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Autocompletado de historias</p>
              <p className="text-xs text-muted-foreground">Genera borradores de anamnesis</p>
            </div>
            <Switch 
              checked={profile.ai_autocompletado} 
              onCheckedChange={(val) => setProfile({...profile, ai_autocompletado: val})}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}