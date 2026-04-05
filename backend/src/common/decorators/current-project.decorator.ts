import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentProject = createParamDecorator(
  (data: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.project;
  },
);
