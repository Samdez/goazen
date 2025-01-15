import { isAdmin, isAdminFieldLevel } from '@/app/(payload)/access/isAdmin'
import { isAdminOrSelf } from '@/app/(payload)/access/isAdminOrSelf'
import { CollectionConfig } from 'payload'

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Only admins can create users
    create: isAdmin,
    // Admins can read all, but any other logged in user can only read themselves
    read: isAdminOrSelf,
    // Admins can update all, but any other logged in user can only update themselves
    update: isAdmin,
    // Only admins can delete
    delete: isAdmin,
  },
  fields: [
    {
      name: 'roles',
      // Save this field to JWT so we can use from `req.user`
      saveToJWT: true,
      type: 'select',
      hasMany: true,
      defaultValue: ['editor'],
      access: {
        // Only admins can create or update a value for this field
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
      ],
    },
    {
      name: 'locations',
      // Save this field to JWT so we can use from `req.user`
      saveToJWT: true,
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      access: {
        // Only admins can create or update a value for this field
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      admin: {
        condition: ({ roles }) => roles && !roles.includes('admin'),
        description: 'This field sets which sites that this user has access to.',
      },
    },
  ],
}

export default Users
