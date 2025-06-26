import { typeTool } from 'tools'

export const isSystemScope = (name: string) => Object.values(typeTool.Scope).some((scope) => scope === name)

export const isSystemRole = (name: string) => name === typeTool.Role.SuperAdmin
