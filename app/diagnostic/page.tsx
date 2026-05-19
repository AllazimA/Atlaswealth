'use client'

import React, { useEffect, useState } from 'react'

export default function DiagnosticPage() {
  const [config, setConfig] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
    setConfig(firebaseConfig)
  }, [])

  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
  const missingKeys = requiredKeys.filter(key => !config[key])
  const envVarNames = {
    apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
  }

  return (
    <main className="bg-navy-900 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🔍 Firebase Diagnostic</h1>

        {missingKeys.length === 0 ? (
          <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 mb-8">
            <p className="text-lg font-semibold">✅ All Firebase environment variables are configured!</p>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 mb-8">
            <p className="text-lg font-semibold text-red-400 mb-4">
              ❌ Missing {missingKeys.length} environment variable{missingKeys.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-2">
              {missingKeys.map((key) => (
                <div key={key} className="text-red-300 font-mono text-sm">
                  • {envVarNames[key as keyof typeof envVarNames]}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-navy-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Configuration Status</h2>
          <div className="space-y-3">
            {requiredKeys.map((key) => (
              <div key={key} className="flex items-center justify-between p-4 bg-navy-900 rounded-lg">
                <div className="font-mono text-gray-300">{envVarNames[key as keyof typeof envVarNames]}</div>
                <div className="flex items-center gap-3">
                  {config[key] ? (
                    <>
                      <span className="text-green-400">✓ Configured</span>
                      <span className="text-xs text-gray-500">{config[key]?.substring(0, 20)}...</span>
                    </>
                  ) : (
                    <span className="text-red-400">✗ Missing</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-navy-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">How to Fix</h2>
          <ol className="space-y-4 text-gray-300">
            <li className="flex gap-4">
              <span className="font-bold text-gold-400 flex-shrink-0">1.</span>
              <span>Go to your Vercel dashboard at <a href="https://vercel.com" className="text-gold-400 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a></span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-gold-400 flex-shrink-0">2.</span>
              <span>Select your <strong>atlaswealth-app</strong> project</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-gold-400 flex-shrink-0">3.</span>
              <span>Go to <strong>Settings</strong> → <strong>Environment Variables</strong></span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-gold-400 flex-shrink-0">4.</span>
              <span>Add each missing variable with values from your Firebase project settings</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-gold-400 flex-shrink-0">5.</span>
              <span>Click "Save" and redeploy the application</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-gold-400 flex-shrink-0">6.</span>
              <span>After redeploy, refresh this page to verify all variables are configured</span>
            </li>
          </ol>

          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              <strong>💡 Finding Your Firebase Values:</strong><br/>
              1. Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">Firebase Console</a><br/>
              2. Select project <code>wealthos-cac68</code><br/>
              3. Go to Project Settings (gear icon) → Your apps → Web app<br/>
              4. Copy the configuration object values into Vercel environment variables
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
