import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Timesheet Home', () => {
  it('shows Timesheet app text', () => {
    render(<Home />)
    expect(screen.getByText('Timesheet app')).toBeInTheDocument()
  })
})
