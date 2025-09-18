import { asyncHandler } from '../utils/helpers.js';
import { 
  registerUser, 
  loginUser, 
  refreshAccessToken, 
  logoutUser 
} from '../services/auth.service.js';
import { 
  accessTokenCookieOptions, 
  refreshTokenCookieOptions 
} from '../config/cookies.js';

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  // Set cookies
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUser(
    req.body.email,
    req.body.password
  );

  // Set cookies
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user
    }
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'No refresh token provided'
    });
  }

  const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);

  // Set new cookies
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully'
  });
});

const logout = asyncHandler(async (req, res) => {
  const result = logoutUser();

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: result.message
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

export {
  register,
  login,
  refresh,
  logout,
  getMe
};