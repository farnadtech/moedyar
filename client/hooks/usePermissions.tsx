import { useAuth } from "./useAuth";

interface TeamMembership {
  role: string;
  joinedAt: string;
  teamId: string;
}

interface UserWithTeam {
  id: string;
  fullName: string;
  email: string;
  teamId?: string;
  team?: {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
  };
  teamMemberships?: TeamMembership[];
}

export function usePermissions() {
  const { user } = useAuth();
  const typedUser = user as UserWithTeam;

  // Get user's role in their current team
  const getCurrentTeamRole = (): string | null => {
    if (!typedUser?.teamId || !typedUser?.teamMemberships) {
      return null;
    }

    const membership = typedUser.teamMemberships.find(
      m => m.teamId === typedUser.teamId
    );
    
    return membership?.role || null;
  };

  const isTeamOwner = (): boolean => {
    return typedUser?.team?.ownerId === typedUser?.id;
  };

  const isTeamAdmin = (): boolean => {
    const role = getCurrentTeamRole();
    return role === "ADMIN" || isTeamOwner();
  };

  const isTeamMember = (): boolean => {
    const role = getCurrentTeamRole();
    return role === "MEMBER" || isTeamAdmin();
  };

  const isTeamViewer = (): boolean => {
    const role = getCurrentTeamRole();
    return role === "VIEWER";
  };

  const hasTeamAccess = (): boolean => {
    return !!typedUser?.teamId && !!getCurrentTeamRole();
  };

  // Permissions
  const canCreateEvents = (): boolean => {
    if (!hasTeamAccess()) {
      return true; // Personal users can create events
    }
    return !isTeamViewer(); // Team viewers cannot create events
  };

  const canEditEvents = (): boolean => {
    if (!hasTeamAccess()) {
      return true; // Personal users can edit their events
    }
    return !isTeamViewer(); // Team viewers cannot edit events
  };

  const canDeleteEvents = (): boolean => {
    if (!hasTeamAccess()) {
      return true; // Personal users can delete their events
    }
    return !isTeamViewer(); // Team viewers cannot delete events
  };

  const canInviteMembers = (): boolean => {
    return isTeamAdmin();
  };

  const canRemoveMembers = (): boolean => {
    return isTeamAdmin();
  };

  const canManageTeam = (): boolean => {
    return isTeamAdmin();
  };

  const canViewTeamReports = (): boolean => {
    return hasTeamAccess();
  };

  const canExportData = (): boolean => {
    if (!hasTeamAccess()) {
      return true; // Personal users can export their data
    }
    return !isTeamViewer(); // Team viewers cannot export data
  };

  return {
    user: typedUser,
    getCurrentTeamRole,
    isTeamOwner,
    isTeamAdmin,
    isTeamMember,
    isTeamViewer,
    hasTeamAccess,
    canCreateEvents,
    canEditEvents,
    canDeleteEvents,
    canInviteMembers,
    canRemoveMembers,
    canManageTeam,
    canViewTeamReports,
    canExportData,
  };
}
