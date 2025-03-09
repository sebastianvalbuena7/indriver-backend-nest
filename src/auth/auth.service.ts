import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { In, Repository } from 'typeorm';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Rol } from 'src/roles/rol.entity';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Rol) private rolesRepository: Repository<Rol>,
        private jwtService: JwtService
    ) { }

    async register(user: RegisterAuthDto) {
        const { email, phone } = user;

        const emailExist = await this.usersRepository.findOneBy({ email });

        if (emailExist) throw new HttpException('El email ya está registrado', HttpStatus.CONFLICT);

        const phoneExist = await this.usersRepository.findOneBy({ phone });

        if (phoneExist) throw new HttpException('El telefono ya está reegistrado', HttpStatus.CONFLICT);

        const newUser = this.usersRepository.create(user);

        let rolesIds = [];

        if (user.rolesIds !== undefined && user.rolesIds !== null) rolesIds = user.rolesIds;
        else rolesIds.push('CLIENT');

        const roles = await this.rolesRepository.findBy(
            {
                id: In(rolesIds)
            }
        );

        newUser.roles = roles;

        const userSaved = await this.usersRepository.save(newUser);
        const rolesString = userSaved.roles.map(rol => rol.id);

        const payload = {
            id: userSaved.id,
            name: userSaved.name,
            roles: rolesString
        }

        const token = this.jwtService.sign(payload);

        const data = {
            user: userSaved,
            token: 'Bearer ' + token
        };

        delete (data.user as any).password;

        return data;
    }

    async login(login: LoginAuthDto) {
        const { email, password } = login;

        const userFound = await this.usersRepository.findOne({
            where: { email },
            relations: ['roles']
        });

        if (!userFound)
            throw new HttpException('El email no existe', HttpStatus.NOT_FOUND);

        const isPasswordValid = await compare(password, userFound.password);

        if (!isPasswordValid)
            throw new HttpException('No tiene permisos', HttpStatus.FORBIDDEN);

        const rolesIds: string[] = userFound.roles.map(rol => rol.id);

        // * Firma para el token, debe tener los mismos vamos que en Jwt.strategy.ts en el metodo validate
        const payload = {
            id: userFound.id,
            name: userFound.name,
            roles: rolesIds
        }

        const token = this.jwtService.sign(payload);

        const data = {
            user: userFound,
            token: 'Bearer ' + token
        };

        delete (data.user as any).password;

        return data;
    }
}
