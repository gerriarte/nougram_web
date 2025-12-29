/**
 * Centralized messages and constants
 * Avoid hardcoding strings throughout the application
 */

export const MESSAGES = {
  // Success messages
  success: {
    serviceCreated: "Servicio creado exitosamente",
    serviceUpdated: "Servicio actualizado exitosamente",
    serviceDeleted: "Servicio eliminado exitosamente",
    costCreated: "Costo fijo creado exitosamente",
    costUpdated: "Costo fijo actualizado exitosamente",
    costDeleted: "Costo fijo eliminado exitosamente",
    teamMemberCreated: "Miembro del equipo creado exitosamente",
    teamMemberUpdated: "Miembro del equipo actualizado exitosamente",
    teamMemberDeleted: "Miembro del equipo eliminado exitosamente",
    currencyUpdated: "Configuración de moneda actualizada exitosamente",
    projectCreated: "Proyecto y cotización creados exitosamente",
    projectUpdated: "Proyecto actualizado exitosamente",
    projectDeleted: "Proyecto eliminado exitosamente",
  },
  
  // Error messages
  error: {
    serviceCreate: "Error al crear el servicio",
    serviceUpdate: "Error al actualizar el servicio",
    serviceDelete: "Error al eliminar el servicio",
    serviceLoad: "Error al cargar los servicios",
    costCreate: "Error al crear el costo fijo",
    costUpdate: "Error al actualizar el costo fijo",
    costDelete: "Error al eliminar el costo fijo",
    costLoad: "Error al cargar los costos fijos",
    teamMemberCreate: "Error al crear el miembro del equipo",
    teamMemberUpdate: "Error al actualizar el miembro del equipo",
    teamMemberDelete: "Error al eliminar el miembro del equipo",
    teamMemberLoad: "Error al cargar los miembros del equipo",
    projectCreate: "Error al crear el proyecto",
    projectUpdate: "Error al actualizar el proyecto",
    projectDelete: "Error al eliminar el proyecto",
    projectLoad: "Error al cargar los proyectos",
    unauthorized: "No autorizado. Por favor, inicia sesión nuevamente.",
    networkError: "Error de red. Por favor, verifica tu conexión.",
    unknownError: "Ocurrió un error inesperado",
  },
  
  // Confirmation messages
  confirm: {
    deleteService: "¿Estás seguro de que deseas eliminar este servicio?",
    deleteCost: "¿Estás seguro de que deseas eliminar este costo fijo?",
    deleteTeamMember: "¿Estás seguro de que deseas eliminar este miembro del equipo?",
    deleteProject: "¿Estás seguro de que deseas eliminar este proyecto? Esto también eliminará todas las cotizaciones asociadas.",
  },
  
  // Validation messages
  validation: {
    nameRequired: "El nombre es requerido",
    amountPositive: "El monto debe ser positivo",
    marginRange: "El margen debe estar entre 0 y 1",
    hoursRange: "Las horas deben estar entre 1 y 80",
    currencyInvalid: "Por favor, selecciona una moneda válida",
    categoryRequired: "La categoría es requerida",
    roleRequired: "El rol es requerido",
  },
  
  // Loading messages
  loading: {
    creating: "Creando...",
    updating: "Actualizando...",
    deleting: "Eliminando...",
    loading: "Cargando...",
    saving: "Guardando...",
  },
  
  // Button labels
  buttons: {
    addService: "Agregar Servicio",
    saveChanges: "Guardar Cambios",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    addCost: "Agregar Costo",
    addMember: "Agregar Miembro",
  },
  
  // Empty states
  empty: {
    noServices: "Aún no hay servicios configurados. Haz clic en \"Agregar Servicio\" para comenzar.",
    noCosts: "Aún no hay costos fijos configurados. Haz clic en \"Agregar Costo\" para comenzar.",
    noTeamMembers: "Aún no hay miembros del equipo configurados. Haz clic en \"Agregar Miembro\" para comenzar.",
    noProjects: "Aún no hay proyectos. Haz clic en \"Nueva Cotización\" para crear tu primera cotización.",
  },
} as const;

export type MessageKey = keyof typeof MESSAGES;
export type SuccessMessageKey = keyof typeof MESSAGES.success;
export type ErrorMessageKey = keyof typeof MESSAGES.error;
export type ConfirmMessageKey = keyof typeof MESSAGES.confirm;

