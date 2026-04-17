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
  Sparkles,
  Video as VideoIcon,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTE_PATHS, STATUS_LABELS, STATUS_COLORS, SESSION_STATUS_COLORS, SESSION_STATUS_LABELS } from '@/lib/index';
import { cn } from '@/lib/utils';
import { springPresets } from '@/lib/motion';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function getAge(fechaNacimiento: string): number {
  if (!fechaNacimiento) return 0;
  const today = new Date();
  const birth = new Date(fechaNacimiento);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para la lista interactiva de próximas sesiones
  const [showUpcomingList, setShowUpcomingList] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: p } = await supabase.from("pacientes").select("*").eq("id", id).single();
    if (p) setPatient(p);

    const { data: s } = await supabase.from("sesiones").select("*").eq("paciente_id", id).order("fecha", { ascending: false });
    setSessions(s || []);

    const { data: d } = await supabase.from("documentos").select("*").eq("paciente_id", id).order("fecha", { ascending: false });
    setDocuments(d || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Filtrar sesiones próximas (Hoy o futuro y programadas)
  const todayStr = new Date().toLocaleDateString('en-CA'); 
  const upcomingSessions = sessions.filter(s => s.fecha >= todayStr && s.estado === 'programada');

  const handleExport = async (conIA: boolean) => {
    toast.promise(async () => {
      const fecha = new Date().toLocaleDateString('es-MX');
      const titulo = `Reporte_${conIA ? 'IA' : 'Clinico'}_${patient.nombre}`;
      const content = `PACIENTE: ${patient.nombre} ${patient.apellido}\nFECHA: ${fecha}\nMODO: ${conIA ? 'IA' : 'ESTANDAR'}`;

      await supabase.from('documentos').insert([{
        paciente_id: id,
        nombre: `${titulo}.txt`,
        tipo: 'informe',
        fecha: new Date().toISOString().split('T')[0],
        generado_por_ia: conIA,
        tamano: '15 KB'
      }]);

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${titulo}.txt`;
      a.click();
      fetchData();
    }, {
      loading: 'Generando reporte...',
      success: 'Reporte guardado y descargado',
      error: 'Error al exportar',
    });
  };

  if (loading) return <div className="p-10 text-center italic text-muted-foreground">Cargando expediente...</div>;
  if (!patient) return <div className="p-6 text-center italic">Paciente no encontrado</div>;

  return (
    <div className="p-6 max-w-[1200px]">
      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground mb-5 -ml-2" onClick={() => navigate(ROUTE_PATHS.PATIENTS)}>
        <ArrowLeft className="w-4 h-4" /> Regresar a Pacientes
      </Button>

      {/* Header Profile */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/60 rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar className="w-20 h-20 shrink-0">
            <AvatarFallback className="bg-primary/15 text-primary text-2xl font-bold">
              {patient.nombre[0]}{patient.apellido[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{patient.nombre} {patient.apellido}</h1>
                <p className="text-muted-foreground mt-0.5">{getAge(patient.fechaNacimiento)} años · {patient.genero}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn('border-0 font-medium', STATUS_COLORS[patient.estado] || 'bg-muted')}>{STATUS_LABELS[patient.estado] || patient.estado}</Badge>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
                        <Download className="w-3.5 h-3.5" /> Exportar Reporte
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleExport(false)}><FileText className="w-4 h-4 mr-2" /> Estándar</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-primary" onClick={() => handleExport(true)}><Sparkles className="w-4 h-4 mr-2" /> Con IA</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/patients/edit/${patient.id}`)}><Edit className="w-3.5 h-3.5" /> Editar</Button>
                </div>
              </div>
            </div>
            {patient.diagnosticoprincipal && (
              <div className="mt-3 p-3 bg-primary/5 border border-primary/15 rounded-xl">
                <p className="text-xs font-medium text-primary mb-0.5">Diagnóstico principal</p>
                <p className="text-sm text-foreground">{patient.diagnosticoprincipal}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{patient.telefono}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{patient.email}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{patient.direccion}</span>
            </div>
          </div>
        </div>

        {/* Stats Row with Interactive Upcoming Session */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-border/40">
            {[
              { label: 'Sesiones totales', value: sessions.length, icon: Clock },
              { 
                label: 'Próxima sesión', 
                value: upcomingSessions.length > 0 ? `${upcomingSessions.length} agendada(s)` : '—', 
                icon: Calendar,
                isClickable: upcomingSessions.length > 0 
              },
              { label: 'Seguro Médico', value: patient.seguroMedico || 'Particular', icon: Shield },
              { label: 'Registro', value: new Date(patient.created_at).toLocaleDateString('es-MX', { year: 'numeric' }), icon: FileText },
            ].map((stat) => (
              <div 
                key={stat.label} 
                onClick={() => stat.isClickable && setShowUpcomingList(!showUpcomingList)}
                className={cn(
                  "text-center p-3 rounded-xl transition-all",
                  stat.isClickable ? "bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 shadow-sm" : "bg-muted/40"
                )}
              >
                <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                  {stat.value}
                  {stat.isClickable && <ChevronRight className={cn("w-4 h-4 transition-transform", showUpcomingList && "rotate-90")} />}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Floating Upcoming Sessions List */}
          {showUpcomingList && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 mt-2 w-full sm:w-[320px] left-0 sm:left-1/4 bg-card border border-border shadow-2xl rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-xs font-bold uppercase text-primary tracking-wider">Próximas Sesiones</p>
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setShowUpcomingList(false)}><Plus className="w-4 h-4 rotate-45" /></Button>
              </div>
              <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {upcomingSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/sessions/detail/${s.id}`)}>
                    <div>
                      <p className="text-xs font-semibold">{new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                      <p className="text-[10px] text-muted-foreground">{s.hora} · {s.modalidad}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="sesiones" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="sesiones" className="text-xs">Sesiones ({sessions.length})</TabsTrigger>
          <TabsTrigger value="documentos" className="text-xs">Documentos ({documents.length})</TabsTrigger>
          <TabsTrigger value="info" className="text-xs">Información</TabsTrigger>
        </TabsList>

        <TabsContent value="sesiones" className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Historial de sesiones</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => navigate(`/clinical-history/list/${patient.id}`)}><FileText className="w-3.5 h-3.5" /> Historia completa</Button>
              <Button size="sm" className="gap-2 text-xs" onClick={() => navigate(ROUTE_PATHS.SESSION_NEW.replace(':id', patient.id))}><Plus className="w-3.5 h-3.5" /> Nueva sesión</Button>
            </div>
          </div>
          
          {sessions.map((s) => (
            <DropdownMenu key={s.id}>
              <DropdownMenuTrigger asChild>
                <Card className="border-border/60 hover:bg-muted/30 cursor-pointer transition-colors group">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[50px]">
                        <p className="font-bold text-sm">{new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                        <p className="text-[10px] text-muted-foreground">{s.hora}</p>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn('text-[10px] border-0', SESSION_STATUS_COLORS[s.estado])}>{SESSION_STATUS_LABELS[s.estado] || s.estado}</Badge>
                          <span className="text-xs text-muted-foreground capitalize">{s.modalidad}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{s.notas || 'Ver historia de esta sesión...'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate(`/sessions/detail/${s.id}`)}><FileText className="w-4 h-4 text-primary" /> Ver Historia</DropdownMenuItem>
                {s.modalidad === 'virtual' && (
                  <DropdownMenuItem className="cursor-pointer gap-2 text-blue-600 font-medium" onClick={() => navigate(`/virtual-room/${s.id}`)}><VideoIcon className="w-4 h-4" /> Conectar a Sesión</DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate(`/sessions/edit/${s.id}`)}><Calendar className="w-4 h-4" /> Reprogramar Horario</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </TabsContent>

        <TabsContent value="documentos" className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="border-border/60 hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-start gap-3">
                  <FileText className="w-8 h-8 text-primary/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{doc.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] h-4 capitalize">{doc.tipo}</Badge>
                      {doc.generado_por_ia && <Badge className="text-[10px] h-4 bg-primary/10 text-primary border-0">IA</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* INFORMATION TAB - UNTOUCHED LAYOUT */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Información personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ['Nombre completo', `${patient.nombre} ${patient.apellido}`],
                  ['Fecha de nacimiento', new Date(patient.fechaNacimiento + 'T00:00:00').toLocaleDateString('es-MX')],
                  ['Edad', `${getAge(patient.fechaNacimiento)} años`],
                  ['Género', patient.genero?.charAt(0).toUpperCase() + patient.genero?.slice(1)],
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
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-warning" /> Motivo de consulta</CardTitle>
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