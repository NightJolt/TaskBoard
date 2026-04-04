import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from './schemas/user.schema';
import type { UserModel } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: UserModel,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  private async seedAdmin() {
    const email = this.configService.getOrThrow<string>('ADMIN_SEED_EMAIL');
    const existing = await this.findByEmail(email);
    if (existing) return;

    await this.create({
      email,
      password: this.configService.getOrThrow<string>('ADMIN_SEED_PASSWORD'),
      name: 'Admin',
      role: 'admin',
    });
    this.logger.log(`Seeded admin user: ${email}`);
  }
}
