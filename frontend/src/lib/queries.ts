/**
 * TanStack Query hooks for API communication
 * 
 * This file re-exports all hooks from the modular structure in queries/
 * to maintain backward compatibility with existing imports.
 * 
 * New code should import directly from queries/ modules for better tree-shaking.
 */

// Re-export everything from the modular structure
export * from './queries';
