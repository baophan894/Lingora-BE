import { IsString, IsNumber, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateCheckoutSessionDto {
	@IsString()
	@IsNotEmpty()
	registrationId: string;

	@IsString()
	@IsNotEmpty()
	studentId: string;

	@IsNumber()
	@IsNotEmpty()
	amount: number;

	@IsString()
	@IsNotEmpty()
	courseName: string;

	@IsUrl()
	@IsNotEmpty()
	successUrl: string;

	@IsUrl()
	@IsNotEmpty()
	cancelUrl: string;
}
