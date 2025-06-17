jest.mock('gsap', () => ({ gsap: { fromTo: jest.fn(), to: jest.fn() } }))

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../tooltip'
import { gsap } from 'gsap'

describe('Tooltip', () => {
  it('shows content on hover', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hint</TooltipTrigger>
          <TooltipContent>More info</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    await userEvent.hover(screen.getByText('Hint'))
    const items = await screen.findAllByText('More info')
    expect(items.length).toBeGreaterThan(0)
  })

  it('animates on open', () => {
    const spy = jest.spyOn(gsap, 'fromTo')
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Tip</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(spy).toHaveBeenCalled()
  })
})
