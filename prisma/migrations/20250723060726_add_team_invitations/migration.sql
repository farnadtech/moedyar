-- CreateTable
CREATE TABLE "team_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "inviteToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "team_invitations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "team_invitations_inviteToken_key" ON "team_invitations"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "team_invitations_teamId_email_key" ON "team_invitations"("teamId", "email");
