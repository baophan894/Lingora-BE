
import { FilterQuery } from 'mongoose';
import { User } from '../entities/users.entity';


export interface UserRepositoryInterface {
  findAll(): Promise<User[]>;

  findById(id: string): Promise<User | null>;

  create(data: Partial<User>): Promise<User>;

  update(id: string, data: Partial<User>): Promise<User | null>;

  delete(id: string): Promise<User | null>;

  findOne(condition: FilterQuery<User>): Promise<User | null>;

  findOneByCondition(condition: FilterQuery<User>): Promise<User | null>;
}
