import { Router, Response } from "express";
import { db } from "../lib/db";
import { authenticateToken, AuthRequest } from "../lib/auth";
import { z } from "zod";

const router = Router();

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1, "نام تیم الزامی است"),
  description: z.string().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

// Create team (only for business users)
router.post("/create", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Check if user has business subscription
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { ownedTeam: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "کاربر یافت نشد"
      });
    }

    if (user.subscriptionType !== "BUSINESS") {
      return res.status(403).json({
        success: false,
        message: "برای ایجاد تیم، باید اشتراک کسب‌وکار داشته باشید"
      });
    }

    if (user.ownedTeam) {
      return res.status(400).json({
        success: false,
        message: "شما قبلاً تیمی ایجاد کرده‌اید"
      });
    }

    const validation = createTeamSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "داده‌های ورودی نامعتبر",
        errors: validation.error.issues.map(issue => ({
          field: issue.path[0],
          message: issue.message
        }))
      });
    }

    const { name, description } = validation.data;

    // Create team
    const team = await db.team.create({
      data: {
        name,
        description,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    // Update user's teamId
    await db.user.update({
      where: { id: userId },
      data: { teamId: team.id }
    });

    // Create owner membership
    await db.teamMembership.create({
      data: {
        teamId: team.id,
        userId: userId,
        role: "OWNER",
        joinedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: "تیم با موفقیت ایجاد شد",
      data: { team }
    });

  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در ایجاد تیم"
    });
  }
});

// Get team info
router.get("/info", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        team: {
          include: {
            owner: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            members: {
              select: {
                id: true,
                fullName: true,
                email: true,
                createdAt: true
              }
            },
            memberships: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user?.team) {
      return res.json({
        success: true,
        data: { team: null }
      });
    }

    res.json({
      success: true,
      data: { team: user.team }
    });

  } catch (error) {
    console.error("Get team info error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت اطلاعات تیم"
    });
  }
});

// Invite member to team
router.post("/invite", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Check if user is team owner or admin
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        team: true,
        teamMemberships: {
          where: { isActive: true }
        }
      }
    });

    if (!user?.team) {
      return res.status(404).json({
        success: false,
        message: "شما عضو هیچ تیمی نیستید"
      });
    }

    const membership = user.teamMemberships.find(m => m.teamId === user.team!.id);
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: "فقط مالک یا ادمین تیم می‌تواند اعضا دعوت کند"
      });
    }

    const validation = inviteMemberSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "داده‌های ورودی نامعتبر",
        errors: validation.error.issues.map(issue => ({
          field: issue.path[0],
          message: issue.message
        }))
      });
    }

    const { email, role } = validation.data;

    // Check if user exists
    let targetUser = await db.user.findUnique({
      where: { email }
    });

    // If user doesn't exist, create a placeholder
    if (!targetUser) {
      // For now, we'll create the user with a temporary password
      // In real implementation, this would send an invitation email
      const tempPassword = Math.random().toString(36).substring(2, 15);
      
      targetUser = await db.user.create({
        data: {
          email,
          fullName: `کاربر دعوت شده (${email})`,
          password: tempPassword, // This would be hashed in real implementation
          teamId: user.team.id
        }
      });
    } else {
      // Update existing user's team
      await db.user.update({
        where: { id: targetUser.id },
        data: { teamId: user.team.id }
      });
    }

    // Check if already a member
    const existingMembership = await db.teamMembership.findUnique({
      where: {
        teamId_userId: {
          teamId: user.team.id,
          userId: targetUser.id
        }
      }
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: "این کاربر قبلاً عضو تیم است"
      });
    }

    // Create membership
    const membership_new = await db.teamMembership.create({
      data: {
        teamId: user.team.id,
        userId: targetUser.id,
        role: role as any,
        joinedAt: targetUser.password ? new Date() : null // If user existed, they're already joined
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: "ع��و با موفقیت به تیم اضافه شد",
      data: { membership: membership_new }
    });

  } catch (error) {
    console.error("Invite member error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دعوت عضو"
    });
  }
});

// Get team events (for team members)
router.get("/events", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { team: true }
    });

    if (!user?.team) {
      return res.status(404).json({
        success: false,
        message: "شما عضو هیچ تیمی نیستید"
      });
    }

    // Get all events from team members
    const events = await db.event.findMany({
      where: {
        user: {
          teamId: user.team.id
        },
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        reminders: {
          orderBy: { daysBefore: "asc" }
        }
      },
      orderBy: { eventDate: "asc" }
    });

    res.json({
      success: true,
      data: { events }
    });

  } catch (error) {
    console.error("Get team events error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت رویدادهای تیم"
    });
  }
});

// Remove member from team
router.delete("/members/:memberId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { memberId } = req.params;
    
    // Check if user is team owner or admin
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        team: true,
        teamMemberships: {
          where: { isActive: true }
        }
      }
    });

    if (!user?.team) {
      return res.status(404).json({
        success: false,
        message: "شما عضو هیچ تیمی نیستید"
      });
    }

    const membership = user.teamMemberships.find(m => m.teamId === user.team!.id);
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: "فقط مالک یا ادمین تیم می‌تواند اعضا را حذف کند"
      });
    }

    // Can't remove owner
    if (memberId === user.team.ownerId) {
      return res.status(400).json({
        success: false,
        message: "نمی‌توان مالک تیم را حذف کرد"
      });
    }

    // Remove membership and update user's teamId
    await db.$transaction([
      db.teamMembership.delete({
        where: {
          teamId_userId: {
            teamId: user.team.id,
            userId: memberId
          }
        }
      }),
      db.user.update({
        where: { id: memberId },
        data: { teamId: null }
      })
    ]);

    res.json({
      success: true,
      message: "عضو از تیم حذف شد"
    });

  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در حذف عضو"
    });
  }
});

export default router;
