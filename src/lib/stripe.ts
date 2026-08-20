import Stripe from 'stripe'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_build_placeholder',
  {
    apiVersion: '2025-02-24.acacia' as any,
    appInfo: {
      name: 'dev-kit.tech',
      version: '1.0.0',
      url: 'https://dev-kit.tech',
    },
  }
)


export type PlanKey = 'starter' | 'power' | 'pro_pack' | 'pro_subscription'

export interface PlanConfig {
  id: PlanKey
  name: string
  badge?: string
  credits: number // -1 means unlimited
  type: 'one_time' | 'recurring'
  description: string
  features: string[]
  usd: {
    priceId: string
    amount: number
    formatted: string
  }
  brl: {
    priceId: string
    amount: number
    formatted: string
  }
}

export const STRIPE_PLANS: Record<PlanKey, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    type: 'one_time',
    description: 'Great for quick tasks, bug fixes, and occasional AI reviews.',
    features: [
      '+50 AI Generation Credits',
      'Never expires',
      'AI Code Reviewer & Analyzer',
      'AI Code Generator',
      'AI SQL Query Generator',
    ],
    usd: {
      priceId: 'price_1U6YgGPgXV6U3mPU9JJ8xNZd',
      amount: 2.99,
      formatted: '$2.99',
    },
    brl: {
      priceId: 'price_1U6YgsPgXV6U3mPUndm6hNOT',
      amount: 14.90,
      formatted: 'R$ 14,90',
    },
  },
  power: {
    id: 'power',
    name: 'Power Pack',
    badge: 'Most Popular',
    credits: 250,
    type: 'one_time',
    description: 'Perfect for active developers, freelancers, and weekly workflows.',
    features: [
      '+250 AI Generation Credits',
      'Never expires',
      'Priority AI speed',
      'AI Code Reviewer & Analyzer',
      'AI Code Generator',
      'AI SQL Query Generator',
    ],
    usd: {
      priceId: 'price_1U6YgQPgXV6U3mPUsThFUQtF',
      amount: 9.99,
      formatted: '$9.99',
    },
    brl: {
      priceId: 'price_1U6Yh1PgXV6U3mPUSqDGbMwg',
      amount: 49.90,
      formatted: 'R$ 49,90',
    },
  },
  pro_pack: {
    id: 'pro_pack',
    name: 'Pro Pack',
    badge: 'Best Value',
    credits: 1000,
    type: 'one_time',
    description: 'Maximum credits for heavy users, teams, and high-frequency development.',
    features: [
      '+1,000 AI Generation Credits',
      'Lowest cost per credit',
      'Never expires',
      'Priority AI model queuing',
      'All present & future AI tools',
    ],
    usd: {
      priceId: 'price_1U6YgYPgXV6U3mPUU0a3OyQJ',
      amount: 19.99,
      formatted: '$19.99',
    },
    brl: {
      priceId: 'price_1U6YhAPgXV6U3mPU8v6UZVOR',
      amount: 99.90,
      formatted: 'R$ 99,90',
    },
  },
  pro_subscription: {
    id: 'pro_subscription',
    name: 'Pro Membership',
    badge: '👑 All-Inclusive',
    credits: -1,
    type: 'recurring',
    description: 'Unlimited access to all developer tools and AI models with zero limits.',
    features: [
      'Unlimited AI Code Reviews',
      'Unlimited AI Code Generations',
      'Unlimited AI SQL Queries',
      '100% Ad-Free Experience',
      '👑 Exclusive Pro Badge in Header',
      'Fastest response latency',
      '1-Click cancellation anytime',
    ],
    usd: {
      priceId: 'price_1U6YghPgXV6U3mPUjciR9I7B',
      amount: 5.99,
      formatted: '$5.99 / mo',
    },
    brl: {
      priceId: 'price_1U6YhOPgXV6U3mPU8RK2DOxC',
      amount: 29.90,
      formatted: 'R$ 29,90 / mês',
    },
  },
}
