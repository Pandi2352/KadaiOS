const defaultUser = (prefix: string, fallbackName: string) => {
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  return email && password ? { email, password, name: process.env[`${prefix}_NAME`] ?? fallbackName } : null;
};

export const appConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    port: Number(process.env.PORT ?? 8000),
    mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/kadai_os',
    clientOrigins: (process.env.CLIENT_ORIGINS ?? '*').split(',').map((origin) => origin.trim()),
    isProduction,
    swaggerEnabled: !isProduction,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    authRateLimit: Number(process.env.AUTH_RATE_LIMIT ?? 10),
    defaultAdmin: defaultUser('DEFAULT_ADMIN', 'Default Admin'),
    // A test account with a known password has no place in production.
    defaultCustomer: isProduction ? null : defaultUser('DEFAULT_CUSTOMER', 'Test Customer'),
  };
};

export type AppConfig = ReturnType<typeof appConfig>;
