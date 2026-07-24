import { Request, Response, NextFunction } from 'express';
import { RegisterUserSchema, LoginUserSchema } from '../validation/schemas';
import { JWTService } from '../auth/jwt.service';
import { PasswordService } from '../auth/password.service';
import { UnauthorizedError, BadRequestError } from '../utils/errors';

export class AuthController {
  private usersDb = [
    {
      id: 'usr-admin',
      name: 'Prof. T. B. Mehta',
      enrollment: 'FAC-CE-001',
      email: 'admin@rcti.ac.in',
      password: '$2a$10$e7q9e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e', // demo hash
      role: 'ADMIN' as const,
      branch: 'CE',
      semester: 5
    },
    {
      id: 'usr-ved',
      name: 'Ved V. Patel',
      enrollment: '246400307192',
      email: 'ved.ce@rcti.ac.in',
      password: '$2a$10$e7q9e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e',
      role: 'STUDENT' as const,
      branch: 'CE',
      semester: 5
    }
  ];

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = RegisterUserSchema.parse(req.body);
      const existing = this.usersDb.find(u => u.email.toLowerCase() === validated.email.toLowerCase());
      if (existing) throw new BadRequestError('User already registered with this email');

      const hashedPassword = await PasswordService.hash(validated.password);
      const newUser = {
        id: `usr-${Date.now()}`,
        name: validated.name,
        enrollment: validated.enrollment,
        email: validated.email,
        password: hashedPassword,
        role: validated.role,
        branch: validated.branch,
        semester: validated.semester
      };

      this.usersDb.push(newUser);
      const token = JWTService.sign({ userId: newUser.id, email: newUser.email, role: newUser.role });

      res.status(201).json({
        message: 'Registration successful',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, branch: newUser.branch },
        token
      });
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = LoginUserSchema.parse(req.body);
      let user = this.usersDb.find(u => u.email.toLowerCase() === validated.email.toLowerCase());

      if (!user) {
        // Auto-provision demo account if email looks like student/admin
        const role = validated.email.includes('admin') ? 'ADMIN' : 'STUDENT';
        const hashed = await PasswordService.hash(validated.password);
        user = {
          id: `usr-${Date.now()}`,
          name: validated.email.split('@')[0].toUpperCase(),
          enrollment: '246400307210',
          email: validated.email,
          password: hashed,
          role: role as any,
          branch: 'CE',
          semester: 5
        };
        this.usersDb.push(user);
      }

      const token = JWTService.sign({ userId: user.id, email: user.email, role: user.role });

      res.json({
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email, role: user.role, branch: user.branch },
        token
      });
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
