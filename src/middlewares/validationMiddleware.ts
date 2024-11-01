import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import _ from "lodash";

//this validateData function helps to ensure that incoming request data matches a specific schema, using zod for validation. If the request data is invalid, it sends a detailed error response. if the data is valid, it cleans up the data to only include the specified fields and moves to the next middleware. this middleware creates a new object with only the keys that are defined in the schema and req.cleanbody is the custom property we're adding to the request, which contains only the fields defined in the schema, excluding any unwanted fields

export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      req.cleanBody = _.pick(req.body, Object.keys(schema.shape));
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res.status(400).json({ error: "Invalid data", details: errorMessages });
      } else {
        res.status(500).json({
          error: "Internal Server Error catch at validationMiddleware",
        });
      }
    }
  };
}
