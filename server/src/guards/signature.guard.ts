import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WalletAddressedRequest } from 'src/types/common';
import verifySignature from 'src/utils/verify-signature';

@Injectable()
export class SignatureGuard implements CanActivate {
  private message: string;
  constructor(message: string) {
    this.message = message;
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<WalletAddressedRequest>();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const signature = request.headers['x-signature'] as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const wallet_address = request.headers['x-wallet_address'] as string;
    if (wallet_address && signature) {
      const is_verified = verifySignature(
        wallet_address,
        this.message,
        signature,
      );
      if (is_verified) {
        request.wallet_address = wallet_address;
      }
      return is_verified;
    }
    return false;
  }
}
