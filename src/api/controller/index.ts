import { ValidationError } from 'joi';

export interface Validation<T> {
  error: ValidationError;
  value: T;
}

// export controllers here
export * from './upload';
