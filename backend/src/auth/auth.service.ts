import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _pw, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: { id: number; username: string; role: string; departmentId?: number }) {
    const payload = { sub: user.id, username: user.username, role: user.role, departmentId: user.departmentId };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
