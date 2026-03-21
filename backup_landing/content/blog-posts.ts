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
    slug: 'lanzamiento-beta-nougram-15-marzo',
    title: 'Cuenta Regresiva: Nougram abre sus puertas el 15 de marzo',
    excerpt: 'La espera está por terminar. El próximo 15 de marzo, los primeros usuarios de nuestra waitlist recibirán acceso exclusivo a la herramienta que cambiará su forma de cotizar.',
    content: `
      <p>Marquen sus calendarios. Lo que comenzó como una visión para simplificar la vida de consultores y agencias está a punto de hacerse realidad. El <b>15 de marzo</b>, Nougram lanzará oficialmente su primera versión beta para los miembros de nuestra waitlist.</p>
      
      <h2>¿Qué esperar de esta primera versión?</h2>
      <p>Nos hemos enfocado en resolver el problema raíz: la incertidumbre financiera al enviar una propuesta. En esta beta podrán:</p>
      <ul>
        <li><b>Calculadora de Rentabilidad en Tiempo Real:</b> Sabrás exactamente cuánto dinero queda en tu bolsillo después de impuestos y costos, antes de hacer clic en enviar.</li>
        <li><b>Interfaz Minimalista:</b> Sin distracciones. Un flujo diseñado para que crees propuestas profesionales en minutos, no horas.</li>
        <li><b>Motor de Reglas de Negocio:</b> Configura tus propios márgenes y deja que Nougram te alerte si estás vendiendo por debajo de tu rentabilidad objetivo.</li>
      </ul>

      <blockquote>"No es solo una herramienta de cotización, es el copiloto financiero que siempre quisiste tener en tus ventas."</blockquote>

      <h2>Acceso Escalonado</h2>
      <p>Para garantizar una experiencia fluida y brindar soporte personalizado, daremos acceso de forma escalonada priorizando el orden de registro en nuestra lista de espera. Si aún no te has registrado, este es el momento de hacerlo para asegurar tu lugar en la primera ola de marzo.</p>

      <p>Estamos ansiosos por ver cómo Nougram transformará sus negocios. ¡Nos vemos el 15 de marzo!</p>
    `,
    date: '2026-02-23',
    author: 'Gerencia Nougram',
    image: '/blog/Nougram-launch.jpg',
    category: 'Anuncios',
    readTime: '3 min'
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
