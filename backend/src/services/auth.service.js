import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt.js';
import { exclude } from '../utils/helpers.js';

const registerUser = async (userData) => {
  const { username, email, password } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email },
        { username: username }
      ]
    }
  });

  if (existingUser) {
    throw new Error('User already exists with this email or username');
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword
    }
  });

  // Generate tokens
  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Remove password from response
  const userWithoutPassword = exclude(user, ['password']);

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
};

const loginUser = async (email, password) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate tokens
  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });


  const userWithoutPassword = exclude(user, ['password']);

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
};

const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = generateAccessToken({ id: user.id });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

const logoutUser = () => {

  return { message: 'Logged out successfully' };
};

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser
};