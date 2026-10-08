import type { Metadata } from "next";

import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function PaginaInicio() {
  return <HomeClient />;
}
