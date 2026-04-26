import { Documentation } from "../../pages/Documentation";

export function meta() {
  return [
    { title: "Documentación | Nougram" },
    { name: "description", content: "Aprende cómo optimizar tus cotizaciones con Nougram." },
  ];
}

export default function Route() {
  return <Documentation />;
}
