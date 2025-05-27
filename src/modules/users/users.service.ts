// src/user/user.service.ts
import * as bcrypt from 'bcryptjs';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@repositories/user.repository';
import { User } from './entities/users.entity';
import { TokenPayload } from '@modules/auth/interfaces/token.interface';
import { JwtService } from '@nestjs/jwt';
import { access_token_private_key, refresh_token_private_key } from 'src/constraints/jwt.constraint';
import { ConfigService } from '@nestjs/config';
import { FilterQuery } from 'mongoose';
import { ChangePasswordDTO } from './dto/change-password';
import { AwsS3Service } from '../../services/aws-s3.service'; 

@Injectable()
export class UserService {

  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepository,
    private readonly jwt_service: JwtService,
    private config_service: ConfigService,
    private awsS3Service: AwsS3Service, //loi o day
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

  async update(id: string, data: Partial<User>, avatarFile?: Express.Multer.File): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let updateData = { ...data };

    // Handle avatar file upload if provided
    if (avatarFile) {
      // Delete old avatar if exists
      if (user.avatarUrl) {
        const oldKey = user.avatarUrl.split('.com/')[1];
        try {
          await this.awsS3Service.deleteObject(oldKey);
        } catch (error) {
          console.warn('Failed to delete old avatar:', error);
        }
      }

      // Upload new avatar to S3
      const avatarUrl = await this.awsS3Service.uploadACLImage({
        buffer: avatarFile.buffer,
        mimetype: avatarFile.mimetype,
        originalname: avatarFile.originalname,
        encoding: avatarFile.encoding,
        fieldname: avatarFile.fieldname,
        size: avatarFile.size,
      });

      updateData.avatarUrl = avatarUrl;
    }

    const updated = await this.userRepository.update(id, updateData);
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

  async changePassword(userId: string, dto: ChangePasswordDTO): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      dto.old_password,
      user.passwordHash,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    // Check if new passwords match
    if (dto.new_password !== dto.confirm_password) {
      throw new BadRequestException('New passwords do not match');
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(dto.new_password, 10);
    await this.userRepository.update(userId, { passwordHash: hashedPassword });
  }


  async updateAvatar(id: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists
    if (user.avatarUrl) {
      const oldKey = user.avatarUrl.split('.com/')[1];
      await this.awsS3Service.deleteObject(oldKey);
    }

    // Upload new file to S3
    const avatarUrl = await this.awsS3Service.uploadACLImage({
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
      encoding: file.encoding,
      fieldname: file.fieldname,
      size: file.size,
      //ACL: 'public-read'
    });

    // Update user's avatar URL
    return this.update(id, { avatarUrl });
  }
}