import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, UseGuards, UseInterceptors, UploadedFile, Request, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Public endpoint to get instructors
  @Get('instructors')
  getInstructors() {
    return this.userService.findAll('INSTRUCTOR');
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@Query('role') role?: 'STUDENT' | 'INSTRUCTOR') {
    return this.userService.findAll(role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req: any) {
    // Users can view any profile (their own or others)
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profilePic', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateUserDto: Prisma.UserUpdateInput,
    @UploadedFile() profilePic?: Express.Multer.File
  ) {
    // Check if user is updating their own profile or is an admin
    if (req.user.role !== 'ADMIN' && req.user.id !== +id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.userService.update(+id, updateUserDto, profilePic);
  }

  @Patch(':id/toggle-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR')
  @HttpCode(200)
  async updateActualRole(@Param('id') id: string, @Request() req) {
    // Ensure users can only toggle their own role
    if (req.user.id !== +id) {
      throw new ForbiddenException('You can only toggle your own role');
    }
    return this.userService.toggleActualRole(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
