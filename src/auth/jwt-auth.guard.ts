import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// * main
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }