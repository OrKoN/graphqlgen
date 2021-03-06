export interface GraphQLGenDefinition {
  language: Language
  schema: string
  context?: string
  models: { [typeName: string]: string }
  output: string
  ['resolver-scaffolding']?: ResolverScaffolding
}

export type Language = 'typescript'

export interface ResolverScaffolding {
  output: string
  layout: string
}
