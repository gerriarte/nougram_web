export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string for simplicity in microblogging
  date: string;
  author: string;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'como-calcular-precio-hora-freelance',
    title: '¿Cómo calcular tu precio hora real siendo Freelance?',
    excerpt: 'Deja de adivinar. Descubre la fórmula exacta para cubrir tus costos de vida, impuestos y generar ganancia real.',
    date: '2024-01-07',
    author: 'Equipo Nougram',
    tags: ['Freelance', 'Finanzas', 'Precios'],
    content: `
      <p>Uno de los errores más comunes al empezar como freelance es poner precios basándose en lo que cobra la competencia o, peor aún, en lo que "creemos" que es justo sin hacer números.</p>
      
      <h2>El error de cobrar solo por tiempo operativo</h2>
      <p>Si trabajas 40 horas a la semana, no puedes cobrar por 40 horas. ¿Por qué? Porque necesitas tiempo para:</p>
      <ul>
        <li>Buscar clientes</li>
        <li>Hacer contabilidad</li>
        <li>Responder emails</li>
        <li>Capacitarte</li>
      </ul>
      <p>En realidad, solo eres "productivo" (facturable) unas 20-25 horas a la semana.</p>

      <h2>La Fórmula Nougram</h2>
      <p>Para calcular tu tarifa mínima viable, debes sumar:</p>
      <ol>
        <li><strong>Costos de Vida Mensuales:</strong> Alquiler, comida, servicios.</li>
        <li><strong>Costos del Negocio:</strong> Software, internet, equipos.</li>
        <li><strong>Impuestos:</strong> Aproximadamente un 10-20% dependiendo de tu país.</li>
        <li><strong>Margen de Beneficio:</strong> El dinero que usarás para crecer o ahorrar (mínimo 20%).</li>
      </ol>
      
      <p>Divide ese total entre tus horas facturables reales, y tendrás tu <strong>Tarifa Mínima</strong>. Menos de eso, estás perdiendo dinero.</p>
      
      <p>¿Te parece complicado calcularlo a mano? <strong>Nougram hace todo esto por ti en segundos.</strong></p>
    `
  },
  {
    slug: 'vender-servicios-conocimiento',
    title: 'Deja de vender horas, empieza a vender valor',
    excerpt: 'La trampa del intercambio tiempo-dinero y cómo salir de ella paquetizando tus servicios.',
    date: '2024-01-05',
    author: 'Equipo Nougram',
    tags: ['Ventas', 'Estrategia', 'Mindset'],
    content: `
      <p>Cuando vendes horas, tu techo de ingresos está limitado por la cantidad de horas que puedes trabajar humanamente. Y spoiler: te vas a cansar.</p>
      
      <h2>El problema de la tarifa por hora</h2>
      <p>El cliente siempre querrá pagar por menos horas. Tú querrás tardar más para cobrar más. Es un conflicto de intereses.</p>
      
      <h2>La solución: Productizar</h2>
      <p>Empaqueta tu conocimiento en soluciones cerradas. Ejemplo:</p>
      <ul>
        <li>❌ "Te cobro $50/hora por diseñar logos."</li>
        <li>✅ "Pack de Identidad Visual Corporativa: $800."</li>
      </ul>
      
      <p>Al cobrar por proyecto o valor, si eres eficiente y terminas rápido, tu rentabilidad aumenta. El cliente paga por el resultado, no por tu sufrimiento.</p>
    `
  },
  {
    slug: 'subir-precios-2026-guia',
    title: 'Cómo subir tus precios este 2026 sin perder clientes',
    excerpt: 'La inflación sube, tu experiencia también. Guía paso a paso para comunicar el aumento de tarifas con profesionalismo y confianza.',
    date: '2024-01-08',
    author: 'Equipo Nougram',
    tags: ['Negocios', 'Crecimiento', 'Clientes'],
    content: `
      <p>Es enero. Todo sube: el alquiler, la comida, el software. ¿Y tus precios? Si sigues cobrando lo mismo que en 2024, en realidad estás ganando menos.</p>
      
      <h2>El miedo a perder clientes</h2>
      <p>Muchos freelancers no suben precios por miedo a que el cliente diga "no". Pero un cliente que no puede pagar lo que vales hoy, es un cliente que frena tu crecimiento.</p>

      <h2>El guion exacto para el email</h2>
      <p>No pidas perdón. Comunica valor. Aquí tienes una estructura probada:</p>
      <blockquote>
        "Hola [Cliente], gracias por confiar en mí este año. Hemos logrado X y Y juntos.<br><br>
        Te escribo para informarte que a partir del 1 de febrero, mis tarifas se ajustarán para reflejar mi experiencia acumulada y mantener la calidad del servicio. El nuevo valor será X.<br><br>
        Estoy emocionado por lo que podemos lograr en esta nueva etapa."
      </blockquote>
      
      <p>Al anticiparte y justificarlo con valor (no con "necesito dinero"), los clientes profesionales lo entenderán. Para los que no, <strong>Nougram te ayuda a calcular cuánto margen necesitas para reemplazarlos con menos esfuerzo.</strong></p>
    `
  },
  {
    slug: 'red-flags-clientes-toxicos',
    title: '5 Red Flags de clientes que arruinarán tu rentabilidad',
    excerpt: 'Aprende a detectar a los clientes "vampiro" antes de firmar el contrato. Tu salud mental (y financiera) te lo agradecerá.',
    date: '2024-01-09',
    author: 'Equipo Nougram',
    tags: ['Salud Mental', 'Gestión', 'Freelance'],
    content: `
      <p>No todo el dinero vale lo mismo. Ganar $1000 con un cliente que te llama a las 10 PM un domingo "cuesta" mucho más que ganarlos con uno que respeta tus tiempos.</p>
      
      <h2>Las señales de alerta (Red Flags)</h2>
      <ol>
        <li><strong>"Es algo sencillito, no te tomará mucho":</strong> Minimiza tu trabajo para pagar menos.</li>
        <li><strong>El regateador serial:</strong> Pide descuento antes de ver la propuesta de valor.</li>
        <li><strong>"Urge para ayer":</strong> Muestra desorganización que se trasladará a tu proyecto.</li>
        <li><strong>Promete "exposición" o "trabajo futuro":</strong> El futuro no paga las facturas de hoy.</li>
        <li><strong>No quiere pagar anticipo:</strong> Si no hay confianza para pagar el 50%, no hay confianza para trabajar.</li>
      </ol>
      
      <h2>Aprende a decir NO</h2>
      <p>Rechazar un mal cliente es tan rentable como cerrar uno bueno. Te deja espacio mental y tiempo para buscar a quienes sí valoran tu trabajo.</p>
    `
  }
];
