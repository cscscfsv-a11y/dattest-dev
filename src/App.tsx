import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import ClinicalRecords from "@/pages/ClinicalRecords";
import SessionHistory from "@/pages/SessionHistory";
import ClinicalHistoryList from "@/pages/ClinicalHistoryList";
import VirtualSessionRoom from "@/pages/VirtualSessionRoom";
import MentalStatusExam from "@/pages/MentalStatusExam";
import HistoryImageSearch from "@/pages/HistoryImageSearch";
import StudyAnalysisAI from "@/pages/StudyAnalysisAI";
import SessionEdit from "@/pages/SessionEdit";
import SessionDetail from "@/pages/SessionDetail";
import PatientDetail from "@/pages/PatientDetail";
import PatientEdit from "@/pages/PatientEdit";
import PatientNew from "@/pages/PatientNew";
import ClinicalHistory from "@/pages/ClinicalHistory";
import Sessions from "@/pages/Sessions";
import SessionNew from "@/pages/SessionNew";
import Documents from "@/pages/Documents";
import SettingsPage from "@/pages/SettingsPage";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found/Index";
import { ROUTE_PATHS } from "@/lib/index";
import RegisterUser from "@/pages/RegisterUser";
import ProtectedRoute from "@/components/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterUser />} />
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
                  <Route path="/session-new/:id" element={<SessionNew />} />
                  <Route path="/patients/edit/:id" element={<PatientEdit />} />
                  <Route path="/clinical-history/:id" element={<ClinicalRecords />} />
                  <Route path="/sessions/history/:id" element={<SessionHistory />} />
                  <Route path="/clinical-history/list/:id" element={<ClinicalHistoryList />} />
                  <Route path="/sessions/detail/:id" element={<SessionDetail />} />
                  <Route path="/virtual-room/:id" element={<VirtualSessionRoom />} />
                  <Route path="/sessions/edit/:id" element={<SessionEdit />} />
                  <Route path="/mental-status/:id" element={<MentalStatusExam />} />
                  <Route path="/patient/:id/history-search/:recordId" element={<HistoryImageSearch />} />
                  <Route path="/analysis/:recordId/:studyType" element={<StudyAnalysisAI />} />
                  <Route
                    path="/sesiones"
                    element={
                      <ProtectedRoute requiredName="Admin">
                        <Sessions />
                      </ProtectedRoute>
                    }
                  />


                  <Route
                    path="/sesiones/nueva"
                    element={
                      <ProtectedRoute requiredName="Admin">
                        <SessionNew />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/documentos"
                    element={
                      <ProtectedRoute requiredName="Admin">
                        <Documents />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/configuracion"
                    element={
                      <ProtectedRoute requiredName="Admin">
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

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
