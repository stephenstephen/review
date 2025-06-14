import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfigAsync = {
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    const config = {
      type: 'postgres' as const,
      host: configService.get('DB_HOST') ?? 'postgres',
      port: parseInt(configService.get('DB_PORT') ?? '5432', 10),
      username: configService.get('DB_USERNAME') ?? 'admin',
      password: configService.get('DB_PASSWORD') ?? '123456',
      database: configService.get('DB_NAME') ?? 'review-management',
      autoLoadEntities: true,
      synchronize: configService.get('NODE_ENV') === 'development',
      logging: true,
      retryAttempts: 10,
      retryDelay: 3000,
    };
    console.log('Database configuration:', {
      host: config.host,
      port: config.port,
      username: config.username,
      database: config.database,
    });
    return config;
  },
};
