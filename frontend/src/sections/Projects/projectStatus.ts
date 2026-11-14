import type { ProjectStatus } from '@/types/content'

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  'in-development': 'In development',
  completed: 'Completed',
  planned: 'Planned',
}
