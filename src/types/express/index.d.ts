// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      userId?: Number;
      cleanBody?: any;
      body?: any;
      user?: any;
      file?: Express.Multer.File;
      files?: {
        image?: Express.Multer.File[];
      };
    }
  }
}
