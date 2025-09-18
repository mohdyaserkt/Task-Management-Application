const cookieOptions = {
  httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  // domain: process.env.COOKIE_DOMAIN || 'localhost',
  path: '/'
};

const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000 
};

const refreshTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000 
};

export {
  cookieOptions,
  accessTokenCookieOptions,
  refreshTokenCookieOptions
};