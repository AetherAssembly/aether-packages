export type ID = string

export type Timestamp = number

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export interface BaseEntity {
  id: ID
  createdAt: Timestamp
  updatedAt: Timestamp
}
