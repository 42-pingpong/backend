import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class WsAccessTokenGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('WsAccessTokenGuard canActivate');
    console.log(context);
    return true;
  }

  getRequest<T = any>(context: ExecutionContext): T {
    return context.switchToWs().getClient().handshake.auth.token;
  }
}
