jest.mock('gsap', () => ({ gsap: { fromTo: jest.fn(), to: jest.fn() } }))

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs'
import { gsap } from 'gsap'

describe('Tabs', () => {
  it('animates content on mount', () => {
    const spy = jest.spyOn(gsap, 'fromTo')
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
        <TabsContent value="two">Second</TabsContent>
      </Tabs>
    )
    expect(spy).toHaveBeenCalled()
  })
})
