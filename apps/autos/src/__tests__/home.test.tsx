import { render, screen } from '@testing-library/react'
import Home from '../pages/index'
import { ThemeProvider } from '@RFWebApp/ui'

describe('Autos Home', () => {
  it('shows Example Button', () => {
    render(
      <ThemeProvider>
        <Home />
      </ThemeProvider>
    )
    expect(screen.getByRole('button', { name: 'Example Button' })).toBeInTheDocument()
  })
})
