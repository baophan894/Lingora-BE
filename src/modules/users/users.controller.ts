import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from './../email/email.service';
import { RolesGuard } from './../auth/guards/roles.guard';
// src/user/user.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Inject, NotFoundException, BadRequestException, Query } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './users.service';
import { User } from 'next-auth';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesEnum } from 'src/enums/roles..enum';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRepository } from '@repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';
import { ForgotPasswordDto } from './dto/forgot-password.dto.ts';
import { ResetPasswordDto } from './dto/reset-password.dto';
@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('token')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService
  ) { }

  //@UseGuards(JwtAccessTokenGuard)
  //@Roles(RolesEnum.ADMIN)
  @Get()
  async getAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const user = await this.userRepository.findOne({ where: { emailVerificationToken: token } });
    if (!user) throw new BadRequestException('Token không hợp lệ');
    user.isVerified = true;
    user.emailVerificationToken = null;
    await this.userRepository.update(user.id, user);
    return { message: 'Email đã được xác thực thành công' };
  }


  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const { email } = body;
    const user = await this.userRepository.findOne({ email });

    if (!user) throw new NotFoundException('Email không tồn tại');

    const token = uuidv4();
    console.log('token',token)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ
   
    await this.userRepository.update(user.id, user);
    await this.emailService.sendResetPassword(user.email, token);

    return { message: 'Đã gửi mail đặt lại mật khẩu' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const { token, newPassword } = body;
    console.log('body',body);
    const user = await this.userRepository.findOne({ resetPasswordToken: token });
    if (!user || new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Token hết hạn hoặc không hợp lệ');
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.update(user.id, user);
    return { message: 'Đặt lại mật khẩu thành công' };
  }



  @Get(':id')
  async getOne(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Post('create')
  async create(@Body() user: CreateUserDto): Promise<User> {
    return this.userService.create(user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() user: UpdateUserDto): Promise<User> {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<User> {
    return this.userService.delete(id);
  }
}
