import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

const UNAVAILABLE_CODES = ['P1001', 'P1002', 'P1017'];

@Catch(Prisma.PrismaClientKnownRequestError)
export class DatabaseUnavailableFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (UNAVAILABLE_CODES.includes(exception.code)) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'The database is waking up. Please try again in a few seconds.',
      });
    }

    console.error('Prisma error:', exception.code, exception.message);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Something went wrong on our side.',
    });
  }
}