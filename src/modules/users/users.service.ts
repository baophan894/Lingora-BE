// src/user/user.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@repositories/user.repository';
import { User } from './entities/users.entity';
import { TokenPayload } from '@modules/auth/interfaces/token.interface';
import { JwtService } from '@nestjs/jwt';
import { access_token_private_key, refresh_token_private_key } from 'src/constraints/jwt.constraint';
import { ConfigService } from '@nestjs/config';
import { FilterQuery } from 'mongoose';


@Injectable()
export class UserService {

  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepository,

    private readonly jwt_service: JwtService,
    private config_service: ConfigService,
  ) { }

  generateAccessToken(payload: TokenPayload) {
    return this.jwt_service.sign(payload, {
      algorithm: 'RS256',
      privateKey: access_token_private_key,
      expiresIn: `${this.config_service.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
  }

  generateRefreshToken(payload: TokenPayload) {
    return this.jwt_service.sign(payload, {
      algorithm: 'RS256',
      privateKey: refresh_token_private_key,
      expiresIn: `${this.config_service.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
  }

  async setCurrentRefreshToken(
    _id: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOneByCondition({ _id });
      if (!user) {
        throw new Error('User not found');
      }
      user.current_refresh_token = refreshToken;
      await this.userRepository.update(_id, {
        current_refresh_token: refreshToken,
      });
    } catch (error) {
      console.error(`Failed to set refresh token for user ${_id}:`, error);
      throw new Error('Failed to set refresh token');
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    return this.userRepository.create(data);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updated = await this.userRepository.update(id, data);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async delete(id: string): Promise<User> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) throw new NotFoundException('User not found');
    return deleted;
  }

  async findOneByCondition(
    condition: FilterQuery<User>,
  ): Promise<User | null> {
    const result = await this.userRepository.findOneByCondition(condition);
    if (!result) {
      throw new NotFoundException(`Admin with ${condition} not found`);
    }
    return result;
  }
}
