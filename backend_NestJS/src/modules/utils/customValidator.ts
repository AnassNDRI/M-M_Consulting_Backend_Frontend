import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// pour s'assurer que l'adresse mail ne contient pas de lettre majuscule

export default function IsLowercase(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isLowercase',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && value === value.toLowerCase();
        }
      }
    });
  };
}