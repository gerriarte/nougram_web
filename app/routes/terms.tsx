import { Terms } from "../../pages/Terms";

export function meta() {
  return [
    { title: "Términos y Condiciones | Nougram" },
    { name: "description", content: "Condiciones de uso y tratamiento de datos de Nougram." },
  ];
}

export default function Route() {
  return <Terms />;
}
