import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { CreateCheckoutSessionDto } from '../payments/dto/create-checkout-session.dto';

@Controller('registrations')
export class RegistrationController {
	constructor(private readonly service: RegistrationService) {}

	// @UseGuards(JwtAccessTokenGuard)
	@Post()
	async register(@Body() dto: CreateRegistrationDto, @Req() req) {
		return this.service.createRegistration("683d6af0ecdb305f0b9fdba7", dto.classId);
	}

	@UseGuards(JwtAccessTokenGuard)
	@Get('/student')
	async getStudentRegistrations(@Req() req) {
		return this.service.getStudentRegistrations(req.user.userId);
	}

	@UseGuards(JwtAccessTokenGuard)
	@Post('/payment-session')
	async createPaymentSession(
		@Body() dto: CreateCheckoutSessionDto,
		@Req() req,
	) {
		return this.service.createPaymentSession(
			dto.registrationId,
			dto.amount,
			req.user.email,
			dto.courseName,
		);
	}
}
