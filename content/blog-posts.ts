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
