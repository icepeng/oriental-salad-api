import * as Joi from 'joi';
import { Validation } from '../';
import { LANG_KO } from '../../util/joi';

export interface UploadInput {
  name: string;
  judges: JudgeInput[];
}

export interface JudgeInput {
  value: number;
  potential: number;
  description: string;
  cardCode: string;
}

export function uploadValidator(body: any): Validation<UploadInput> {
  const schema = Joi.object().keys({
    name: Joi.string()
      .max(255)
      .required(),
    judges: Joi.array()
      .items(
        Joi.object()
          .keys({
            value: Joi.number().required(),
            potential: Joi.number().required(),
            description: Joi.string()
              .allow('')
              .default(''),
            cardCode: Joi.string().required(),
          })
          .required(),
      )
      .required(),
  });

  return Joi.validate(body, schema, { language: LANG_KO });
}

export function idValidator(id: string): Validation<string> {
  const schema = Joi.string().uuid();
  return Joi.validate(id, schema, { language: LANG_KO });
}
