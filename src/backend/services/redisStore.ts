import { getClient } from './redis'
import RedisStore from 'connect-redis'
import { USER_SESSION_PREFIX, SIGNON_USER_PREFIX } from '../enums/environments'
import type Redis from 'ioredis'

const createRedisStore = () => {
  const store = new RedisStore({
    client: getClient(),
    prefix: USER_SESSION_PREFIX,
  })

  return store
}

let redisStoreInstance: RedisStore

export const getStore = () => {
  if (!redisStoreInstance) {
    redisStoreInstance = createRedisStore()
  }

  return redisStoreInstance
}

// **
// * Below are Redis utils for managing user sessions with the redis store
// **

export class SessionNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SessionNotFound'
  }
}

export const appendSessionToUserId = async (userId: string, sessionId: string) => {
  const redis = getClient();
  try {
    await redis.sadd(`${SIGNON_USER_PREFIX }${userId}`, sessionId);
  } catch (error) {
    console.error(`ERROR - could not append session ${sessionId} to user ${userId}`)
    throw error
  }
  console.log(`Session ${sessionId} appended to user ${userId}`)
}

export const destroySession = async (sessionId: string) => {
  const store = getStore()
  try {
    await store.destroy(sessionId)
  } catch (error) {
    console.error(`ERROR - could not destroy session ${sessionId}`)
    throw error
  }
  console.log(`Session destroyed: ${sessionId}`)
}

export const destroySessions = async (userId: string) => {
  const redis = getClient()
  try {
    let sessionId: string | null
    while (sessionId = await redis.spop(userId)) {
      console.log
      destroySession(sessionId);
    }
  } catch (error) {
    console.error(`ERROR - could not destroy sessions for user ${userId}`)
    throw error
  }
  console.log(`Sessions destroyed for user ${userId}`)
}

export const destroySessionsForUserId = async (userId: string) => {
  console.log(`Destroying sessions for user ${userId}`)
  await destroySessions(`${SIGNON_USER_PREFIX }${userId}`)
}
