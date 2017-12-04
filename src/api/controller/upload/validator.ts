import * as Joi from 'joi';
import { Validation } from '../';
import { LANG_KO } from '../../util/joi';

export interface UploadInput {
  name: string;
  judges: any;
}

export function accountValidator(body: any): Validation<UploadInput> {
  const schema = Joi.object().keys({
    name: Joi.string()
      .max(255)
      .required(),
    judges: Joi.any(),
  });

  return Joi.validate(body, schema, { language: LANG_KO });
}
