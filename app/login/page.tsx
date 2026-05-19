'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard since authentication is disabled
    router.replace('/dashboard')
  }, [router])

  return null
}
