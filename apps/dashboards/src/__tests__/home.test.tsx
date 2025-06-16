import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Dashboards Home', () => {
  it('shows Dashboards app text', () => {
    render(<Home />)
    expect(screen.getByText('Dashboards app')).toBeInTheDocument()
  })
})
