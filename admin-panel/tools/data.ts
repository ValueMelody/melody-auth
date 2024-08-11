import { typeTool } from 'tools'

export const isSystem = (name: string) => Object.values(typeTool.Scope).some((scope) => scope === name)
