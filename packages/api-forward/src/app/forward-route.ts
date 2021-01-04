import { Request, Response } from 'express';
import { AxiosRequestConfig, default as axios } from 'axios';

export const forwardRoute = (
  req: Request,
  res: Response
) => {
  const requestConfig: AxiosRequestConfig = lookupConfig({ ...req.body, method: req.method });
  try {
    axios(requestConfig).then(remoteRes => res.json(remoteRes));
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const lookupConfig = (requestConf: AxiosRequestConfig): AxiosRequestConfig => {
    const newRequestConf = { ...requestConf };
    if (["GET"].includes(requestConf.method)) {
        for (const [key, val] of Object.entries(requestConf.params)) {
            if ((val as string).includes("_LOOKUP_")) {
                newRequestConf[key] = lookupInEnv(val as string);
            }
        }
    } else {
        for (const [key, val] of Object.entries(requestConf.data)) {
            if ((val as string).includes("_LOOKUP_")) {
                newRequestConf[key] = lookupInEnv(val as string)
            }
        }
    }
    return newRequestConf;
}

const lookupInEnv = (valueToReplace: string): any => {
    if (valueToReplace.includes("_JSON")) {
        return JSON.parse(process.env[valueToReplace]);
    } else if (valueToReplace.includes("_EVAL")) {
        return eval(process.env[valueToReplace]);
    } else {
        return process.env[valueToReplace];
    }
};