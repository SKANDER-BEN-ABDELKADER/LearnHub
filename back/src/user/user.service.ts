import { DatabaseService } from './../database/database.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    const data: any = { ...createUserDto };
    
    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    return this.databaseService.user.create({
      data,
    })
  }

async findAll(role?: 'STUDENT' | 'INSTRUCTOR') {
  if (role) return this.databaseService.user.findMany({
    where: {
      role: role as Role,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      domain: true,
      experienceLvl: true,
      profilePicUrl: true,
      createdAt: true,
      coursesCreated: {
        select: { id: true }
      },
      coursesEnrolled: {
        select: { id: true }
      },
    }
  }) 
  return this.databaseService.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      domain: true,
      experienceLvl: true,
      profilePicUrl: true,
      createdAt: true,
      coursesCreated: {
        select: { id: true }
      },
      coursesEnrolled: {
        select: { id: true }
      },
    }
  })
}

  async findOne(id: number) {
    return this.databaseService.user.findUnique({
      where: {
        id,
      }
    })
  }

  async update(id: number, updateUserDto: Prisma.UserUpdateInput, profilePic?: Express.Multer.File) {
    const data: any = { ...updateUserDto };
    
    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    if (profilePic) {
      data.profilePicUrl = `/uploads/${profilePic.filename}`;
    }
    return this.databaseService.user.update({
      where: { id },
      data,
    });
  }

async toggleActualRole(id: number) {
  // First, get the current user to check their current role
  const user = await this.databaseService.user.findUnique({
    where: { id },
    select: { actual_role: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Determine the new role by toggling the current one
  const newRole = user.actual_role === Role.STUDENT ? Role.INSTRUCTOR : Role.STUDENT;

  // Update the user with the new role
  return this.databaseService.user.update({
    where: { id },
    data: { actual_role: newRole }
  });
}

  async remove(id: number) {
    return this.databaseService.user.delete({
      where: {
        id,
      }
    })
  }
}
