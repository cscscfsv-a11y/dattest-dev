import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  CalendarDays,
  TrendingUp,
  Clock,
  Plus,
  ChevronRight,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatCard } from '@/components/Stats';
import { ROUTE_PATHS, SESSION_STATUS_COLORS, SESSION_STATUS_LABELS } from '@/lib/index';
import {
  MOCK_STATS,
  MOCK_SESSIONS,
  MOCK_PATIENTS,
  CHART_SESSIONS_MONTH,
  CHART_DIAGNOSIS,
} from '@/data/index';
import { staggerContainer, staggerItem, springPresets } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";


export default function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    setEmail(session?.user?.email || null);
  });

  return () => {
    listener.subscription.unsubscribe();
  };
  }, []);

  const todaySessions = MOCK_SESSIONS.filter((s) => s.fecha === '2026-03-15');
  const recentPatients = MOCK_PATIENTS.filter((p) => p.estado === 'activo').slice(0, 4);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buenos días, Dra. Rivera 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hoy es domingo, 15 de marzo de 2026 · {todaySessions.length} sesiones programadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate(ROUTE_PATHS.PATIENT_NEW)}
          >
            <Plus className="w-4 h-4" />
            Nuevo paciente
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => navigate(ROUTE_PATHS.SESSION_NEW)}
          >
            <CalendarDays className="w-4 h-4" />
            Agendar sesión
          </Button>
        </div>
      </div>

      {/* 👇 Solo visible si el correo es admin@admin.ss */}
      {email === "admin@admin.ss" && (
        <div className="mt-6">
          <Button onClick={() => navigate("/usuarios/nuevo")} className="bg-red-600 hover:bg-red-700">
            Registrar nuevo usuario
          </Button>
        </div>

      )}

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Pacientes activos"
          value={MOCK_STATS.pacientesActivos}
          icon={Users}
          color="primary"
          trend={{ value: 8, label: 'este mes' }}
          subtitle={`de ${MOCK_STATS.totalPacientes} totales`}
        />
        <StatCard
          title="Sesiones hoy"
          value={MOCK_STATS.sesionesHoy}
          icon={CalendarDays}
          color="accent"
          subtitle="4 programadas"
        />
        <StatCard
          title="Esta semana"
          value={MOCK_STATS.sesionesEstaSemana}
          icon={Activity}
          color="success"
          trend={{ value: 5, label: 'vs semana anterior' }}
        />
        <StatCard
          title="Asistencia"
          value={`${MOCK_STATS.tasaAsistencia}%`}
          icon={TrendingUp}
          color="warning"
          subtitle="tasa mensual"
        />
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions today */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Sesiones de hoy</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-primary text-xs"
                  onClick={() => navigate(ROUTE_PATHS.SESSIONS)}
                >
                  Ver todas <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaySessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={springPresets.gentle}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer border border-transparent hover:border-border/40"
                >
                  <div className="text-center min-w-[48px]">
                    <p className="text-lg font-bold text-foreground">{session.hora}</p>
                    <p className="text-[10px] text-muted-foreground">{session.duracion}min</p>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                      {session.pacienteNombre.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{session.pacienteNombre}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      {session.modalidad === 'virtual'
                        ? <Video className="w-3 h-3" />
                        : <MapPin className="w-3 h-3" />}
                      {session.modalidad === 'virtual' ? 'Sesión virtual' : 'Presencial'} · {session.tipo}
                    </p>
                  </div>
                  <Badge className={cn('text-[10px] border-0 shrink-0', SESSION_STATUS_COLORS[session.estado])}>
                    {SESSION_STATUS_LABELS[session.estado]}
                  </Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Sessions chart */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Sesiones por mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={CHART_SESSIONS_MONTH} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="sesiones" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Diagnosis distribution */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Distribución diagnóstica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-3">
                <PieChart width={140} height={140}>
                  <Pie
                    data={CHART_DIAGNOSIS}
                    cx={65}
                    cy={65}
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CHART_DIAGNOSIS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2">
                {CHART_DIAGNOSIS.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={item.value}
                        className="w-16 h-1.5"
                      />
                      <span className="text-foreground font-medium w-7 text-right">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent active patients */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Pacientes activos</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-primary text-xs"
                  onClick={() => navigate(ROUTE_PATHS.PATIENTS)}
                >
                  Ver todos <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted/40 rounded-lg p-1.5 transition-colors"
                  onClick={() => navigate(ROUTE_PATHS.PATIENT_DETAIL.replace(':id', patient.id))}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                      {patient.nombre[0]}{patient.apellido[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {patient.nombre} {patient.apellido.split(' ')[0]}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {patient.totalSesiones} sesiones
                      {patient.proximaSesion && ` · Prox: ${new Date(patient.proximaSesion + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`}
                    </p>
                  </div>
                  {patient.proximaSesion ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
