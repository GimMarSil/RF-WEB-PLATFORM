import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Vendors Home', () => {
  it('shows Vendors app text', () => {
    render(<Home />)
    expect(screen.getByText('Vendors app')).toBeInTheDocument()
  })
})
