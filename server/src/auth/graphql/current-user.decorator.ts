import { AuthUserDto } from '@/users/dto/auth-user.dto';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUserGql = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthUserDto => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);