OBJETIVO: Calcular el "Precio de Venta Sugerido" protegiendo el Margen Neto y contemplando la carga fiscal colombiana.

1. Arquitectura de Costos Operacionales (OPEX)
La IA debe calcular el Costo por Hora Real (CHR) del profesional antes de presupuestar un proyecto:

Costo de Vida Mensual: Suma de gastos fijos personales.

Provisiones Legales (Colombia): Agregar el 25% sobre el costo de vida (equivalente a prima, cesantías, vacaciones y salud/pensión si es independiente/contratista).

Amortización de Equipos: (Valor Equipo - Salvamento) / Meses Vida Útil.

Horas Facturables: No usar 160h/mes. Usar 120h/mes (considerando administración, ventas y aprendizaje).

Fórmula CHR: (Costo Vida + Provisiones + Amortización) / 120.

2. Lógica de Impuestos y Carga Fiscal (Colombia)
Identificar y aplicar según el régimen:

IVA (19%): Si el usuario es Responsable de IVA, se suma al final (no es parte del ingreso).

Retención en la Fuente (ReteFuente): La IA debe advertir que el cliente descontará entre el 4%, 6% o 11% (servicios/honorarios). El precio final debe compensar este flujo de caja si es necesario.

ICA (ReteICA): Aplicar promedio de 9.66/1000 según ciudad (ej. Bogotá/Tucumán/Medellín).

Impuesto de Renta: Provisionar el 15-35% de la utilidad neta.

3. Algoritmo de Cotización de Proyecto
Para cada servicio, la IA debe ejecutar este cálculo en orden estricto:

Costo Técnico del Proyecto: (Horas Estimadas * CHR) + Herramientas Específicas + Terceros.

Markup de Margen: Aplicar el % de Margen Neto deseado sobre el Costo Técnico.

Precio Antes de Impuestos: Costo Técnico / (1 - % Margen Deseado).

Validación de Alerta:

IF Precio Cobrado < Costo Técnico: AVISO CRÍTICO: "Estás perdiendo dinero. El precio no cubre tus costos operacionales ni amortizaciones."

IF Precio Cobrado > Costo Técnico BUT Margen < 20%: AVISO: "Margen de seguridad bajo. Riesgo de descapitalización."

💡 Ejemplo de cómo pedirle una tarea ahora:
"Calcula la propuesta para un diseño de marca que toma 40 horas. Mi costo de vida es 5M COP, uso una Mac de 8M (36 meses vida útil). Quiero un margen neto del 40%. Desglosa impuestos de Colombia y dime si cobrar 4M COP es coherente o si estoy por debajo de mi costo operacional."

# COLOMBIAN FISCAL ENGINE (STRICT)
- **Currency:** Solo operar en COP (Pesos Colombianos). 
- **Work Month:** Estándar de 120 horas facturables (ajustado por festivos y administración).
- **Tax Logic:**
    1. **ReteFuente:** Aplicar 11% (Honorarios) o 4%/6% (Servicios) según el perfil.
    2. **ReteICA:** Aplicar 9.66/1000 (Promedio nacional) sobre la base gravable.
    3. **IVA:** 19% (Solo si el usuario marca "Responsable de IVA").
    4. **Provisiones:** Sumar 25% prestacional (Salud, Pensión, ARL, Prima, Cesantías) sobre el costo de vida base.

# COTIZACIÓN LOGIC
- **Operational Floor:** (Costo Vida + Provisiones + Amortización) / 120h = CHR.
- **Project Price:** (Horas * CHR) / (1 - % Margen Neto).
- **Validation:** Si el precio sugerido < (Horas * CHR), ARROJAR ERROR: "Precio por debajo del punto de equilibrio operacional en Colombia".


Desglose del Cálculo Coherente (El "Cómo" debe pensar la IA)
Para que el cotizador no entregue cifras sin sentido, la instrucción interna ahora sigue este flujo visual y matemático:

1. Definición del "Piso" (Lo que no es negociable)
Si un usuario en Colombia tiene un costo de vida de $4.000.000 COP:

Costos Ocultos (+25%): $1.000.000 (Seguridad social y ahorro prestacional).

Amortización: $200.000 (Laptop/Software).

Total Operacional Mensual: $5.200.000 COP.

Costo Hora Real (CHR): $5.200.000 / 120 = **$43.333 COP**.

2. Cálculo del Proyecto vs. Impuestos
Si el proyecto toma 20 horas:

Costo Técnico: 20h * $43.333 = **$866.666 COP**.

Precio con Margen (40%): $866.666 / 0.6 = **$1.444.444 COP**.

Impacto Fiscal (Lo que recibe en el banco): La IA debe advertir que si le retienen el 11% (ReteFuente) y el 1% (ICA), recibirá aproximadamente $1.271.111. 