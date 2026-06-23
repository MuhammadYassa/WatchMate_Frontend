export interface FieldValidationError {
  field: string | null
  message: string
}

export interface ApiErrorResponse {
  message: string
  code: string
  fields: FieldValidationError[] | null
}

export interface NormalizedApiError {
  status: number
  message: string
  code: string
  fields: FieldValidationError[]
}

export class ApiClientError extends Error implements NormalizedApiError {
  status: number
  code: string
  fields: FieldValidationError[]

  constructor(input: NormalizedApiError) {
    super(input.message)
    this.name = 'ApiClientError'
    this.status = input.status
    this.code = input.code
    this.fields = input.fields
  }
}
