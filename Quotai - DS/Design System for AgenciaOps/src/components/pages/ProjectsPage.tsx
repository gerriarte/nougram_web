import { useState } from 'react';
import { Plus, Eye, Pencil, Trash, FolderOpen, MoreHorizontal, Calendar, DollarSign, User } from 'lucide-react';
import { Button } from '../ui/button';
import { StatusBadge } from '../StatusBadge';
import { StatusFilterCard } from '../StatusFilterCard';
import { ViewQuoteDialog } from '../dialogs/ViewQuoteDialog';
import { EditQuoteDialog } from '../dialogs/EditQuoteDialog';
import { mockProjects } from '../../lib/mock-data';
import { Project, ProjectStatus } from '../../lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface ProjectsPageProps {
  onNavigate: (page: string) => void;
}

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'all'>('all');
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Filter projects
  const filteredProjects = selectedStatus === 'all'
    ? projects
    : projects.filter(p => p.status === selectedStatus);

  // Calculate counts
  const statusCounts = {
    all: projects.length,
    draft: projects.filter(p => p.status === 'draft').length,
    sent: projects.filter(p => p.status === 'sent').length,
    won: projects.filter(p => p.status === 'won').length,
    lost: projects.filter(p => p.status === 'lost').length
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setEditProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with New Quote Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-grey-900">All Projects</h2>
          <p className="text-grey-600 mt-1">Manage and track your agency quotes</p>
        </div>
        <Button
          onClick={() => onNavigate('create-quote')}
          className="bg-primary-500 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Quote
        </Button>
      </div>

      {/* Status Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatusFilterCard
          title="All Projects"
          count={statusCounts.all}
          description="Total quotes"
          isActive={selectedStatus === 'all'}
          onClick={() => setSelectedStatus('all')}
        />
        <StatusFilterCard
          title="Draft"
          count={statusCounts.draft}
          description="In progress"
          isActive={selectedStatus === 'draft'}
          onClick={() => setSelectedStatus('draft')}
        />
        <StatusFilterCard
          title="Sent"
          count={statusCounts.sent}
          description="Awaiting response"
          isActive={selectedStatus === 'sent'}
          onClick={() => setSelectedStatus('sent')}
        />
        <StatusFilterCard
          title="Won"
          count={statusCounts.won}
          description="Accepted"
          isActive={selectedStatus === 'won'}
          onClick={() => setSelectedStatus('won')}
        />
        <StatusFilterCard
          title="Lost"
          count={statusCounts.lost}
          description="Declined"
          isActive={selectedStatus === 'lost'}
          onClick={() => setSelectedStatus('lost')}
        />
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-grey-200 overflow-hidden shadow-sm">
        {filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-grey-50 border-b border-grey-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-grey-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-grey-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-grey-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-grey-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-grey-500 uppercase tracking-wider">Margin</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-grey-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-grey-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-grey-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                          <FolderOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-grey-900">{project.name}</p>
                          <p className="text-xs text-grey-500">ID: {project.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-grey-100 flex items-center justify-center text-grey-500">
                          <User className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-sm text-grey-900">{project.client}</p>
                          {project.clientEmail && (
                            <p className="text-xs text-grey-500">{project.clientEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-grey-400" />
                        <div>
                          <p className="text-sm font-medium text-grey-900">${project.total.toLocaleString()}</p>
                          <p className="text-xs text-grey-500">{project.currency}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${project.margin >= 40
                              ? 'bg-success-50 text-success-700'
                              : project.margin >= 30
                                ? 'bg-warning-50 text-warning-700'
                                : 'bg-error-50 text-error-700'
                            }`}
                        >
                          {project.margin}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-grey-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-sm">{formatDate(project.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-grey-500 hover:text-primary-600 hover:bg-primary-50"
                          onClick={() => setViewProject(project)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-grey-500 hover:text-primary-600 hover:bg-primary-50"
                          onClick={() => setEditProject(project)}
                          title="Edit Quote"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-grey-500 hover:text-error-600 hover:bg-error-50"
                          onClick={() => handleDeleteProject(project.id)}
                          title="Delete Quote"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-grey-100 mb-4">
              <FolderOpen className="w-8 h-8 text-grey-400" />
            </div>
            <h3 className="text-grey-900 mb-2">No projects found</h3>
            <p className="text-grey-600 mb-6">
              {selectedStatus === 'all'
                ? "You haven't created any projects yet"
                : `No projects with status "${selectedStatus}"`}
            </p>
            {selectedStatus === 'all' && (
              <Button
                onClick={() => onNavigate('create-quote')}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {viewProject && (
        <ViewQuoteDialog
          project={viewProject}
          isOpen={!!viewProject}
          onClose={() => setViewProject(null)}
          onEdit={() => setEditProject(viewProject)}
        />
      )}

      {editProject && (
        <EditQuoteDialog
          project={editProject}
          isOpen={!!editProject}
          onClose={() => setEditProject(null)}
          onSave={handleUpdateProject}
        />
      )}
    </div>
  );
}
