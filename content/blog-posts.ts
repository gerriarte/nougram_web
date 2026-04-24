export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  image: string;
  category: string;
  readTime: string;
}

export const BLOG_POSTS: Post[] = [
  {
    id: '6',
    slug: 'problematicas-precio-talento-2026',
    title: 'Problemáticas a la hora de ponerle precio a tu talento en 2026',
    excerpt:
      'He analizado los errores más comunes que convierten una cotización prometedora en una pesadilla financiera. Aquí tienes las principales problemáticas en 2026.',
    content: `
      <p>Entiendo perfectamente esa sensación de vacío en el estómago cada vez que tienes que enviar una propuesta. No eres solo tú; la mayoría de las agencias y creativos sienten que están "adivinando" en lugar de calculando.</p>

      <p>He analizado los errores más comunes que convierten una cotización prometedora en una pesadilla financiera. Aquí tienes las principales problemáticas a la hora de ponerle precio a tu talento en 2026.</p>

      <h2>1. La "Trampa" del Cobro por Horas</h2>
      <p>Muchos creativos comienzan cobrando por horas porque es lo más sencillo de entender, pero este modelo tiene un techo de cristal.</p>
      <ul>
        <li><strong>Penaliza la eficiencia:</strong> Entre más rápido y mejor hagas tu trabajo, menos ganas. Si un logo te toma 2 horas en lugar de 8 porque eres un experto, terminas recibiendo un 75% menos de ingresos por el mismo entregable.</li>
        <li><strong>Crea fricción con el cliente:</strong> Los clientes empiezan a cuestionar por qué una tarea tomó "X" cantidad de tiempo, convirtiéndote en un "cursor humano" bajo su supervisión constante.</li>
        <li><strong>No captura el valor de la IA:</strong> En 2026, si usas herramientas de IA que reducen horas de trabajo a minutos, cobrar por tiempo destruye tu rentabilidad.</li>
      </ul>

      <h2>2. El "Scope Creep" o Desbordamiento del Alcance</h2>
      <p>Este es el asesino silencioso de los márgenes de beneficio. Se estima que entre el 37% y el 52% de los proyectos sufren de este mal.</p>
      <ul>
        <li><strong>El "favorcito" no facturado:</strong> Esa revisión extra, la llamada de estrategia de 90 minutos que debía ser de 30, o el pequeño cambio "que no cuesta nada" erosionan significativamente tu margen de entrega.</li>
        <li><strong>Falta de límites claros:</strong> Si el contrato no define con precisión qué está incluido (y qué NO), el cliente asumirá que su pago cubre cualquier deseo adicional.</li>
      </ul>

      <h2>3. Errores de Estimación (Scoping Guesswork)</h2>
      <p>Cotizar un precio fijo (fixed-fee) sin una base de datos real es básicamente apostar contra ti mismo.</p>
      <ul>
        <li><strong>Subestimar recursos:</strong> Si calculas mal el tiempo o las personas necesarias, cualquier ahorro por eficiencia desaparece y terminas pagando por trabajar.</li>
        <li><strong>Falta de procesos estándar:</strong> Sin un historial de proyectos pasados para comparar, cada cotización es un experimento nuevo propenso al error.</li>
      </ul>

      <h2>4. La Psicología del Miedo y el "Pensamiento Artesanal"</h2>
      <p>A menudo, el problema no son los números, sino la mentalidad de quien los escribe.</p>
      <ul>
        <li><strong>Miedo a perder al cliente:</strong> Muchos líderes de agencias sabotean su propia riqueza bajando precios por miedo a que el cliente diga que no o por exceso de confianza tras un éxito previo.</li>
        <li><strong>No saber decir "no":</strong> La tentación de aceptar cualquier encargo diluye tu especialización, lo que te obliga a competir por precio en lugar de valor. Las agencias especializadas logran márgenes de hasta el 40%, mientras que las generalistas suelen quedarse en el 15-20%.</li>
      </ul>

      <h2>5. Datos Inexactos: El Problema de la "Medición Manual"</h2>
      <p>No puedes gestionar lo que no mides con precisión.</p>
      <ul>
        <li><strong>Fuga de horas:</strong> El registro manual de tiempo captura solo un 67% del trabajo facturable real, mientras que los sistemas automatizados llegan al 91%.</li>
        <li><strong>Desconocimiento del costo real:</strong> Si no conoces tu Costo Promedio por Hora (ACPH) —que incluye salarios, impuestos y software—, podrías estar cotizando por debajo de tu punto de equilibrio sin saberlo.</li>
      </ul>

      <h2>Conclusión para tu Agencia</h2>
      <p>Si sientes que tu equipo está saturado pero tu cuenta bancaria no refleja ese esfuerzo, es probable que tengas un problema de margen de entrega. La solución no siempre es trabajar más, sino transitar hacia modelos de Precios Basados en Valor o Servicios Productizados que desvinculen tus ingresos del reloj.</p>

      <p>¿Cuál de estos problemas te está quitando el sueño hoy? ¡Hablemos de cómo blindar tus próximas propuestas!</p>
    `,
    date: '2026-04-23',
    author: 'Equipo Nougram',
    image: '/blog/pricing-talent-2026.png',
    category: 'Rentabilidad',
    readTime: '7 min'
  },
  {
    id: '5',
    slug: 'cinco-puntos-precision-escalar-agencia',
    title: 'Cinco puntos de precisión para escalar tu agencia sin ser el freno de mano',
    excerpt:
      'Si cada entrega pasa por tu pulgar, no tenés operación: tenés un auto con freno de mano. Sistemas, IA y criterio automatizado para recuperar margen y dejar de ser indispensable.',
    content: `
      <p>He pasado casi dos décadas viendo cómo agencias en Buenos Aires, Lima o Bogotá se funden mientras ganan premios de creatividad. El síntoma es siempre el mismo. El director creativo o el líder técnico quiere aprobar cada post, cada línea de código o cada automatización de flujo. Si tu equipo no puede mover un bit o publicar un asset sin tu pulgar arriba, no tenés una operación. Tenés un auto con el freno de mano puesto.</p>

      <p>Eso no es liderazgo. Es fuga de valor. Estás pagando sueldos altos para terminar haciendo el trabajo vos.</p>

      <p>La rentabilidad no es un deseo. Es una estructura de física operativa. Si cada entrega depende de tu intuición y no de un sistema, tu margen de ganancia está muerto.</p>

      <h2>Escalá tu agencia con estos 5 puntos de precisión</h2>

      <h2>1. Dejá de ser el portero del contenido</h2>
      <p>Los líderes que actúan como aprobadores exclusivos destruyen la eficiencia del equipo. Si desarrollás sitios o apps, usá Vercel para despliegues automáticos. Si hacés contenido, usá herramientas de gestión de activos que se sincronicen solas. El sistema publica. Vos proyectás el negocio.</p>

      <h2>2. Usá la inteligencia artificial para auditar procesos</h2>
      <p>No uses la IA solo para escribir textos mediocres. Implementá agentes que analicen el tiempo que tu equipo pierde en tareas repetitivas. Los números no tienen sentimientos. Si tu equipo creativo pasa 10 horas semanales redimensionando imágenes a mano, tenés una hemorragia de dinero.</p>

      <h2>3. Automatizá el criterio de calidad</h2>
      <p>No podés enseñarle "buen gusto" a un junior en una tarde. Pero podés configurar reglas de validación técnica y prompts de IA que actúen como filtros de calidad antes de que el trabajo llegue a vos. La tecnología asume la validación operativa. Vos delegás con seguridad total.</p>

      <h2>4. Dejá de vender artesanías caras</h2>
      <p>Cada vez que tu equipo inventa una estrategia desde cero para un cliente pequeño, perdés plata. Extraé la lógica de tus casos de éxito. Creá plantillas de arquitectura y librerías internas. Usar bloques de construcción reutilizables baja el costo de producción un 40%.</p>

      <h2>5. Documentá decisiones estructurales</h2>
      <p>El conocimiento debe ser de la agencia, no de tu cabeza. Escribí registros de procesos claros. Si entra un creativo nuevo, tiene que entender cómo operás leyendo el sistema, no interrumpiendo tu tarde.</p>

      <p>La velocidad de tu equipo depende de tus restricciones técnicas. La IA y los sistemas eliminan las decisiones subjetivas que te quitan tiempo. Menos intervención manual significa más margen rentable. Escalar es lograr que el negocio funcione en limpio sin que vos seas la pieza indispensable del engranaje.</p>
    `,
    date: '2026-04-04',
    author: 'Equipo Nougram',
    image:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=1200',
    category: 'Operaciones',
    readTime: '6 min'
  },
  {
    id: '4',
    slug: 'costo-oculto-experiencia-ser-eficiente-sale-caro',
    title: 'El costo oculto de tu propia experiencia: por qué ser eficiente te está saliendo caro',
    excerpt: 'Cobrar por hora penaliza tu expertise. Descubre cómo pasar de horas-silla a pricing por valor para proteger margen, escalar ingresos y dejar de regalar tu experiencia.',
    content: `
      <p><strong>Sentarte frente a un presupuesto en blanco y sentir culpa.</strong></p>

      <p>Si tenés una empresa de servicios, una agencia o sos consultor, sabés exactamente de qué estoy hablando. Es ese nudo en el estómago que aparece cuando tenés que ponerle precio a un trabajo que resolviste demasiado rápido.</p>

      <p>Dejame adivinar si esta escena te resulta familiar:</p>

      <p>Es martes por la tarde. Te llama un cliente desesperado porque tiene un problema crítico que le frenó la operación o le está tirando abajo una campaña que quema miles de dólares por día. Lo escuchás durante cinco minutos y, gracias a todas las cicatrices que juntaste en la última década, detectás la falla al instante.</p>

      <p>Aplicás la solución precisa y en menos de una hora todo vuelve a funcionar. El cliente respira aliviado, te agradece como si fueras un héroe y el incendio se apaga.</p>

      <p>Pero a fin de mes llega el momento de armar la factura. Abrís tu plantilla, mirás el reloj y aparece esa voz incómoda en tu cabeza: <em>"No le puedo cobrar mil dólares si me llevó solo una hora".</em></p>

      <p>Terminás pasando un presupuesto mínimo, casi pidiendo perdón por ser rápido. Ignorás por completo que te tomó diez años de errores, madrugadas, cursos y crisis aprender a resolver ese problema específico en solo 60 minutos.</p>

      <p>Bienvenido a la trampa de la eficiencia silenciosa. Y dejame decirte algo como founder que ya se tropezó con esa misma piedra: <strong>te está saliendo carísimo.</strong></p>

      <h2>La penalidad por ser un experto</h2>
      <p>En la economía del conocimiento, mantener un modelo de precio atado exclusivamente al reloj en lugar de atarlo al resultado es un suicidio financiero a cámara lenta.</p>

      <p>Hagamos la matemática simple. Supongamos que un Junior cobra $30 la hora y tarda 15 horas en resolver un problema. El cliente paga $450 y asume el riesgo de que el Junior se equivoque en el proceso.</p>

      <p>Vos, como experto, cobrás $100 la hora. Resolvés ese mismo problema, sin fricciones y sin riesgo para el cliente, en 2 horas. El cliente paga $200.</p>

      <p>¿Te das cuenta de lo que acaba de pasar? El sistema te acaba de multar con $250 por ser excelente en lo que hacés. Mientras más experto te volvés, menos tardás. Y si seguís cobrando por hora, menos facturás. Estás, literalmente, subsidiando la ineficiencia del modelo con tu propio talento.</p>

      <h2>Lo que realmente te están comprando</h2>
      <p>Como dueños de negocios de servicios, tenemos que entender un principio fundamental para poder escalar: el cliente no te está comprando tiempo, te está comprando la mitigación inmediata de un riesgo.</p>

      <p>Te pagan para no tener que sufrir los mismos errores que vos ya cometiste. Te pagan por la certeza de que el problema va a desaparecer. Cuando le cobrás a un cliente por una solución rápida, no le estás facturando los 60 minutos que tardaste en apretar las teclas correctas; le estás cobrando por saber exactamente qué teclas apretar.</p>

      <p>Tu experiencia tiene un peso específico, y si no la ponés en la balanza a la hora de cotizar, tu margen de ganancia se va a ir erosionando mes a mes.</p>

      <h2>El síndrome del impostor financiero</h2>
      <p>Saber esto en la teoría es fácil, pero aplicarlo cuando tenés al cliente enfrente es otra historia. El "síndrome del impostor" a la hora de cobrar es real. Sentimos que si no transpiramos la camiseta durante 40 horas, el trabajo no vale.</p>

      <p>Esa es exactamente la razón por la que en Nougram decidimos matar la cotización manual.</p>

      <p>Cuando dejás los precios librados a tu estado de ánimo, a tu nivel de cansancio o a tu culpa de ese día, el negocio sufre. Construimos Nougram para que actúe como tu CFO digital, un sistema frío y calculador que te protege de tus propias inseguridades.</p>

      <p>Nuestra infraestructura te empuja a estructurar tus propuestas basándote en la complejidad real del proyecto, los costos operativos integrados y el impacto que esa solución tiene en el negocio del cliente. Te da los datos duros que necesitás para justificar tus números, desacoplando definitivamente tus ingresos de las agujas del reloj.</p>

      <p>Pasar de cobrar por "horas-silla" a cobrar por el valor del resultado no es un truco de ventas; es la evolución natural de un profesional maduro hacia una empresa escalable.</p>

      <p>La próxima vez que tengas que enviar una cotización por un trabajo que resolviste rápido, hacete una pregunta con total honestidad:</p>

      <blockquote>¿Le estás cobrando los 60 minutos que te tomó aplicar la solución, o la década de experiencia que te permitió saber exactamente qué hacer?</blockquote>

      <p><strong>Dejá de pedir perdón por ser bueno. Es hora de cobrar lo que vale tu historia.</strong></p>

      <h2>Siguiente paso: auditar tu rentabilidad real</h2>
      <p>Si querés dejar de cotizar con culpa y empezar a defender tus márgenes con datos, medí hoy mismo la salud financiera de tu operación y detectá dónde se está fugando valor.</p>

      <p>
        <a href="/test-salud-financiera" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#F35D0A;color:#fff;text-decoration:none;font-weight:700;">
          Hacer test de salud financiera
        </a>
      </p>
    `,
    date: '2026-03-30',
    author: 'Equipo Nougram',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200',
    category: 'Rentabilidad',
    readTime: '7 min'
  },
  {
    id: '3',
    slug: 'facturar-no-es-ganar-anemia-de-margen-agencias',
    title: 'Facturar no es ganar: por qué tu agencia sufre de "Anemia de Margen" (y cómo frenarla)',
    excerpt: 'La facturación es una métrica de vanidad. Descubre por qué tu utilidad neta real se fuga por ceguera fiscal, BCR mal calculado y scope creep sin blindaje.',
    content: `
      <p>Festejás el cierre de un contrato transfronterizo por <strong>$10,000 USD</strong>. El equipo aplaude, el pipeline de ventas se ve increíble en el CRM y proyectás un crecimiento récord para el trimestre.</p>

      <p>Pero cuando el proyecto termina y el dinero finalmente aterriza en la cuenta bancaria de la agencia, el número es <strong>$7,000 USD</strong>.</p>

      <p><strong>No tenés un problema de ventas. Tenés Anemia de Margen.</strong></p>

      <p>En la industria de servicios y la economía del conocimiento, las agencias dejan hasta un <strong>25% de sus ingresos anuales</strong> sobre la mesa. La facturación es una métrica de vanidad; la única métrica de crecimiento real que importa es el <strong>Net Take</strong> (la utilidad neta que te queda limpia en el banco).</p>

      <p>Si tu agencia factura bien pero no logra acumular capital para escalar, el problema no está en tus closers de ventas. Está en tu infraestructura de cotización. Tu rentabilidad se está fugando por tres grietas estructurales:</p>

      <h2>1. Ceguera Fiscal Transfronteriza</h2>
      <p>Venderle a Estados Unidos desde Colombia, Perú o Argentina es un negocio redondo, hasta que interviene el fisco. Si estás cotizando sin aplicar lógica nativa de tratados de doble tributación, estás operando a ciegas.</p>
      <p>Ese contrato que cerraste no contempló el <strong>Withholding Tax (Retención en la Fuente)</strong>. De entrada, le acabás de regalar entre un <strong>10% y un 30%</strong> de tu margen bruto a un gobierno extranjero, sumado al spread cambiario que te cobran las plataformas de pago. El cliente pagó lo acordado, pero vos cobraste mucho menos.</p>

      <h2>2. El Espejismo del BCR (Blended Cost Rate)</h2>
      <p>La mayoría de las agencias cotizan a "ojímetro" o basándose en el salario neto del equipo. Grave error. Si tu costo por hora no incluye el prorrateo exacto de tus costos fijos (herramientas SaaS, servidores, infraestructura) y las horas no facturables reales de tu equipo, tu base matemática está rota.</p>
      <p>Si el costo operativo real de tu agencia para un proyecto es de <strong>$11,000 USD</strong> y lo vendiste en <strong>$10,000 USD</strong> porque calculaste mal tu BCR, acabás de pagar por trabajar.</p>

      <h2>3. El costo del "Scope Creep" sin blindaje</h2>
      <p>Un proyecto mal dimensionado en horas no solo retrasa a tu equipo; destruye tu rentabilidad proyectada. Cuando pasás de "vender un proyecto" a "regalar horas extra" porque la propuesta inicial no tenía los guardrails técnicos necesarios, el margen de utilidad cae en picada semana a semana.</p>

      <h2>Por qué tu ERP actual no te va a salvar</h2>
      <p>Si creés que implementar QuickBooks, Alegra o un software contable tradicional va a solucionar esto, estás mirando el problema por el espejo retrovisor.</p>
      <p>Los ERPs son sistemas de registro. Operan como médicos forenses: te avisan a fin de mes, cuando cruzás facturas, de qué se murió tu margen. Son excelentes para la burocracia, pero inútiles para el crecimiento estratégico.</p>
      <blockquote>Para escalar un negocio de servicios B2B, no necesitás registrar la pérdida; necesitás ingeniería preventiva. Necesitás auditar la rentabilidad antes de enviar el PDF al cliente.</blockquote>

      <h2>La solución: Diseñar la rentabilidad</h2>
      <p>Dejar de regalar el 25% de tus ingresos requiere cambiar la forma en la que construís propuestas. Significa implementar una capa de inteligencia financiera que cruce tu BCR real con los tratados fiscales internacionales en tiempo real.</p>
      <p>Si el sistema te alerta que tu Net Take va a caer por debajo de tu objetivo de rentabilidad antes de que el cliente vea la cotización, tenés el poder de ajustar el precio, cambiar la estructura del contrato o, directamente, dejar pasar un negocio que solo te iba a dar flujo de caja pero cero utilidad.</p>
      <p><strong>La facturación te mantiene ocupado. La rentabilidad es lo único que te permite crecer.</strong></p>

      <h2>¿Querés saber exactamente cuánta plata estás dejando en la mesa?</h2>
      <p>No me creas a mí, creele a tus propios números. Hacé nuestro Test de Salud Financiera o traé tu última cotización internacional y la pasamos por el motor fiscal de Nougram en vivo. Vamos a encontrar la fuga en menos de 15 minutos.</p>

      <p>
        <a href="/test-salud-financiera" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#F35D0A;color:#fff;text-decoration:none;font-weight:700;">
          Realizar test de salud financiera
        </a>
      </p>
    `,
    date: '2026-03-27',
    author: 'Equipo Nougram',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    category: 'Rentabilidad',
    readTime: '8 min'
  },
  {
    id: '1',
    slug: 'como-ia-esta-transformando-cotizaciones',
    title: 'Cómo la IA está transformando el proceso de cotización en 2026',
    excerpt: 'Descubre cómo la inteligencia artificial está eliminando las tareas repetitivas y permitiendo a las empresas cerrar ventas un 40% más rápido.',
    content: `
      <p>La automatización de procesos mediante Inteligencia Artificial no es el futuro, es el presente. En el competitivo mercado de 2026, la velocidad de respuesta es el factor determinante para cerrar un trato.</p>
      
      <h2>El fin de las hojas de cálculo manuales</h2>
      <p>Tradicionalmente, crear una cotización compleja tomaba horas, si no días. Hoy, gracias a herramientas como Nougram, este proceso se reduce a segundos.</p>
      
      <blockquote>"La precisión en el cálculo de costos es crítica. Un error del 5% puede significar la pérdida de rentabilidad de todo un proyecto."</blockquote>

      <h2>Beneficios clave de usar IA en ventas</h2>
      <ul>
        <li>Reducción de errores humanos en cálculos matemáticos.</li>
        <li>Personalización instantánea basada en el perfil del cliente.</li>
        <li>Seguimiento automatizado para aumentar la tasa de conversión.</li>
      </ul>

      <p>En conclusión, adoptar IA en tu flujo de trabajo de ventas no es solo una mejora tecnológica, es una necesidad estratégica para cualquier negocio que busque escalar de manera eficiente.</p>
    `,
    date: '2026-02-20',
    author: 'Equipo Nougram',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    category: 'Tecnología',
    readTime: '5 min'
  },
  {
    id: '2',
    slug: 'optimizacion-de-bcr-para-proyectos',
    title: 'La importancia del BCR (Benefit-Cost Ratio) en tus proyectos',
    excerpt: 'Aprende a calcular y optimizar el ratio beneficio-costo para asegurar la rentabilidad de cada propuesta que envías.',
    content: `
      <p>Entender la rentabilidad antes de empezar un proyecto es lo que separa a las empresas exitosas del resto. El BCR es una métrica fundamental que todo gestor debería dominar.</p>
      
      <h2>¿Qué es el BCR?</h2>
      <p>El ratio beneficio-costo es una técnica que se utiliza para evaluar proyectos. Si el resultado es mayor a 1, el proyecto se considera rentable.</p>

      <h2>Cómo nougram ayuda con el BCR</h2>
      <p>Nuestra plataforma calcula automáticamente estos márgenes en tiempo real mientras construyes tu propuesta, alertándote si un descuento compromete la salud financiera de la empresa.</p>
    `,
    date: '2026-02-15',
    author: 'Analista de Negocios',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    category: 'Finanzas',
    readTime: '4 min'
  }
];
