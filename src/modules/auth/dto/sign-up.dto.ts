import { GENDER, USER_ROLE } from '@modules/users/entities/users.entity';
import { Transform } from 'class-transformer';
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsPhoneNumber,
	IsStrongPassword,
	Matches,
	MaxLength,
} from 'class-validator';


export class SignUpDto {


	@IsNotEmpty({ message: 'Tên không được để trống' })
	@MaxLength(50, { message: 'Tên không được vượt quá 50 ký tự' })
	fullName: string;

	@IsOptional()
	@IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ tại Việt Nam' })
	@Transform(({ value }) => formatPhoneNumber(value))
	phone_number?: string;

	@IsNotEmpty({ message: 'Email không được để trống' })
	@IsEmail({}, { message: 'Email không hợp lệ' })
	@MaxLength(100)
	email: string;

	@IsOptional()
	date_of_birth?: Date;

	@IsNotEmpty({ message: 'Mật khẩu không được để trống' })
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


export class SignUpGoogleDto {
	@IsNotEmpty()
	code?: string;

	first_name: string;

	last_name: string;

	email: string;

	avatar?: string;

	@IsOptional()
	@IsEnum(GENDER, { message: 'Giới tính không hợp lệ' })
	gender?: GENDER;

	is_registered_with_google?: boolean;
}
