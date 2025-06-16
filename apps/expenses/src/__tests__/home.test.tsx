import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Expenses Home', () => {
  it('shows Expenses app text', () => {
    render(<Home />)
    expect(screen.getByText('Expenses app')).toBeInTheDocument()
  })
})
