// src/user/user.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Req, UseInterceptors, UploadedFile} from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from './users.service';
import { User } from 'next-auth';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDTO } from './dto/change-password';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../configs/multer.config';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {  }

  @Get()
  async getAll(): Promise<User[]> {
    return this.userService.findAll();
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
    @Req() req: any, // Use standard Request type
  ): Promise<void> {
    return this.userService.changePassword(req.user.userId, changePasswordDto);
  }


  @Put(':id')
  async update(@Param('id') id: string, @Body() user: UpdateUserDto): Promise<User> {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<User> {
    return this.userService.delete(id);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
   async updateAvatar(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<User> {
    return this.userService.updateAvatar(id, file);
  }


}
