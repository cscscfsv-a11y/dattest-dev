// src/pages/ClinicalRecords.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

interface ClinicalRecord {
  id: string;
  diagnostico: string;
  anamnesis: string;
  planTratamiento: string;
  created_at: string;
}

export default function ClinicalRecords() {
  const { id } = useParams<{ id: string }>(); // id del paciente
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("clinical_records")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setRecords(data as ClinicalRecord[]);
      }
      setLoading(false);
    };

    if (id) fetchRecords();
  }, [id]);

  if (loading) return <p>Cargando registros...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Historia clínica</h2>

      {records.length === 0 ? (
        <p>No hay registros clínicos para este paciente.</p>
      ) : (
        <ul className="space-y-3">
          {records.map((rec) => (
            <li
              key={rec.id}
              className="border rounded-lg p-4 bg-card hover:shadow-sm transition"
            >
              <p className="text-sm text-muted-foreground">
                Fecha: {new Date(rec.created_at).toLocaleDateString("es-MX")}
              </p>
              <p className="font-medium">Diagnóstico: {rec.diagnostico}</p>
              <p className="text-sm">Anamnesis: {rec.anamnesis}</p>
              <p className="text-sm">Plan de tratamiento: {rec.planTratamiento}</p>
            </li>
          ))}
        </ul>
      )}

      <Button className="mt-4">Agregar nuevo registro</Button>
    </div>
  );
}
