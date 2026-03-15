const jwt = require('jsonwebtoken')

const ACCESS_SECRET = process.env.JWT_SECRET || 'fileforge-access-secret-change-in-prod'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fileforge-refresh-secret-change-in-prod'

function signAccess(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })
}

function signRefresh(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })
}

function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET)
}

function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET)
}

function setTokenCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', [
    `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Lax${isProd ? '; Secure' : ''}`,
    `refreshToken=${refreshToken}; HttpOnly; Path=/api/auth/refresh; Max-Age=604800; SameSite=Lax${isProd ? '; Secure' : ''}`,
  ])
}

function clearTokenCookies(res) {
  const isProd = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', [
    `accessToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`,
    `refreshToken=; HttpOnly; Path=/api/auth/refresh; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`,
  ])
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh, setTokenCookies, clearTokenCookies }
