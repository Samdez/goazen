import { Access } from 'payload'

export const isAdminOrHasLocationAccess =
  (path: string): Access =>
  ({ req: { user } }) => {
    if (user) {
      if (user.roles?.includes('admin')) return true
      if (user.roles?.includes('editor') && user.locations?.length && user.locations.length > 0) {
        return {
          or: [
            {
              [path]: {
                in: user.locations.map((loc) => typeof loc !== 'string' && loc.id),
              },
            },
          ],
        }
      }
    }
    return false
  }
