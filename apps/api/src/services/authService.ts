import { prisma } from '@edu-platforma/database'
import bcrypt from 'bcryptjs'
import { AppError } from '../middleware/errorHandler'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'
import { UserRole } from '@prisma/client'

interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: UserRole
}

interface LoginData {
  email: string
  password: string
}

export class AuthService {
  async register(data: RegisterData) {
    const { email, password, firstName, lastName, role = UserRole.LEARNER } = data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    })

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user,
      accessToken,
      refreshToken,
    }
  }

  async login(data: LoginData) {
    const { email, password } = data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      throw new AppError(401, 'Invalid credentials')
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials')
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        role: true,
        profession: true,
        organization: true,
        totalPoints: true,
        level: true,
        currentStreak: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return user
  }
}

export const authService = new AuthService()
