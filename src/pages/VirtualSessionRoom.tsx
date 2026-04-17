import { useParams, useNavigate } from 'react-router-dom';
import { Video, Mic, MessageSquare, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabaseClient";

export default function VirtualSessionRoom() {
  const { id } = useParams(); // ID de la sesión
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("sesiones")
        .select("*, pacientes(nombre, apellido)")
        .eq("id", id).single();
      setSession(data);
    }
    load();
  }, [id]);

  if (!session) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col">
      <div className="p-4 bg-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h1 className="font-medium">Sesión Virtual: {session.pacientes.nombre}</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={() => navigate(-1)}>
          <LogOut className="w-4 h-4 mr-2" /> Salir de la Sala
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full aspect-video bg-slate-800 rounded-2xl flex flex-col items-center justify-center border border-slate-700 shadow-2xl relative overflow-hidden">
           <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded text-xs">Vista del Terapeuta</div>
           <Video className="w-20 h-20 text-slate-600 mb-4" />
           <p className="text-slate-400">Esperando conexión de {session.pacientes.nombre}...</p>
        </div>
      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-center gap-4">
        <Button variant="secondary" size="icon" className="rounded-full w-12 h-12"><Mic /></Button>
        <Button variant="secondary" size="icon" className="rounded-full w-12 h-12 text-blue-400"><MessageSquare /></Button>
      </div>
    </div>
  );
}