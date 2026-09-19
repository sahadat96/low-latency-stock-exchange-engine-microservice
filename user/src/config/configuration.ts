export default () => ({

  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10), 
  },

  database: {
    url: process.env.DATABASE_URL,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    resetSecret: process.env.JWT_RESET_SECRET, 
    resetExpiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
  },
});