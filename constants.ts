export const TRANSLATIONS = {
  es: {
    brand: "Nougram",
    header: {
      cta: "Acceso Beta"
    },
    hero: {
      tag: "ACCESO BETA LIMITADO",
      headline: "Cobra mejor tus servicios: Cotizador de precios para servicios con base en conocimientos y experiencia",
      subheadline: "Nougram es el Cotizador de Machine Learning diseñado para consultores, diseñadores, fotógrafos y líderes de marketing que convierte tu know-how en una cotización precisa y rentable, permitiéndote concentrarte en lo que mejor sabes hacer.",
      stats: {
        accuracy: { val: 98, label: "Precisión" },
        savings: { val: 50, label: "Ahorro" },
        margin: { val: 35, label: "Margen" }
      },
      badges: {
        realData: "Datos Reales",
        private: "100% Privado",
        ml: "Machine Learning"
      },
      form: {
        title: "Asegura tu lugar",
        subtitle: "Únete a la lista de espera exclusiva.",
        placeholders: {
          name: "Tu Nombre",
          profession: "Tu Profesión",
          phone: "Tu Teléfono",
          email: "tu@email.com"
        },
        whatsapp: "Acepto ser agregado al grupo de WhatsApp de Nougram para recibir actualizaciones.",
        cta: "Obtener Acceso Anticipado",
        subtext: "Sin Spam • Acceso Gratuito • Cupos Limitados",
        loading: "Enviando...",
        success: "¡Gracias!",
        errors: {
          email: "Correo inválido",
          required: "Por favor, ingresa un correo válido.",
          generic: "Hubo un error al enviar tus datos. Por favor intenta de nuevo.",
          connection: "Hubo un error de conexión. Por favor intenta de nuevo."
        }
      }
    },
    targetAudience: [
      {
        title: "Consultores",
        description: "Estrategia & Negocios"
      },
      {
        title: "Diseñadores",
        description: "UX/UI, Gráfico & Web"
      },
      {
        title: "Fotógrafos",
        description: "Editorial & Comercial"
      },
      {
        title: "Líderes de Marketing",
        description: "Growth & Contenido"
      }
    ],
    problem: {
      card: {
        tag: "El Ciclo de la Duda",
        text: "¿Cuanto cobro? ¿Es mucho? ¿Es muy poco?",
        calculating: "Calculando horas manuales...",
        quote: "\"Pasas más tiempo cotizando que creando.\""
      },
      tag: "El Problema",
      title: "Cuando la Pasión No Paga: El Alto Precio de la Incertidumbre",
      description: "Eres un experto en tu campo: creas código, diseñas experiencias, asesoras estrategias. Pero cuando llega el momento de cobrar, esa experiencia se reduce a una conjetura ansiosa. La estimación manual te roba tiempo y te deja vulnerable, preguntándote: “¿Es suficiente lo que pido? ¿Estoy dejando dinero sobre la mesa?”",
      implication: "La realidad es que la estimación imprecisa no solo reduce tu margen de ganancia; te obliga a desviar tu energía creativa del proyecto para convertirte en un contador manual. Es hora de detener el ciclo de incertidumbre financiera y recuperar tu enfoque."
    },
    solution: {
      tag: "La Solución",
      headline: "Nougram: El Único Cotizador de IA que Entiende el Valor de lo Intangible",
      subheadline: "Te damos el cotizador para que cobres sin disculpas. Nougram utiliza Machine Learning para analizar el valor de tus recursos, la complejidad de tus servicios y el contexto del mercado.",
      targetText: "La herramienta definitiva para",
      targetRoles: "consultores, diseñadores, fotógrafos y líderes de marketing",
      benefits: [
        {
          title: "Cobra con Confianza (Y Cifras Reales)",
          description: "Elimina el miedo a subcotizar. Presenta propuestas con la autoridad de un cálculo respaldado por IA."
        },
        {
          title: "Recupera tu Enfoque Creativo",
          description: "Deja que la IA se encargue de la matemática y dedica tu tiempo y energía a crear valor para tus clientes."
        },
        {
          title: "Intercambia Conocimiento con Expertos",
          description: "Accede a un círculo selecto de Beta testers para intercambiar consejos y experiencias sobre cómo maximizar la rentabilidad."
        }
      ]
    },
    pricing: {
      title: "Planes Flexibles para Cada Etapa",
      subtitle: "Desde freelancers que inician hasta grandes organizaciones, tenemos un plan que se adapta a tus necesidades.",
      labels: {
        limits: "Límites",
        includes: "Incluye",
        popular: "Más Popular",
        contact: "Contactar"
      },
      plans: [
        {
          name: "Plan Free",
          price: "$0",
          period: "USD",
          description: "Ideal para usuarios individuales que quieren probar el cotizador",
          limits: [
            "1 usuario",
            "5 cotizaciones",
            "10 servicios",
            "3 miembros del equipo",
            "10 créditos/mes"
          ],
          features: [
            "Generación básica de propuestas",
            "Exportación a PDF",
            "Funciones básicas"
          ],
          cta: "Empezar Gratis",
          popular: false
        },
        {
          name: "Plan Starter",
          price: "$29.99",
          period: "USD/mes",
          annualPrice: "$299.99 USD/año",
          description: "Ideal para equipos pequeños que están comenzando",
          limits: [
            "5 usuarios",
            "25 cotizaciones",
            "50 servicios",
            "10 miembros del equipo",
            "100 créditos/mes"
          ],
          features: [
            "Todo lo del plan Free",
            "Generación avanzada de propuestas",
            "Exportación PDF y DOCX",
            "Envío de propuestas por email",
            "Analytics básicos"
          ],
          cta: "Comenzar Starter",
          popular: true
        },
        {
          name: "Plan Professional",
          price: "$99.99",
          period: "USD/mes",
          annualPrice: "$999.99 USD/año",
          description: "Ideal para agencias en crecimiento y equipos medianos",
          limits: [
            "20 usuarios",
            "100 cotizaciones",
            "200 servicios",
            "50 miembros del equipo",
            "500 créditos/mes"
          ],
          features: [
            "Todo lo del plan Starter",
            "Analytics avanzados",
            "Plantillas personalizadas",
            "Soporte prioritario"
          ],
          cta: "Obtener Professional",
          popular: false
        },
        {
          name: "Plan Enterprise",
          price: "Contactar",
          period: "",
          description: "Ideal para grandes organizaciones con necesidades específicas",
          limits: [
            "Usuarios ilimitados",
            "Cotizaciones ilimitadas",
            "Servicios ilimitados",
            "Miembros ilimitados",
            "Créditos ilimitados"
          ],
          features: [
            "Todo lo del plan Professional",
            "Soporte dedicado",
            "Integraciones personalizadas",
            "SLA garantizado",
            "Despliegue on-premise"
          ],
          cta: "Contactar Ventas",
          popular: false
        }
      ]
    },
    credibility: {
      title: "Tu Experiencia es Nuestro Dato. Nuestra Precisión es tu Autoridad.",
      techTitle: "Fundamento Tecnológico",
      tech: "Nuestro modelo se valida con los datos de proyectos reales y está diseñado por profesionales que han vivido la frustración de la estimación manual.",
      valueTitle: "Valor Mutuo",
      value: "Al participar en la Beta, nos estás dando la información necesaria para crear un modelo de Machine Learning que garantice que, a partir de ahora, el valor de tu know-how se refleje siempre en el precio.",
      terminal: {
        line1: "analyzing_market_data...",
        line2: "loading_user_expertise... [OK]",
        line3: "optimizing_pricing_strategy...",
        result: "> Recomendación Generada: Margen +35%"
      }
    },
    faq: {
      title: "Tu Decisión es Coherente con la Excelencia",
      subtitle: "Resuelve tus dudas y únete sin riesgo.",
      questions: [
        {
          question: "¿Qué tan preciso será el modelo Beta?",
          answer: "La precisión es nuestro propósito. Tu participación es clave para validarla y entrenarla. Estamos buscando a quienes puedan darnos los datos reales necesarios para crear el modelo más preciso del mercado."
        },
        {
          question: "¿Qué compromiso de tiempo se requiere de mi parte?",
          answer: "Entendemos que el tiempo es dinero. Solo te pediremos un breve feedback cualitativo sobre cómo el cotizador se compara con tu proceso actual. El objetivo es que Nougram te haga ganar tiempo, no perderlo."
        },
        {
          question: "¿Tiene algún costo unirse a la Beta?",
          answer: "El acceso a esta fase inicial es completamente gratuito. Tu know-how y tu propósito son tu moneda de cambio. Lo único que te pedimos es la valentía de unirte a los líderes que están definiendo el futuro."
        }
      ],
      guaranteeTitle: "Garantía Cero Riesgo",
      guaranteeText: "El acceso a la Beta es completamente gratuito. Lo único que te pedimos es la valentía de unirte a los líderes que están definiendo el futuro."
    },
    finalCta: {
      title: "Es Hora de que tu Talento Reciba la Recompensa que Merece.",
      description: "El futuro no espera. Deja de malgastar horas en hojas de cálculo y asume el control de tu rentabilidad. Únete a la Beta de Nougram para que el único cálculo que te preocupe sea la fecha de inicio de tu próximo proyecto.",
      button: "Sí, Quiero Cobrar lo Justo y Enfocarme en Mi Trabajo",
      footer: {
        rights: "Todos los derechos reservados.",
        privacy: "Privacidad",
        terms: "Términos",
        contact: "Contacto"
      }
    },
    countdown: {
      label: "Acceso gratuito en:",
      days: "Días",
      hours: "Hrs",
      minutes: "Min",
      seconds: "Seg",
      cta: "Registrarme"
    },
    feedbackModal: {
      initial: {
        title: "¡Gracias por unirte!",
        text: "Este registro tiene como objetivo que puedas tener acceso preferencial al Cotizador Nougram a cambio de tu feedback sincero.",
        question: "¿Estarías dispuesto a darnos tu opinión?",
        decline: "No, gracias",
        accept: "Sí, cuenta conmigo"
      },
      accepted: {
        title: "¡Gracias!",
        text: "Te contactaremos pronto para conocer tu opinión."
      },
      declined: {
        text: "Ya estás agregado a nuestra lista de espera."
      }
    }
  },
  en: {
    brand: "Nougram",
    header: {
      cta: "Beta Access"
    },
    hero: {
      tag: "LIMITED BETA ACCESS",
      headline: "Price your services better: Pricing Quoter based on knowledge and experience",
      subheadline: "Nougram is the Machine Learning Quoter designed for consultants, designers, photographers, and marketing leaders that turns your know-how into a precise and profitable quote, allowing you to focus on what you do best.",
      stats: {
        accuracy: { val: 98, label: "Accuracy" },
        savings: { val: 50, label: "Savings" },
        margin: { val: 35, label: "Margin" }
      },
      badges: {
        realData: "Real Data",
        private: "100% Private",
        ml: "Machine Learning"
      },
      form: {
        title: "Secure your spot",
        subtitle: "Join the exclusive waitlist.",
        placeholders: {
          name: "Your Name",
          profession: "Your Profession",
          phone: "Your Phone",
          email: "you@email.com"
        },
        whatsapp: "I agree to be added to the Nougram WhatsApp group to receive updates.",
        cta: "Get Early Access",
        subtext: "No Spam • Free Access • Limited Spots",
        loading: "Sending...",
        success: "Thank you!",
        errors: {
          email: "Invalid email",
          required: "Please enter a valid email.",
          generic: "There was an error sending your data. Please try again.",
          connection: "Connection error. Please try again."
        }
      }
    },
    targetAudience: [
      {
        title: "Consultants",
        description: "Strategy & Business"
      },
      {
        title: "Designers",
        description: "UX/UI, Graphic & Web"
      },
      {
        title: "Photographers",
        description: "Editorial & Commercial"
      },
      {
        title: "Marketing Leaders",
        description: "Growth & Content"
      }
    ],
    problem: {
      card: {
        tag: "The Doubt Cycle",
        text: "How much do I charge? Is it too much? Is it too little?",
        calculating: "Calculating manual hours...",
        quote: "\"You spend more time quoting than creating.\""
      },
      tag: "The Problem",
      title: "When Passion Doesn't Pay: The High Price of Uncertainty",
      description: "You are an expert in your field: you create code, design experiences, advise strategies. But when it comes time to charge, that experience is reduced to an anxious guess. Manual estimation steals your time and leaves you vulnerable, wondering: “Is what I ask enough? Am I leaving money on the table?”",
      implication: "The reality is that imprecise estimation not only reduces your profit margin; it forces you to divert your creative energy from the project to become a manual accountant. It is time to stop the cycle of financial uncertainty and regain your focus."
    },
    solution: {
      tag: "The Solution",
      headline: "Nougram: The Only AI Quoter that Understands the Value of the Intangible",
      subheadline: "We give you the quoter so you can charge without apologies. Nougram uses Machine Learning to analyze the value of your resources, the complexity of your services, and the market context.",
      targetText: "The definitive tool for",
      targetRoles: "consultants, designers, photographers, and marketing leaders",
      benefits: [
        {
          title: "Charge with Confidence (And Real Figures)",
          description: "Eliminate the fear of underquoting. Present proposals with the authority of a calculation backed by AI."
        },
        {
          title: "Recover your Creative Focus",
          description: "Let AI take care of the math and dedicate your time and energy to creating value for your clients."
        },
        {
          title: "Exchange Knowledge with Experts",
          description: "Access a select circle of Beta testers to exchange tips and experiences on how to maximize profitability."
        }
      ]
    },
    pricing: {
      title: "Flexible Plans for Every Stage",
      subtitle: "From freelancers starting out to large organizations, we have a plan that fits your needs.",
      labels: {
        limits: "Limits",
        includes: "Includes",
        popular: "Most Popular",
        contact: "Contact"
      },
      plans: [
        {
          name: "Free Plan",
          price: "$0",
          period: "USD",
          description: "Ideal for individual users who want to try the quoter",
          limits: [
            "1 user",
            "5 quotes",
            "10 services",
            "3 team members",
            "10 credits/mo"
          ],
          features: [
            "Basic proposal generation",
            "Export to PDF",
            "Basic features"
          ],
          cta: "Start Free",
          popular: false
        },
        {
          name: "Starter Plan",
          price: "$29.99",
          period: "USD/mo",
          annualPrice: "$299.99 USD/yr",
          description: "Ideal for small teams just starting out",
          limits: [
            "5 users",
            "25 quotes",
            "50 services",
            "10 team members",
            "100 credits/mo"
          ],
          features: [
            "Everything in Free plan",
            "Advanced proposal generation",
            "Export PDF and DOCX",
            "Send proposals via email",
            "Basic analytics"
          ],
          cta: "Start Starter",
          popular: true
        },
        {
          name: "Professional Plan",
          price: "$99.99",
          period: "USD/mo",
          annualPrice: "$999.99 USD/yr",
          description: "Ideal for growing agencies and medium teams",
          limits: [
            "20 users",
            "100 quotes",
            "200 services",
            "50 team members",
            "500 credits/mo"
          ],
          features: [
            "Everything in Starter plan",
            "Advanced analytics",
            "Custom templates",
            "Priority support"
          ],
          cta: "Get Professional",
          popular: false
        },
        {
          name: "Enterprise Plan",
          price: "Contact",
          period: "",
          description: "Ideal for large organizations with specific needs",
          limits: [
            "Unlimited users",
            "Unlimited quotes",
            "Unlimited services",
            "Unlimited members",
            "Unlimited credits"
          ],
          features: [
            "Everything in Professional plan",
            "Dedicated support",
            "Custom integrations",
            "Guaranteed SLA",
            "On-premise deployment"
          ],
          cta: "Contact Sales",
          popular: false
        }
      ]
    },
    credibility: {
      title: "Your Experience is Our Data. Our Precision is your Authority.",
      techTitle: "Technological Foundation",
      tech: "Our model is validated with real project data and designed by professionals who have lived the frustration of manual estimation.",
      valueTitle: "Mutual Value",
      value: "By participating in the Beta, you are giving us the information needed to create a Machine Learning model that ensures that, from now on, the value of your know-how is always reflected in the price.",
      terminal: {
        line1: "analyzing_market_data...",
        line2: "loading_user_expertise... [OK]",
        line3: "optimizing_pricing_strategy...",
        result: "> Recommendation Generated: Margin +35%"
      }
    },
    faq: {
      title: "Your Decision is Consistent with Excellence",
      subtitle: "Resolve your doubts and join without risk.",
      questions: [
        {
          question: "How accurate will the Beta model be?",
          answer: "Accuracy is our purpose. Your participation is key to validating and training it. We are looking for those who can give us the real data needed to create the most accurate model on the market."
        },
        {
          question: "What time commitment is required from me?",
          answer: "We understand that time is money. We will only ask for brief qualitative feedback on how the quoter compares to your current process. The goal is for Nougram to make you gain time, not lose it."
        },
        {
          question: "Is there any cost to join the Beta?",
          answer: "Access to this initial phase is completely free. Your know-how and your purpose are your currency. The only thing we ask is the courage to join the leaders who are defining the future."
        }
      ],
      guaranteeTitle: "Zero Risk Guarantee",
      guaranteeText: "Access to the Beta is completely free. The only thing we ask is the courage to join the leaders who are defining the future."
    },
    finalCta: {
      title: "It's Time for Your Talent to Receive the Reward it Deserves.",
      description: "The future doesn't wait. Stop wasting hours in spreadsheets and take control of your profitability. Join the Nougram Beta so the only calculation you worry about is the start date of your next project.",
      button: "Yes, I Want to Charge Fairly and Focus on My Work",
      footer: {
        rights: "All rights reserved.",
        privacy: "Privacy",
        terms: "Terms",
        contact: "Contact"
      }
    },
    countdown: {
      label: "Free access in:",
      days: "Days",
      hours: "Hrs",
      minutes: "Min",
      seconds: "Sec",
      cta: "Register"
    },
    feedbackModal: {
      initial: {
        title: "Thanks for joining!",
        text: "This registration aims to give you preferential access to the Nougram Quoter in exchange for your honest feedback.",
        question: "Would you be willing to give us your opinion?",
        decline: "No, thanks",
        accept: "Yes, count me in"
      },
      accepted: {
        title: "Thank you!",
        text: "We will contact you soon to hear your opinion."
      },
      declined: {
        text: "You are already added to our waitlist."
      }
    }
  }
};

export const COPY = TRANSLATIONS.es; // Backwards compatibility if needed, but we will remove usage