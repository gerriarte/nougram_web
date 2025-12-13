/**
 * Centralized messages and constants
 * Avoid hardcoding strings throughout the application
 */

export const MESSAGES = {
  // Success messages
  success: {
    serviceCreated: "Service created successfully",
    serviceUpdated: "Service updated successfully",
    serviceDeleted: "Service deleted successfully",
    costCreated: "Fixed cost created successfully",
    costUpdated: "Fixed cost updated successfully",
    costDeleted: "Fixed cost deleted successfully",
    teamMemberCreated: "Team member created successfully",
    teamMemberUpdated: "Team member updated successfully",
    teamMemberDeleted: "Team member deleted successfully",
    currencyUpdated: "Currency settings updated successfully",
    projectCreated: "Project and quote created successfully",
    projectUpdated: "Project updated successfully",
    projectDeleted: "Project deleted successfully",
  },
  
  // Error messages
  error: {
    serviceCreate: "Failed to create service",
    serviceUpdate: "Failed to update service",
    serviceDelete: "Failed to delete service",
    serviceLoad: "Failed to load services",
    costCreate: "Failed to create fixed cost",
    costUpdate: "Failed to update fixed cost",
    costDelete: "Failed to delete fixed cost",
    costLoad: "Failed to load fixed costs",
    teamMemberCreate: "Failed to create team member",
    teamMemberUpdate: "Failed to update team member",
    teamMemberDelete: "Failed to delete team member",
    teamMemberLoad: "Failed to load team members",
    projectCreate: "Failed to create project",
    projectUpdate: "Failed to update project",
    projectDelete: "Failed to delete project",
    projectLoad: "Failed to load projects",
    unauthorized: "Unauthorized. Please login again.",
    networkError: "Network error. Please check your connection.",
    unknownError: "An unexpected error occurred",
  },
  
  // Confirmation messages
  confirm: {
    deleteService: "Are you sure you want to delete this service?",
    deleteCost: "Are you sure you want to delete this fixed cost?",
    deleteTeamMember: "Are you sure you want to delete this team member?",
    deleteProject: "Are you sure you want to delete this project? This will also delete all associated quotes.",
  },
  
  // Validation messages
  validation: {
    nameRequired: "Name is required",
    amountPositive: "Amount must be positive",
    marginRange: "Margin must be between 0 and 1",
    hoursRange: "Hours must be between 1 and 80",
    currencyInvalid: "Please select a valid currency",
    categoryRequired: "Category is required",
    roleRequired: "Role is required",
  },
  
  // Loading messages
  loading: {
    creating: "Creating...",
    updating: "Updating...",
    deleting: "Deleting...",
    loading: "Loading...",
    saving: "Saving...",
  },
  
  // Button labels
  buttons: {
    addService: "Add Service",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    addCost: "Add Cost",
    addMember: "Add Member",
  },
  
  // Empty states
  empty: {
    noServices: "No services configured yet. Click \"Add Service\" to get started.",
    noCosts: "No fixed costs configured yet. Click \"Add Cost\" to get started.",
    noTeamMembers: "No team members configured yet. Click \"Add Member\" to get started.",
    noProjects: "No projects yet. Click \"New Quote\" to create your first quote.",
  },
} as const;

export type MessageKey = keyof typeof MESSAGES;
export type SuccessMessageKey = keyof typeof MESSAGES.success;
export type ErrorMessageKey = keyof typeof MESSAGES.error;
export type ConfirmMessageKey = keyof typeof MESSAGES.confirm;

