// src/pages/PatientEdit.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PatientEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setPatient(data);
      }
      setLoading(false);
    };

    if (id) fetchPatient();
  }, [id]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("pacientes")
      .update({
        nombre: patient.nombre,
        apellido: patient.apellido,
        telefono: patient.telefono,
        fechaNacimiento: patient.fechaNacimiento,
        genero: patient.genero,
      })
      .eq("id", id);

    if (error) {
      console.error("Error actualizando paciente:", error);
    } else {
      navigate(`/pacientes/${id}`); // vuelve al detalle
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!patient) return <p>No se encontró el paciente</p>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Editar paciente</h2>

      <div className="space-y-3">
        <div>
          <Label>Nombre</Label>
          <Input
            value={patient.nombre || ""}
            onChange={(e) => setPatient({ ...patient, nombre: e.target.value })}
          />
        </div>
        <div>
          <Label>Apellido</Label>
          <Input
            value={patient.apellido || ""}
            onChange={(e) => setPatient({ ...patient, apellido: e.target.value })}
          />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input
            value={patient.telefono || ""}
            onChange={(e) => setPatient({ ...patient, telefono: e.target.value })}
          />
        </div>
        <div>
          <Label>Fecha de nacimiento</Label>
          <Input
            type="date"
            value={patient.fechaNacimiento || ""}
            onChange={(e) =>
              setPatient({ ...patient, fechaNacimiento: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Género</Label>
          <Input
            value={patient.genero || ""}
            onChange={(e) => setPatient({ ...patient, genero: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={handleSave}>Guardar</Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
