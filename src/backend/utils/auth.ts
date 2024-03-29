import type e from 'express'
import crypto from 'crypto'
import sessionStore, { SessionStore } from '../services/sessionStore'
import log from '../utils/logging'
import { REDIS_PREFIX } from '../constants/environments'

export function generateSessionId(req: e.Request) {
  const sessionId = crypto.randomUUID()
  log.debug(`Create session ${sessionId}`)

  // If the request has the user profile, then record the Signon userId
  // against the sessionId for lookup when destroying sessions through the
  // /reauth endpoint.
  if (req.user) {
    log.debug('User found on request')
    const { uid: userId } = (req.user as any)?.profileData?.user || {}
    log.debug(`Creating session ${sessionId} for user ${userId}`)
    ;(sessionStore as SessionStore).addSessionToUserSet(userId, sessionId)
  }

  return sessionId
}

export function getBearerToken(req: e.Request) {
  const authHeader = req.headers.authorization
  const prefix = 'Bearer '
  if (authHeader && authHeader.startsWith(prefix)) {
    const token = authHeader.substring(prefix.length)
    return token
  }
  return null
}
export const makeSessionSetKey = (userId: string) =>
  `${REDIS_PREFIX.SESSIONS_SET}${userId}`
export const makeSessionKey = (userId: string) =>
  `${REDIS_PREFIX.SESSION}${userId}`
