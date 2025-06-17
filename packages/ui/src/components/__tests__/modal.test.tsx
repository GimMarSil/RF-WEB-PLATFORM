jest.mock('gsap', () => ({ gsap: { fromTo: jest.fn(), to: jest.fn() } }))

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal, ModalTrigger, ModalContent } from '../modal'
import { gsap } from 'gsap'

jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }))

describe('Modal', () => {
  it('animates when opened', async () => {
    const spy = jest.spyOn(gsap, 'fromTo')
    render(
      <Modal>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>Hi</ModalContent>
      </Modal>
    )
    await userEvent.click(screen.getByText('Open'))
    await screen.findByText('Hi')
    expect(spy).toHaveBeenCalled()
  })
})
