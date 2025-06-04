import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from '../email/email.service';
import { RolesGuard } from '../auth/guards/roles.guard';
// src/user/user.controller.ts
import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Put,
	Delete,
	UseGuards,
	Inject,
	NotFoundException,
	BadRequestException,
	Query,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ApiBearerAuth } from '@nestjs/swagger';

import {
	Req,
	UseInterceptors,
	UploadedFile,
	UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

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

import { ChangePasswordDTO } from './dto/change-password';

import { AuthGuard } from '@nestjs/passport';
import {
	FileFieldsInterceptor,
	FileInterceptor,
} from '@nestjs/platform-express';
import { multerConfig } from '../../configs/multer.config';

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

  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Get()
  async getAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const user = await this.userRepository.findOne({ emailVerificationToken: token });
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
    console.log('token', token)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    await this.userRepository.update(user.id, user);
    await this.emailService.sendResetPassword(user.email, token);

    return { message: 'Đã gửi mail đặt lại mật khẩu' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const { token, newPassword } = body;
    console.log('body', body);
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

  @UseGuards(JwtAccessTokenGuard)
  @Get('get-profile')
  async getProfile(@Req() req: any,): Promise<User> {
    //console.log('req.user',req.user);
    return this.userService.findById(req.user.userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }



  @Post('create')
  async create(@Body() user: CreateUserDto): Promise<User> {
    return this.userService.create(user);
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDTO,
    @Req() req: any,
  ): Promise<void> {
    return this.userService.changePassword(req.user.userId, changePasswordDto);
  }


  @Delete(':id')
  async delete(@Param('id') id: string): Promise<User> {
    return this.userService.delete(id);
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'avatar', maxCount: 1 }
  ]))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() user: UpdateUserDto,
    @UploadedFiles() files: { avatar?: Express.Multer.File[] }
  ): Promise<User> {
    const avatarFile = files?.avatar?.[0];
    return this.userService.update(id, user, avatarFile);
  }


}
