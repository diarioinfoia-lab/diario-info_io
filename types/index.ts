export interface Article {
  _id: string
  title: string
  subtitle?: string
  content?: string
  summary?: string
  image?: string
  category?: Category
  author?: User
  createdAt: string
  updatedAt: string
  slug?: string
  tags?: string[]
  isPublished?: boolean
  views?: number
  audioUrl?: string
}

export interface Category {
  _id: string
  name: string
  slug?: string
  color?: string
  icon?: string
  order?: number
}

export interface User {
  _id: string
  name?: string
  firstName?: string
  lastName?: string
  email: string
  role?: string
  avatar?: string
  token?: string
}

export interface Block {
  _id: string
  template: string
  articles?: Article[]
  ad?: string
  order?: number
  category?: Category
}

export interface Playlist {
  _id: string
  name: string
  articles?: Article[]
}