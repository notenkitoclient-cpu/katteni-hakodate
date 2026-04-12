declare namespace NodeJS {
  interface ProcessEnv {
    TURSO_DATABASE_URL?: string
    TURSO_AUTH_TOKEN?: string
    ADMIN_PASSWORD?: string
    NODE_ENV: 'development' | 'production' | 'test'
  }
}
