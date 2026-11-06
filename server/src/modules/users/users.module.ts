import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordService } from '../auth/password.service.js';
import { DefaultUsersService } from './default-users.service.js';
import { ProfileController } from './profile.controller.js';
import { ProfileService } from './profile.service.js';
import { User, UserSchema } from './user.schema.js';
import { UsersRepository } from './users.repository.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [ProfileController],
  providers: [UsersRepository, PasswordService, DefaultUsersService, ProfileService],
  exports: [UsersRepository, PasswordService],
})
export class UsersModule {}
