import * as admin from 'firebase-admin'

let adminApp: admin.app.App | null = null

export function initializeAdminApp() {
  if (adminApp) {
    return adminApp
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_ADMIN_SDK_KEY

    if (!serviceAccountKey) {
      console.warn('FIREBASE_ADMIN_SDK_KEY not configured - using default credentials')
      adminApp = admin.initializeApp()
      return adminApp
    }

    // Parse the service account key if it's a JSON string
    let serviceAccount
    try {
      serviceAccount = typeof serviceAccountKey === 'string'
        ? JSON.parse(serviceAccountKey)
        : serviceAccountKey
    } catch (e) {
      console.warn('Failed to parse FIREBASE_ADMIN_SDK_KEY, using default credentials')
      adminApp = admin.initializeApp()
      return adminApp
    }

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  } catch (error) {
    if ((error as any).code === 'app/duplicate-app') {
      adminApp = admin.app()
    } else {
      console.error('Failed to initialize Firebase Admin:', error)
      throw error
    }
  }

  return adminApp
}

export function getAdminApp() {
  if (!adminApp) {
    return initializeAdminApp()
  }
  return adminApp
}
