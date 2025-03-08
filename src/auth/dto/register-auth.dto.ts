import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsEmail, IsNotEmpty, IsString, MinLength, ValidateNested } from "class-validator";

export class RegisterAuthDto {
    @IsNotEmpty()
    @IsString({ message: 'Debe ser un string' })
    name: string;

    @IsNotEmpty()
    @IsString()
    lastname: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, {
        message: 'Debe ser de mas de 6 caracteres'
    })
    password: string;

    @IsArray()
    @ArrayMaxSize(2)
    rolesIds: string[];
}