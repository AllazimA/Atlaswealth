'use client'

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'

let auth: any

export function getAuthInstance() {
  if (typeof window !== 'undefined') {
    if (!auth) {
      auth = getAuth()
    }
    return auth
  }
  return null
}

export async function loginWithEmail(email: string, password: string) {
  const authInstance = getAuthInstance()
  if (!authInstance) throw new Error('Firebase not initialized')
  return signInWithEmailAndPassword(authInstance, email, password)
}

export async function signupWithEmail(email: string, password: string) {
  const authInstance = getAuthInstance()
  if (!authInstance) throw new Error('Firebase not initialized')
  return createUserWithEmailAndPassword(authInstance, email, password)
}

export async function logout() {
  const authInstance = getAuthInstance()
  if (!authInstance) throw new Error('Firebase not initialized')
  return signOut(authInstance)
}

export function getCurrentUser(): User | null {
  const authInstance = getAuthInstance()
  return authInstance?.currentUser || null
}

export function onAuthStateChanged(callback: (user: User | null) => void) {
  const authInstance = getAuthInstance()
  if (!authInstance) return () => {}
  return firebaseOnAuthStateChanged(authInstance, callback)
}

export async function getIdToken(): Promise<string | null> {
  const user = getCurrentUser()
  if (!user) return null
  return user.getIdToken()
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, loading }
}
