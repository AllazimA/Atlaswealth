import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, serverTimestamp } from 'firebase-admin/firestore'
import { initializeAdminApp } from '@/lib/firebase-admin'

// Initialize Firebase Admin
initializeAdminApp()

export async function GET(request: NextRequest) {
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

    // Fetch virtual portfolios from Firestore
    const db = getFirestore()
    const portfoliosRef = db.collection('virtualPortfolios').doc(userId).collection('portfolios')
    const snapshot = await portfoliosRef.get()

    const portfolios = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ portfolios })
  } catch (error) {
    console.error('Error fetching virtual portfolios:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Create new virtual portfolio in Firestore
    const db = getFirestore()
    const portfolioRef = db
      .collection('virtualPortfolios')
      .doc(userId)
      .collection('portfolios')
      .doc()

    await portfolioRef.set({
      name: body.name || 'New Virtual Portfolio',
      initialCash: body.initialCash || 100000,
      currentCash: body.initialCash || 100000,
      totalValue: body.initialCash || 100000,
      createdAt: serverTimestamp(),
      userId,
      trades: [],
    })

    return NextResponse.json({ id: portfolioRef.id, message: 'Portfolio created' })
  } catch (error) {
    console.error('Error creating virtual portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    )
  }
}
