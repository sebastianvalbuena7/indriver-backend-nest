import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwt/jwt.constants';
import { JwtStrategy } from './jwt/jwt.strategy';
import { Rol } from 'src/roles/rol.entity';
import { RolesService } from 'src/roles/roles.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Rol]),
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '6h' },
        }),
    ],
    providers: [AuthService, RolesService, JwtStrategy],
    controllers: [AuthController]
})
export class AuthModule { }
