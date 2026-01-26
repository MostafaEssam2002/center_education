import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if validation succeeds', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashedPassword', role: 'STUDENT' };
      mockUserService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({ id: 1, email: 'test@example.com', role: 'STUDENT' });
    });

    it('should return null if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      // Even if user not found, bcrypt.compare is called with fake hash in the service, so we mock it
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('wrong@example.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password invalid', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      mockUserService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and message', async () => {
      const user = { id: 1, email: 'test@example.com', role: 'STUDENT' };
      const token = 'jwt_token';
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(user);
      expect(result).toEqual({
        message: 'login successfully',
        access_token: token,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ email: user.email, role: user.role, sub: user.id });
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: 1, email: 'test@example.com' }];
      const total = 1;

      // Mock both findMany and count
      (mockPrismaService.user.findMany as jest.Mock).mockResolvedValue(users);
      // We need to add count mock to prisma service mock if it's not already there
      if (!mockPrismaService.user['count']) {
        mockPrismaService.user['count'] = jest.fn();
      }
      (mockPrismaService.user.count as jest.Mock).mockResolvedValue(total);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: users,
        pagination: {
          total,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = { id: 1, email: 'test@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
    });
  });
});
