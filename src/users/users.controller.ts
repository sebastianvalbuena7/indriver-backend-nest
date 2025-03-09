import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseAndValidateUserPipe } from './ParseAndValidateUserPipe.pipe';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-rol';

@Controller('users')
export class UsersController {
    constructor(
        private userService: UsersService
    ) { }

    @Post()
    create(@Body() user: CreateUserDto) {
        return this.userService.create(user);
    }

    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get()
    allUsers() {
        return this.userService.findAll();
    }

    @HasRoles(JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() user: UpdateUserDto) {
        return this.userService.update(id, user);
    }

    @HasRoles(JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard)
    @Post('upload/:id')
    @UseInterceptors(FileInterceptor('file'))
    async updateWithImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
                ]
            })
        ) file: Express.Multer.File,
        @Param('id', ParseIntPipe) id: number,
        @Body(ParseAndValidateUserPipe) user: any
    ) {
        return this.userService.updateWithImage(file, id, user as UpdateUserDto);
    }
}
