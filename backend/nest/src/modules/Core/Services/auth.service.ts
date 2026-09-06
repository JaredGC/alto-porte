import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@User/Entities/user.entitiy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.validateLogin(email, password);
    if (!user) throw new UnauthorizedException('Usuario o contraseña inválidos');

    const accessToken = user.access_token;
    if ((!accessToken)) {
      throw new UnauthorizedException('El usuario no posee acceso a esta app');
    }

    const role = user.role;

    if (!role) {
      throw new UnauthorizedException('El usuario no posee ningún rol');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      access_token: accessToken,
    };
  }

  private async validateLogin(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email }, relations: { role: true } });
    if(!user) return null;

    let hash = user.password;
    if (hash.startsWith('$2y$')) {hash = '$2b$' + hash.substring(4);}

    const validPassword = await bcrypt.compare(password, hash);

    if(!validPassword) return null;

    return user;
  }
}
