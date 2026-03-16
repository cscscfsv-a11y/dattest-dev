import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Edit,
  Plus,
  Shield,
  AlertCircle,
  ChevronRight,
  Download,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { MOCK_PATIENTS, MOCK_SESSIONS, MOCK_DOCUMENTS } from '@/data/index';
import { ROUTE_PATHS, STATUS_LABELS, STATUS_COLORS, SESSION_STATUS_COLORS, SESSION_STATUS_LABELS } from '@/lib/index';
import { cn } from '@/lib/utils';
import { springPresets } from '@/lib/motion';

function getAge(fechaNacimiento: string): number {
  const today = new Date(2026, 2, 15);
  const birth = new Date(fechaNacimiento);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const patient = MOCK_PATIENTS.find((p) => p.id === id);
  if (!patient) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Paciente no encontrado</p>
        <Button className="mt-4" onClick={() => navigate(ROUTE_PATHS.PATIENTS)}>
          Volver a Pacientes
        </Button>
      </div>
    );
  }

  const sessions = MOCK_SESSIONS.filter((s) => s.pacienteId === id);
  const documents = MOCK_DOCUMENTS.filter((d) => d.pacienteId === id);

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground mb-5 -ml-2"
        onClick={() => navigate(ROUTE_PATHS.PATIENTS)}
      >
        <ArrowLeft className="w-4 h-4" />
        Regresar a Pacientes
      </Button>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="bg-card border border-border/60 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar className="w-20 h-20 shrink-0">
            <AvatarFallback className="bg-primary/15 text-primary text-2xl font-bold">
              {patient.nombre[0]}{patient.apellido[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {patient.nombre} {patient.apellido}
                </h1>
                <p className="text-muted-foreground mt-0.5">
                  {getAge(patient.fechaNacimiento)} años · {patient.genero.charAt(0).toUpperCase() + patient.genero.slice(1)}
                  {patient.seguroMedico && ` · ${patient.seguroMedico}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn('border-0 font-medium', STATUS_COLORS[patient.estado])}>
                  {STATUS_LABELS[patient.estado]}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                    onClick={() => {
                      toast.promise(new Promise(res => setTimeout(res, 2000)), {
                        loading: 'Generando reporte clínico...',
                        success: 'Reporte generado correctamente',
                        error: 'Error al generar reporte',
                      });
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar Reporte
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>

            {patient.diagnosticoPrincipal && (
              <div className="mt-3 p-3 bg-primary/5 border border-primary/15 rounded-xl">
                <p className="text-xs font-medium text-primary mb-0.5">Diagnóstico principal</p>
                <p className="text-sm text-foreground">{patient.diagnosticoPrincipal}</p>
              </div>
            )}

            {/* Quick info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />{patient.telefono}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />{patient.email}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />{patient.direccion}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-border/40">
          {[
            { label: 'Total sesiones', value: patient.totalSesiones, icon: Clock },
            {
              label: 'Última sesión',
              value: patient.ultimaSesion
                ? new Date(patient.ultimaSesion + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                : '—',
              icon: Calendar,
            },
            {
              label: 'Próxima sesión',
              value: patient.proximaSesion
                ? new Date(patient.proximaSesion + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                : 'Sin agendar',
              icon: Calendar,
            },
            {
              label: 'Fecha registro',
              value: new Date(patient.fechaRegistro + 'T00:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'short' }),
              icon: FileText,
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 bg-muted/40 rounded-xl">
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="sesiones" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="sesiones" className="text-xs">Sesiones ({sessions.length})</TabsTrigger>
          <TabsTrigger value="documentos" className="text-xs">Documentos ({documents.length})</TabsTrigger>
          <TabsTrigger value="info" className="text-xs">Información</TabsTrigger>
        </TabsList>

        {/* Sessions */}
        <TabsContent value="sesiones" className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Historial de sesiones</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={() => navigate(ROUTE_PATHS.CLINICAL_HISTORY.replace(':id', patient.id))}
              >
                <FileText className="w-3.5 h-3.5" />
                Historia clínica
              </Button>
              <Button size="sm" className="gap-2 text-xs">
                <Plus className="w-3.5 h-3.5" />
                Nueva sesión
              </Button>
            </div>
          </div>

          {sessions.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                No hay sesiones registradas
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="border-border/60 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-center min-w-[52px] pt-0.5">
                          <p className="font-bold text-foreground">
                            {new Date(session.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-xs text-muted-foreground">{session.hora}</p>
                        </div>
                        <Separator orientation="vertical" className="h-10 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn('text-[10px] border-0 h-5', SESSION_STATUS_COLORS[session.estado])}>
                              {SESSION_STATUS_LABELS[session.estado]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {session.duracion} min · {session.modalidad}
                            </span>
                          </div>
                          {session.notas && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{session.notas}</p>
                          )}
                          {session.tareas && (
                            <p className="text-xs text-primary mt-1.5">
                              <span className="font-medium">Tareas: </span>{session.tareas}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documentos" className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Documentos del expediente</h3>
            <Button size="sm" className="gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Agregar documento
            </Button>
          </div>

          {documents.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                No hay documentos
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <Card key={doc.id} className="border-border/60 hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{doc.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{doc.tipo}</Badge>
                        {doc.generadoPorIA && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-primary/15 text-primary border-0">IA</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {new Date(doc.fecha + 'T00:00:00').toLocaleDateString('es-MX')} · {doc.tamaño}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Info */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Información personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ['Nombre completo', `${patient.nombre} ${patient.apellido}`],
                  ['Fecha de nacimiento', new Date(patient.fechaNacimiento + 'T00:00:00').toLocaleDateString('es-MX')],
                  ['Edad', `${getAge(patient.fechaNacimiento)} años`],
                  ['Género', patient.genero.charAt(0).toUpperCase() + patient.genero.slice(1)],
                  ['Teléfono', patient.telefono],
                  ['Email', patient.email],
                  ['Dirección', patient.direccion],
                  ['Seguro médico', patient.seguroMedico || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    <span className="text-foreground text-right">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  Motivo de consulta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1.5">Motivo</p>
                  <p className="text-foreground leading-relaxed">{patient.motivoConsulta}</p>
                </div>
                {patient.contactoEmergencia && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1.5">Contacto de emergencia</p>
                    <p className="text-foreground">{patient.contactoEmergencia}</p>
                  </div>
                )}
                {patient.notas && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1.5">Notas del terapeuta</p>
                    <p className="text-foreground leading-relaxed">{patient.notas}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
