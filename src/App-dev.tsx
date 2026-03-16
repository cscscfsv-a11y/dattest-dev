import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import PatientNew from "@/pages/PatientNew";
import ClinicalHistory from "@/pages/ClinicalHistory";
import Sessions from "@/pages/Sessions";
import SessionNew from "@/pages/SessionNew";
import Documents from "@/pages/Documents";
import SettingsPage from "@/pages/SettingsPage";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found/Index";
import { ROUTE_PATHS } from "@/lib/index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pacientes" element={<Patients />} />
                  <Route path="/pacientes/nuevo" element={<PatientNew />} />
                  <Route path="/pacientes/:id" element={<PatientDetail />} />
                  <Route path="/historial/:id" element={<ClinicalHistory />} />
                  <Route path="/sesiones" element={<Sessions />} />
                  <Route path="/sesiones/nueva" element={<SessionNew />} />
                  <Route path="/documentos" element={<Documents />} />
                  <Route path="/configuracion" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
