import type { UserProfile } from "../types";

export function getNextCitizenEmail(
  users: UserProfile[],
  currentTurnEmail: string,
): string {
  const citizens = users.filter((user) => user.role === "Citizen");

  if (citizens.length === 0) return currentTurnEmail;
  if (citizens.length === 1) return citizens[0].email;

  const currentIndex = citizens.findIndex(
    (user) => user.email.toLowerCase() === currentTurnEmail.toLowerCase(),
  );

  if (currentIndex === -1) return citizens[0].email;

  return citizens[(currentIndex + 1) % citizens.length].email;
}
