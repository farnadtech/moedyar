// This is the fixed invite member endpoint

// Replace the invite member endpoint in teams.ts with this:

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
      // User doesn't exist - create invitation
      
      // Check if invitation already exists
      const existingInvitation = await db.teamInvitation.findUnique({
        where: {
          teamId_email: {
            teamId: user.team.id,
            email: email
          }
        }
      });

      if (existingInvitation) {
        return res.status(400).json({
          success: false,
          message: "این ایمیل قبلاً دعوت شده است"
        });
      }

      // Create invitation
      const inviteToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const invitation = await db.teamInvitation.create({
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

      res.json({
        success: true,
        message: "دعوت‌نامه ایجاد شد. کاربر می‌تواند با این ایمیل ثبت نام کند",
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
