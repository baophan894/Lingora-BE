import { GENDER, USER_ROLE } from '@modules/users/entities/users.entity';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MaxLength(50, { message: 'Tên không được vượt quá 50 ký tự' })
  fullName: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ tại Việt Nam' })
  @Transform(({ value }) => formatPhoneNumber(value))
  phone_number?: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(100, { message: 'Email không được vượt quá 100 ký tự' })
  email: string;

  @IsOptional()
  date_of_birth?: Date;

  @IsOptional()
  avatarUrl?: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: 'Mật khẩu chưa đủ mạnh (ít nhất 6 ký tự, bao gồm chữ hoa, thường, số, ký tự đặc biệt)' },
  )
  password: string;

  @IsOptional()
  @IsEnum(GENDER, { message: 'Giới tính không hợp lệ' })
  gender?: GENDER;

  @IsOptional()
  @IsEnum(USER_ROLE, { message: 'Vai trò không hợp lệ' })
  role?: USER_ROLE;
}

// Format phone number to +84 format
export function formatPhoneNumber(phone: string): string {
  if (!phone) return phone;
  if (phone.startsWith('+84')) return phone;
  if (phone.startsWith('0')) return `+84${phone.slice(1)}`;
  return phone;
}
