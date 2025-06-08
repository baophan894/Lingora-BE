import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRegistrationDto {
	@IsString()
	@IsNotEmpty()
	classId: string;
}
