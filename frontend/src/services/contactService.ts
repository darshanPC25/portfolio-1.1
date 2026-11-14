import { z } from 'zod'
import { apiClient } from './apiClient'

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80, 'Name is too long.'),
  email: z.string().trim().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
  subject: z.string().trim().min(3, 'Please add a short subject.').max(120, 'Subject is too long.'),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least a sentence.')
    .max(2000, 'Message is too long (2000 characters maximum).'),
})

export type ContactMessage = z.infer<typeof contactMessageSchema>

/** Endpoint the backend will expose for public contact messages. */
export const CONTACT_ENDPOINT = '/api/public/contact-messages'

export async function sendContactMessage(message: ContactMessage): Promise<void> {
  await apiClient.post(CONTACT_ENDPOINT, message)
}
