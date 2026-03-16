import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

const RegisterUser: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // empieza cerrado
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const domain = "@psicoclinic.dat";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const email = `${username}${domain}`;

    // 1. Crear usuario en tabla personalizada "usuarios"
    const { error: insertError } = await supabase
      .from("usuarios")
      .insert({
        email,
        password, // ⚠️ en producción usa hash (bcrypt)
        nombre: username,
        rol: "doctor",
      });

    if (insertError) {
      toast.error("Error al guardar en tabla: " + insertError.message);
      setLoading(false);
      return;
    }

    // 2. (Opcional) también registrar en auth.users si quieres login con Supabase Auth
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      toast.error("Error al registrar en auth: " + authError.message);
    } else {
      toast.success("Usuario registrado correctamente");
      setUsername("");
      setPassword("");
      setOpen(false); // cerrar modal
      navigate("/login"); // redirigir al login
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Registrar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar nuevo usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-username">Nombre de usuario</Label>
            <Input
              id="signup-username"
              type="text"
              placeholder="doctor01"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <p className="text-xs text-blue-200/60">
              El correo será: {username ? `${username}${domain}` : `usuario${domain}`}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Contraseña</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <UserPlus className="h-4 w-4 mr-2" />
            {loading ? "Registrando..." : "Registrar usuario"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterUser;
