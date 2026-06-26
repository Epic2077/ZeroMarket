"use client";

import { initialAdmins, initialUsers } from "@/context/adminData";
import type {
  AccountStatus,
  AdminAccount,
  PlatformRole,
  PlatformUser,
  ProfileInput,
} from "@/types/admin";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface AdminContextValue {
  users: PlatformUser[];
  admins: AdminAccount[];
  // Users
  setUserRole: (userId: string, role: PlatformRole) => void;
  setUserStatus: (userId: string, status: AccountStatus) => void;
  updateUserProfile: (userId: string, input: ProfileInput) => void;
  // Admins
  assignUser: (adminId: string, userId: string) => void;
  assignUsers: (adminId: string, userIds: string[]) => void;
  unassignUser: (adminId: string, userId: string) => void;
  createAdmin: (name: string, email: string) => void;
  makeUserAdmin: (userId: string) => void;
  removeAdmin: (adminId: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
  const [admins, setAdmins] = useState<AdminAccount[]>(initialAdmins);

  // Monotonic counter for new admin ids (avoids Math.random / Date in render).
  const adminSeq = useRef(0);
  const newAdminId = () => `adm-new-${(adminSeq.current += 1)}`;

  const mutateUser = useCallback(
    (userId: string, fn: (user: PlatformUser) => PlatformUser) =>
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? fn(user) : user)),
      ),
    [],
  );

  const setUserRole = useCallback(
    (userId: string, role: PlatformRole) =>
      mutateUser(userId, (user) => ({ ...user, role })),
    [mutateUser],
  );

  const setUserStatus = useCallback(
    (userId: string, status: AccountStatus) =>
      mutateUser(userId, (user) => ({ ...user, status })),
    [mutateUser],
  );

  const updateUserProfile = useCallback(
    (userId: string, input: ProfileInput) =>
      mutateUser(userId, (user) => ({ ...user, ...input })),
    [mutateUser],
  );

  const assignUser = useCallback(
    (adminId: string, userId: string) =>
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === adminId && !admin.assignedUserIds.includes(userId)
            ? { ...admin, assignedUserIds: [...admin.assignedUserIds, userId] }
            : admin,
        ),
      ),
    [],
  );

  const assignUsers = useCallback(
    (adminId: string, userIds: string[]) =>
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === adminId
            ? {
                ...admin,
                assignedUserIds: Array.from(
                  new Set([...admin.assignedUserIds, ...userIds]),
                ),
              }
            : admin,
        ),
      ),
    [],
  );

  const unassignUser = useCallback(
    (adminId: string, userId: string) =>
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === adminId
            ? {
                ...admin,
                assignedUserIds: admin.assignedUserIds.filter(
                  (id) => id !== userId,
                ),
              }
            : admin,
        ),
      ),
    [],
  );

  // Initials from a name (first letter of the first two words).
  const initialsOf = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("");

  const createAdmin = useCallback((name: string, email: string) => {
    setAdmins((prev) => [
      ...prev,
      {
        id: newAdminId(),
        name: name.trim(),
        email: email.trim(),
        avatar: initialsOf(name),
        assignedUserIds: [],
      },
    ]);
  }, []);

  // Promote an existing platform user into an admin account.
  const makeUserAdmin = useCallback(
    (userId: string) =>
      setUsers((prevUsers) => {
        const user = prevUsers.find((u) => u.id === userId);
        if (user) {
          setAdmins((prevAdmins) =>
            prevAdmins.some((a) => a.email === user.email)
              ? prevAdmins
              : [
                  ...prevAdmins,
                  {
                    id: newAdminId(),
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    assignedUserIds: [],
                  },
                ],
          );
        }
        return prevUsers;
      }),
    [],
  );

  const removeAdmin = useCallback(
    (adminId: string) =>
      setAdmins((prev) => prev.filter((admin) => admin.id !== adminId)),
    [],
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      users,
      admins,
      setUserRole,
      setUserStatus,
      updateUserProfile,
      assignUser,
      assignUsers,
      unassignUser,
      createAdmin,
      makeUserAdmin,
      removeAdmin,
    }),
    [
      users,
      admins,
      setUserRole,
      setUserStatus,
      updateUserProfile,
      assignUser,
      assignUsers,
      unassignUser,
      createAdmin,
      makeUserAdmin,
      removeAdmin,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within an <AdminProvider>");
  }
  return ctx;
}
