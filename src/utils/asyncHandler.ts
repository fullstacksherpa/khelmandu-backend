import { Request, Response, NextFunction, RequestHandler } from "express";

const asyncHandler = (requestHandler: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export { asyncHandler };

/*
Understanding Asynchronous Route Handlers in Express

In Express, route handlers can either be synchronous or asynchronous. Asynchronous functions can throw errors in two ways 
- by throwing exceptions using throw within the function
- bg rejecting the promise(either explicitly or implicitly when an error occurs)

without proper error handling, if an asynchronous functions throws an error or rejects, express will not automatically pass the error to the error-handling middleware. Instead, you need to manually catch the error and forward it using next(err).

this is when asyncHandler comes in. It wraps an asynchronous route handler and ensures that any error is properly caught and forwarded to the next function.


The function asyncHandler is a higher order function, meaning it returns another function. This function(asyncHandler) takes an async route handler (requestHandler) as input and wraps it inside another function that handles error propagation. 

this anonymous function is returned by asyncHandler. It wraps the original asynchronous requestHandler in a promise chai to ensure proper error handling. 

the next(err) function is a special part of Express that forwards the error to the error handling middleware.

*/
