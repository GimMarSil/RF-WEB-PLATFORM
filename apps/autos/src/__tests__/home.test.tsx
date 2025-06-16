import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Autos Home', () => {
  it('shows Example Button', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: 'Example Button' })).toBeInTheDocument()
  })
})
