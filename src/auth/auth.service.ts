import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        private jwtService: JwtService
    ) { }

    async register(user: RegisterAuthDto) {
        const { email, phone } = user;

        const emailExist = await this.usersRepository.findOneBy({ email });

        if (emailExist) throw new HttpException('El email ya está registrado', HttpStatus.CONFLICT);

        const phoneExist = await this.usersRepository.findOneBy({ phone });

        if (phoneExist) throw new HttpException('El telefono ya está reegistrado', HttpStatus.CONFLICT);

        const newUser = this.usersRepository.create(user);

        return this.usersRepository.save(newUser);
    }

    async login(login: LoginAuthDto) {
        const { email, password } = login;

        const userFound = await this.usersRepository.findOneBy({ email });

        if (!userFound)
            return new HttpException('El email no existe', HttpStatus.NOT_FOUND);

        const isPasswordValid = await compare(password, userFound.password);

        if (!isPasswordValid)
            return new HttpException('No tiene permisos', HttpStatus.FORBIDDEN);

        // * Firma para el token, debe tener los mismos vamos que en Jwt.strategy.ts en el metodo validate
        const payload = {
            id: userFound.id,
            name: userFound.name
        }

        const token = this.jwtService.sign(payload);

        const data = {
            user: userFound,
            token
        }

        return data;
    }
}
