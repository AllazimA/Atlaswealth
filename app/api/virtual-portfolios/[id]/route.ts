import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeAdminApp } from '@/lib/firebase-admin'

// Initialize Firebase Admin
initializeAdminApp()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get and verify Firebase token
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId: string
    try {
      const decodedToken = await getAuth().verifyIdToken(token)
      userId = decodedToken.uid
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch specific virtual portfolio
    const db = getFirestore()
    const portfolioRef = db
      .collection('virtualPortfolios')
      .doc(userId)
      .collection('portfolios')
      .doc(params.id)

    const portfolioDoc = await portfolioRef.get()

    if (!portfolioDoc.exists) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Fetch holdings
    const holdingsSnapshot = await portfolioRef.collection('holdings').get()
    const holdings = holdingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({
      portfolio: {
        id: portfolioDoc.id,
        ...portfolioDoc.data(),
      },
      holdings,
    })
  } catch (error) {
    console.error('Error fetching virtual portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}
