export const appConfig = () => ({
  port: Number(process.env.PORT ?? 8000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/kadai_os',
  clientOrigins: (process.env.CLIENT_ORIGINS ?? '*').split(',').map((origin) => origin.trim()),
  swaggerEnabled: process.env.NODE_ENV !== 'production',
});

export type AppConfig = ReturnType<typeof appConfig>;
