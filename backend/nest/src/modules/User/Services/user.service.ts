import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '@User/Entities/user.entitiy';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async getUsers() {
    const users = await this.usersRepo.find();
    return users;
  }


  async getUser(userId: number) {
    if(!userId){
      throw new BadRequestException('id no especificado');
    }
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if(!user){
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async register(data: { email: string; password: string; name: string; role_id?: number }) {
    const { email, password, name, role_id } = data;

    if (!email || !password || !name) {
      throw new BadRequestException('Faltan datos requeridos');
    }

    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const hashed = await bcrypt.hash(password, 10);
    const assignedRoleId = role_id ?? 1;
    const tokenValue = await bcrypt.hash(`${email}-${Date.now()}`, 5);
    const user = await this.usersRepo.save({ email, password: hashed, name, role_id: assignedRoleId, access_token: tokenValue });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: assignedRoleId,
      access_token: user.access_token,
    };
  }

  async registerMany(
    users: Array<{
      email: string;
      password: string;
      name: string;
      role_id: number;
    }>
  ) {
    if (!Array.isArray(users) || users.length === 0) {
      throw new BadRequestException('La lista de usuarios está vacía');
    }

    const emails = users.map(u => u.email);
    const existingUsers = await this.usersRepo.find({
      where: { email: In(emails) },
      select: { email: true },
    });

    const existingEmails = new Set(existingUsers.map(u => u.email));

    const usersToSave: any[] = [];

    for (const data of users) {
      const { email, password, name, role_id } = data;

      if (!email || !password || !name) {
        console.log("omitt: ", data);
        continue;
      }

      if (existingEmails.has(email)) {
        console.log("exists: ", email);
        continue;
      }

      const hashed = await bcrypt.hash(password, 10);
      const tokenValue = await bcrypt.hash(`${email}-${Date.now()}`, 5);

      usersToSave.push({
        email,
        name,
        password: hashed,
        role_id: role_id ?? 4,
        access_token: tokenValue,
      });
    }

    const savedUsers = await this.usersRepo.save(usersToSave);

    return {
      total_received: users.length,
      created: savedUsers.length,
      skipped: users.length - savedUsers.length,
      users: savedUsers.map((u: User) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role_id: u.role_id,
      })),
    };
  }

  async findOrCreate(data: { email: string; name: string; password: string; role_id: number }) {
    const { email, name, role_id } = data;
    if (!email || !name || !data.password) {
      throw new BadRequestException('Faltan datos requeridos');
    }
    const hashedPassoword = bcrypt.hash(data.password, 10);
    let user = await this.usersRepo.findOne({ where: { email } });
    if (user) {
      user.password = await hashedPassoword;
      await this.usersRepo.save(user);
      return {
        found: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          access_token: user.access_token,
        }
      };
    }
    const tokenValue = await bcrypt.hash(`${email}-${Date.now()}`, 5);
    user = await this.usersRepo.save({ email, name, password: await hashedPassoword, role_id: role_id ?? 4, access_token: tokenValue });
    return {
      found: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        access_token: user.access_token,
      }
    };
  }
}
