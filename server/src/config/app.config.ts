export const appConfig = () => ({
  port: Number(process.env.PORT ?? 8000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/kadai_os',
  clientOrigins: (process.env.CLIENT_ORIGINS ?? 'http://localhost:3000,http://localhost:3001').split(','),
});

export type AppConfig = ReturnType<typeof appConfig>;
