import type { Metadata } from "next";
import CanchasClient from "./canchas-client";

export const metadata: Metadata = {
  title: "Canchas y disponibilidad",
};

export default function PaginaCanchas() {
  return <CanchasClient />;
}