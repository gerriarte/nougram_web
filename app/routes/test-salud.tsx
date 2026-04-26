import { FinancialHealthTest } from "../../pages/FinancialHealthTest";

export function meta() {
  return [
    { title: "Test de Salud Financiera | Nougram" },
    { name: "description", content: "Evalúa la rentabilidad de tu agencia o servicio profesional." },
  ];
}

export default function Route() {
  return <FinancialHealthTest />;
}
