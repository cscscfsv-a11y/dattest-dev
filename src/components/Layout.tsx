import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Settings,
  Brain,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTE_PATHS } from '@/lib/index';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { springPresets } from '@/lib/motion';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: ROUTE_PATHS.HOME },
  { icon: Users, label: 'Pacientes', path: ROUTE_PATHS.PATIENTS, badge: 24 },
  { icon: CalendarDays, label: 'Sesiones', path: ROUTE_PATHS.SESSIONS },
  { icon: FileText, label: 'Documentos', path: ROUTE_PATHS.DOCUMENTS },
  { icon: Settings, label: 'Configuración', path: ROUTE_PATHS.SETTINGS },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-sidebar text-sidebar-foreground flex flex-col',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ transition: 'transform 0.3s ease' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-sidebar-foreground tracking-tight">PsicoClinic</h1>
            <p className="text-[11px] text-sidebar-foreground/50">Sistema clínico</p>
          </div>
          <button
            className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 px-3 mb-3">
            Menú principal
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTE_PATHS.HOME}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-[3px] border-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )
              }
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 min-w-5 px-1.5 bg-primary/20 text-primary border-0"
                >
                  {item.badge}
                </Badge>
              )}
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User profile */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-white text-xs font-bold">DR</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">Dra. Rivera</p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate">Psicóloga clínica</p>
            </div>
            <LogOut className="w-4 h-4 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors" />
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center gap-4 px-6 shrink-0">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb / Page title */}
          <div className="flex-1">
            <PageTitle pathname={location.pathname} />
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <Button variant="outline" size="sm" className="gap-2 text-muted-foreground hidden sm:flex">
              <Search className="w-3.5 h-3.5" />
              <span className="text-sm">Buscar...</span>
              <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border ml-2">⌘K</kbd>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>

            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">DR</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function PageTitle({ pathname }: { pathname: string }) {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/pacientes': 'Pacientes',
    '/pacientes/nuevo': 'Nuevo Paciente',
    '/sesiones': 'Sesiones',
    '/sesiones/nueva': 'Nueva Sesión',
    '/documentos': 'Documentos',
    '/configuracion': 'Configuración',
  };

  const patientMatch = pathname.match(/^\/pacientes\/([^/]+)$/);
  const historialMatch = pathname.match(/^\/historial\/([^/]+)$/);

  let title = titles[pathname] || 'PsicoClinic';
  if (patientMatch && patientMatch[1] !== 'nuevo') title = 'Perfil del Paciente';
  if (historialMatch) title = 'Historia Clínica';

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  );
}
