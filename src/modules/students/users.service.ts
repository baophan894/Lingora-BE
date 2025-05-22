// src/user/user.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@repositories/user.repository';
import { User } from './entities/users.entity';


@Injectable()
export class UserService {

  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepository,
  ) {}

    async setCurrentRefreshToken(
		_id: string,
		refreshToken: string,
	): Promise<void> {
		try {
			const student = await this.userRepository.findOneByCondition({ _id });
			if (!student) {
				throw new Error('User not found');
			}
			student.current_refresh_token = refreshToken;
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

   async findOneByCondition(condition: any, selectFields?: (keyof User)[]): Promise<User | null> {
    return this.userRepository.findOneByCondition({
      where: condition,
      select: selectFields,
    });
  }
}
