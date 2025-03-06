import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// * security
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }