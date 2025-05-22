import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Exclude, Expose } from 'class-transformer';
import { BaseEntity } from '@modules/shared/base/base.entity';
import { NextFunction } from 'express';

export type UserDocument = HydratedDocument<User>;

export enum GENDER {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

// Thêm enum role (bạn có thể chỉnh sửa theo nhu cầu)
export enum USER_ROLE {
  ADMIN = 'Admin',
  STUDENT = 'Student',
  CITIZEN = 'Teacher',
  MANAGER = 'Manager',
  // thêm role khác nếu cần
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { getters: true, virtuals: true },
})
export class User extends BaseEntity {
  constructor(data: {
    first_name?: string;
    last_name?: string;
    gender?: GENDER;
    phone_number?: string;
    date_of_birth?: Date;
    password: string;
    username: string;
    email: string;
    isActive?: boolean;
    role?: USER_ROLE;
  }) {
    super();
    this.first_name = data?.first_name;
    this.last_name = data?.last_name;
    this.gender = data?.gender;
    this.phone_number = data?.phone_number;
    this.date_of_birth = data?.date_of_birth;
    this.password = data?.password;
    this.username = data?.username;
    this.email = data?.email;
    this.isActive = data?.isActive ?? true;  // default true
    this.role = data?.role;
  }

  @Prop({ required: true, minlength: 2, maxlength: 60, set: (v: string) => v.trim() })
  first_name: string;

  @Prop({ required: true, minlength: 2, maxlength: 60, set: (v: string) => v.trim() })
  last_name: string;

  @Prop({ match: /^\+84\d{9}$/ })
  phone_number?: string;

  @Prop({
    default: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
  })
  avatar?: string;

  @Prop() date_of_birth?: Date;

  @Prop({ enum: GENDER }) gender: GENDER;

  @Prop() @Exclude() current_refresh_token?: string;

  @Expose({ name: 'full_name' })
  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  @Prop({ required: true, unique: true }) username: string;
  @Prop({ required: true }) password: string;
  @Prop() email: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ enum: USER_ROLE, required: true })
  role: USER_ROLE;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ username: 1 }, { unique: true, background: true });

export const UserSchemaFactory = () => {
  const schema = UserSchema;
  schema.pre('findOneAndDelete', async function (next: NextFunction) {
    const user = await this.model.findOne(this.getFilter());
    await Promise.all([]);
    return next();
  });
  return schema;
};
