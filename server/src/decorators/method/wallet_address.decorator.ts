import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WalletAddressedRequest } from 'src/types/common';

@Injectable()
export class ChangeRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest() as WalletAddressedRequest;
    // Modify request here
    req.wallet_address = req.headers['x-wallet_address'] as string;
    return next.handle();
  }
}

export function WalletRequest() {
  return applyDecorators(
    UseInterceptors(ChangeRequestInterceptor),
  );
}