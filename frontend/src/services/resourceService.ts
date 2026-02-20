import { apiGet, getToken, ApiError } from '@/lib/api-client';
import { TeamMemberMock, ResourceAllocation } from '@/types/quote-builder';

function mapBackendToMember(row: { id: number; name: string; role: string; billable_hours_per_week?: number }): TeamMemberMock {
  const hoursPerWeek = row.billable_hours_per_week ?? 32;
  const weeksPerYear = 52 - 4;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    availableHours: hoursPerWeek * 4.33 * 12,
  };
}

export const resourceService = {
  getAllMembers: async (): Promise<TeamMemberMock[]> => {
    if (!getToken()) return [];
    try {
      const res = await apiGet<{ items: Array<{ id: number; name: string; role: string; billable_hours_per_week?: number }>; total?: number }>(
        '/settings/team?page_size=100'
      );
      const items = res?.items ?? [];
      return items.map(mapBackendToMember);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return [];
      console.error('resourceService.getAllMembers', e);
      return [];
    }
  },

  getMemberById: async (id: number): Promise<TeamMemberMock | undefined> => {
    const all = await resourceService.getAllMembers();
    return all.find((m) => m.id === id);
  },

  calculateUtilization: (member: TeamMemberMock, allAllocations: ResourceAllocation[]) => {
    const used = allAllocations
      .filter((a) => a.teamMemberId === member.id)
      .reduce((sum, a) => sum + a.hours, 0);
    const percentage = member.availableHours > 0 ? (used / member.availableHours) * 100 : 0;
    return {
      capacity: member.availableHours,
      used,
      percentage,
      remaining: member.availableHours - used,
    };
  },
};
