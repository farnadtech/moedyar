import { Router, Response } from "express";
import { db } from "../lib/db";
import { authenticateToken, AuthRequest } from "../lib/auth";
import { sendTeamInvitationEmail } from "../lib/notifications";
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

// Invite member to team - FIXED VERSION
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
        message: "داده‌های ��رودی نامعتبر",
        errors: validation.error.issues.map(issue => ({
          field: issue.path[0],
          message: issue.message
        }))
      });
    }

    const { email, role } = validation.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // User exists - add them directly to team
      
      // Check if already a member
      const existingMembership = await db.teamMembership.findUnique({
        where: {
          teamId_userId: {
            teamId: user.team.id,
            userId: existingUser.id
          }
        }
      });

      if (existingMembership) {
        return res.status(400).json({
          success: false,
          message: "این کاربر قبلاً عضو تیم است"
        });
      }

      // Update user's teamId and create membership
      await db.$transaction([
        db.user.update({
          where: { id: existingUser.id },
          data: { teamId: user.team.id }
        }),
        db.teamMembership.create({
          data: {
            teamId: user.team.id,
            userId: existingUser.id,
            role: role as any,
            joinedAt: new Date() // Existing user joins immediately
          }
        })
      ]);

      res.json({
        success: true,
        message: "کاربر با موفقیت به تیم اضافه شد",
        data: { 
          type: "direct_add",
          user: {
            id: existingUser.id,
            fullName: existingUser.fullName,
            email: existingUser.email
          }
        }
      });

    } else {
      // User doesn't exist - create invitation instead of placeholder user

      // Check if invitation already exists
      const existingInvitation = await db.teamInvitation.findUnique({
        where: {
          teamId_email: {
            teamId: user.team.id,
            email: email
          }
        }
      });

      let invitation;

      if (existingInvitation) {
        // Update existing invitation with new token and expiration
        const inviteToken = Math.random().toString(36).substring(2, 15) +
                           Math.random().toString(36).substring(2, 15);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

        invitation = await db.teamInvitation.update({
          where: { id: existingInvitation.id },
          data: {
            role: role as any,
            inviteToken,
            expiresAt,
            isAccepted: false // Reset acceptance status
          },
          include: {
            team: {
              select: {
                name: true,
                owner: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        });

        console.log("Updated existing invitation for:", email);
      } else {
        // Create new invitation
        const inviteToken = Math.random().toString(36).substring(2, 15) +
                           Math.random().toString(36).substring(2, 15);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

        invitation = await db.teamInvitation.create({
          data: {
            teamId: user.team.id,
            email: email,
            role: role as any,
            inviteToken,
            expiresAt
          },
          include: {
            team: {
              select: {
                name: true,
                owner: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        });

        console.log("Created new invitation for:", email);
      }

      // Send invitation email
      try {
        const emailSent = await sendTeamInvitationEmail({
          to: invitation.email,
          teamName: invitation.team.name,
          inviterName: invitation.team.owner.fullName,
          inviteToken: invitation.inviteToken,
          expiresAt: invitation.expiresAt
        });

        if (emailSent) {
          console.log("Team invitation email sent successfully to:", email);
        } else {
          console.warn("Failed to send team invitation email to:", email);
        }
      } catch (emailError) {
        console.error("Error sending team invitation email:", emailError);
        // Don't fail the invitation creation if email fails
      }

      res.json({
        success: true,
        message: existingInvitation
          ? "دعوت‌نامه به‌روزرسانی شد و ایمیل جدید ارسال شد"
          : "دعوت‌نامه ایجاد شد و ایمیل ارسال شد",
        data: {
          type: "invitation",
          invitation: {
            email: invitation.email,
            teamName: invitation.team.name,
            inviterName: invitation.team.owner.fullName,
            expiresAt: invitation.expiresAt
          }
        }
      });
    }

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

// Get invitation info by token (for registration page)
router.get("/invitation/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const invitation = await db.teamInvitation.findFirst({
      where: {
        inviteToken: token,
        isAccepted: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        team: {
          select: {
            name: true,
            owner: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "دعوت‌نامه یافت نشد یا منقضی شده است"
      });
    }

    res.json({
      success: true,
      data: {
        email: invitation.email,
        teamName: invitation.team.name,
        inviterName: invitation.team.owner.fullName,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    console.error("Get invitation info error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت اطلاعات دعوت"
    });
  }
});

export default router;
