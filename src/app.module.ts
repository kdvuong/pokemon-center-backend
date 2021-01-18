import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LocalUsersModule } from './users/local/local-users.module';

@Module({
  imports: [
    LocalUsersModule,
    AuthModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres', // type of our database
      host: process.env.TYPEORM_HOST ?? 'localhost', // database host
      port: parseInt(process.env.TYPEORM_PORT) ?? 5432, // database host
      username: process.env.TYPEORM_USERNAME ?? 'postgres', // username
      password: process.env.TYPEORM_PASSWORD ?? 'Khang99', // user password
      database: process.env.TYPEORM_DATABASE ?? 'pokemon-center', // name of our database,
      autoLoadEntities: true, // models will be loaded automatically (you don't have to explicitly specify the entities: [] array)
      synchronize: process.env.NODE_ENV === 'production' ? false : true, // your entities will be synced with the database (ORM will map entity definitions to corresponding SQL tabled), every time you run the application (recommended: disable in the production)
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
