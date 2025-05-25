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

export enum USER_ROLE {
  ADMIN = 'admin',
  STUDENT = 'student',
  TEACHER = 'teacher',
  MANAGER = 'manager',
}

export enum USER_STATUS {
  ACTIVE = 'active',
  LOCKED = 'locked',
}

@Schema({
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: { virtuals: true },
})
export class User extends BaseEntity {


  constructor(user: {
    email: string;
    passwordHash: string;
    googleId?: string;
    role: USER_ROLE;
    fullName: string;
    avatarUrl?: string;
    gender?: GENDER;
    date_of_birth?: Date;
    phone_number?: string;
    address?: string;
    profile?: {
      bio?: string;
      location?: string;
      socialLinks?: {
        facebook?: string;
        linkedin?: string;
      };
    };
    status?: USER_STATUS;
  }) {
    super();
    this.email = user.email;
    this.passwordHash = user.passwordHash;
    this.googleId = user.googleId;
    this.role = user.role;
    this.fullName = user.fullName;
    this.avatarUrl = user.avatarUrl;
    this.gender = user.gender;
    this.date_of_birth = user.date_of_birth;
    this.phone_number = user.phone_number;
    this.address = user.address;
    this.profile = user.profile ?? {};
    this.status = user.status ?? USER_STATUS.ACTIVE;
  }


  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  passwordHash: string;

  @Prop({ default: null })
  googleId?: string;

  @Prop({ enum: USER_ROLE, required: true })
  role: USER_ROLE;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ default: null })
  avatarUrl?: string;

  @Prop({ enum: GENDER, default: null })
  gender?: GENDER;

  @Prop({ default: null })
  date_of_birth?: Date;

  @Prop({ default: null })
  phone_number?: string;

  @Prop({ default: null })
  address?: string;

  @Prop({
    type: {
      bio: { type: String, default: null },
      location: { type: String, default: null },
      socialLinks: {
        facebook: { type: String, default: null },
        linkedin: { type: String, default: null },
      },
    },
    default: {},
  })
  profile: {
    bio?: string;
    location?: string;
    socialLinks?: {
      facebook?: string;
      linkedin?: string;
    };
  };

  @Prop({ enum: USER_STATUS, default: USER_STATUS.ACTIVE })
  status: USER_STATUS;

  @Prop()
  @Exclude()
  current_refresh_token?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = () => {
  const schema = UserSchema;
  UserSchema.index({ username: 1 }, { unique: true }); // đang lỗi vì username không tồn tại
  UserSchema.set('autoIndex', false);
  schema.pre('findOneAndDelete', async function (next: NextFunction) {
    const user = await this.model.findOne(this.getFilter());
    await Promise.all([]);
    return next();
  });
  return schema;
};
