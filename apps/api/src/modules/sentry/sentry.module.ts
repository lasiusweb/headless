import { Module, Global } from '@nestjs/common';
import { SentryService } from './sentry.service';
import { SentryInterceptor } from './sentry.interceptor';
import { SentryFilter } from './sentry.filter';

@Global()
@Module({
  providers: [SentryService, SentryInterceptor, SentryFilter],
  exports: [SentryService, SentryInterceptor, SentryFilter],
})
export class SentryModule {}
