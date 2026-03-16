import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Building2,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const SETTING_SECTIONS = [
  { icon: User, label: 'Perfil profesional', desc: 'Nombre, cédula, especialidad' },
  { icon: Building2, label: 'Configuración del consultorio', desc: 'Datos de la clínica' },
  { icon: Bell, label: 'Notificaciones', desc: 'Alertas y recordatorios' },
  { icon: Shield, label: 'Privacidad y seguridad', desc: 'Contraseña, sesiones activas' },
  { icon: Palette, label: 'Apariencia', desc: 'Tema, idioma' },
];

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-[800px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Profile card */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">DR</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">Dra. Ana Rivera Morales</h3>
              <p className="text-muted-foreground text-sm">Psicóloga clínica · Cédula: 12345678</p>
              <p className="text-muted-foreground text-sm">ana.rivera@psicoclínica.mx</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              Editar perfil
            </Button>
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
              <Input defaultValue="Ana" />
            </div>
            <div className="space-y-1.5">
              <Label>Apellidos</Label>
              <Input defaultValue="Rivera Morales" />
            </div>
            <div className="space-y-1.5">
              <Label>Especialidad</Label>
              <Input defaultValue="Psicología clínica" />
            </div>
            <div className="space-y-1.5">
              <Label>Cédula profesional</Label>
              <Input defaultValue="12345678" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Correo electrónico</Label>
              <Input type="email" defaultValue="ana.rivera@psicoclínica.mx" />
            </div>
          </div>
          <Button size="sm" className="gap-2">Guardar cambios</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Recordatorios de sesión', desc: 'Notificación 1 hora antes de cada cita', default: true },
            { label: 'Sesiones sin notas', desc: 'Alerta cuando una sesión no tiene notas 24h después', default: true },
            { label: 'Nuevos pacientes', desc: 'Notificación al agregar un nuevo paciente', default: false },
            { label: 'Resumen semanal', desc: 'Resumen de actividad cada lunes', default: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Settings */}
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
            <p className="text-muted-foreground mt-0.5">El asistente IA puede generar sugerencias para historias clínicas, notas de sesión y planes de tratamiento basados en el diagnóstico del paciente.</p>
          </div>
          {[
            { label: 'Sugerencias automáticas de diagnóstico', desc: 'Sugiere códigos CIE-10 basados en síntomas', default: true },
            { label: 'Autocompletado de historias clínicas', desc: 'Genera borradores de anamnesis y planes', default: true },
            { label: 'Sugerencias en notas de sesión', desc: 'Ayuda a redactar notas clínicas estructuradas', default: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Other settings links */}
      <Card className="border-border/60">
        <CardContent className="p-2">
          {SETTING_SECTIONS.slice(1).map((section, i) => (
            <div key={section.label}>
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{section.label}</p>
                  <p className="text-xs text-muted-foreground">{section.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              {i < SETTING_SECTIONS.slice(1).length - 1 && <Separator className="my-0.5 mx-3" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
