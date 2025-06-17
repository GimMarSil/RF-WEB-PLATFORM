jest.mock('gsap', () => ({ gsap: { fromTo: jest.fn(), to: jest.fn() } }))

import { render } from '@testing-library/react'
import { AppCard } from '../app-card'
import { gsap } from 'gsap'

jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }))

describe('AppCard', () => {
  it('animates on mount', () => {
    const spy = jest.spyOn(gsap, 'fromTo')
    render(<AppCard title="Test" description="desc" href="/" />)
    expect(spy).toHaveBeenCalled()
  })
})
