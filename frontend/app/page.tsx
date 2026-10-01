import { PanelSesion } from "@/app/panel-sesion";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        Sistema de Reserva de Canchas
      </h1>
      <p className="max-w-md text-lg opacity-70">
        Reservá canchas de tenis, fútbol y pádel de tu club deportivo.
      </p>
      <PanelSesion />
    </main>
  );
}
