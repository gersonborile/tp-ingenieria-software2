import type { Metadata } from "next";

import ReservarClient from "./reservar-client";

export const metadata: Metadata = {
  title: "Confirmar reserva",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PaginaReservar({ params }: Props) {
  const { id } = await params;
  return <ReservarClient canchaId={id} />;
}
