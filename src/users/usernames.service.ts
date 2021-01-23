import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { findException } from 'src/shared/utils';
import { Repository } from 'typeorm';
import bs = require('binary-search');
import { User } from './entities/user.entity';

@Injectable()
export class UsernamesService {
  private DEFAULT_NAME = 'Trainer';

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(name = this.DEFAULT_NAME) {
    const existingDiscriminators = await this.getExistingDiscriminators(name);
    const discriminator = this.generateNewDiscriminator(existingDiscriminators);
    return {
      name,
      discriminator,
    };
  }

  async getAvailableUsername(
    name: string,
    discriminator: number,
    acceptNewDiscriminator = false,
  ) {
    const existingDiscriminators = await this.getExistingDiscriminators(name);
    let newDiscriminator = discriminator;
    const index = bs(
      existingDiscriminators,
      discriminator,
      (element, needle) => element - needle,
    );
    if (index >= 0) {
      if (acceptNewDiscriminator) {
        newDiscriminator = this.generateNewDiscriminator(
          existingDiscriminators,
        );
      } else {
        throw new Error(
          'Username and discriminator combination already in use.',
        );
      }
    }

    return {
      name,
      discriminator: newDiscriminator,
    };
  }

  private async getExistingDiscriminators(name: string) {
    if (!name) {
      throw new Error('Invalid name');
    }
    return (
      await this.userRepo
        .createQueryBuilder('user')
        .select(['user.discriminator'])
        .where('user.name = :name', { name })
        .orderBy('user.discriminator', 'ASC')
        .getMany()
    ).map((user) => user.discriminator);
  }

  private generateNewDiscriminator(existingDiscriminators: number[]) {
    let discriminator = 1;
    const count = existingDiscriminators.length;
    if (count !== 0 && existingDiscriminators[0] === 1) {
      const index = findException(existingDiscriminators);
      if (index === -1) {
        discriminator = existingDiscriminators[count - 1] + 1;
      } else {
        discriminator = existingDiscriminators[index - 1] + 1;
      }
    }
    return discriminator;
  }

  // async create(name: string, discriminator?: number) {
  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const username = await this.preloadUsername(name);
  //     const uniqueUsername = new UniqueUsername();
  //     const newDiscriminator = this.getDiscriminator(username, discriminator);

  //     uniqueUsername.discriminator = newDiscriminator;
  //     uniqueUsername.name = username.name;

  //     await queryRunner.manager.save(username);
  //     const res = await queryRunner.manager.save(uniqueUsername);
  //     await queryRunner.commitTransaction();
  //     await queryRunner.release();
  //     return res;
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     await queryRunner.release();
  //     throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  // async updateName(uniqueUsername: UniqueUsername, newName: string) {
  //   console.log('updating name');

  //   if (uniqueUsername.name === newName) {
  //     throw new HttpException('No change', HttpStatus.BAD_REQUEST);
  //   }
  //   const currentDiscriminator = uniqueUsername.discriminator;
  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const oldUsername = await this.preloadUsername(uniqueUsername.name);
  //     const newUsername = await this.preloadUsername(newName);

  //     this.freeDiscriminator(oldUsername, currentDiscriminator);

  //     const newDiscriminator = this.getDiscriminator(
  //       newUsername,
  //       currentDiscriminator,
  //     );

  //     uniqueUsername.discriminator = newDiscriminator;
  //     uniqueUsername.name = newUsername.name;

  //     await queryRunner.manager.save(oldUsername);
  //     await queryRunner.manager.save(newUsername);
  //     const updatedUsername = await queryRunner.manager.save(uniqueUsername);

  //     await queryRunner.commitTransaction();
  //     await queryRunner.release();
  //     return updatedUsername;
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     await queryRunner.release();
  //     throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  // async updateDiscriminator(
  //   uniqueUsername: UniqueUsername,
  //   newDiscriminator: number,
  // ) {
  //   console.log('updating discriminator');

  //   if (uniqueUsername.discriminator === newDiscriminator) {
  //     throw new HttpException('No change', HttpStatus.BAD_REQUEST);
  //   }
  //   const currentDiscriminator = uniqueUsername.discriminator;
  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const username = await this.preloadUsername(uniqueUsername.name);

  //     this.freeDiscriminator(username, currentDiscriminator);

  //     const newAvailableDiscriminator = this.getDiscriminator(
  //       username,
  //       newDiscriminator,
  //     );

  //     uniqueUsername.discriminator = newAvailableDiscriminator;

  //     await queryRunner.manager.save(username);
  //     const updatedUsername = await queryRunner.manager.save(uniqueUsername);

  //     await queryRunner.commitTransaction();
  //     await queryRunner.release();
  //     return updatedUsername;
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     await queryRunner.release();
  //     throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  // async updateNameAndDiscriminator(
  //   uniqueUsername: UniqueUsername,
  //   newName: string,
  //   newDiscriminator: number,
  // ) {
  //   console.log('updating name and discriminator');
  //   if (
  //     uniqueUsername.name === newName &&
  //     uniqueUsername.discriminator === newDiscriminator
  //   ) {
  //     throw new HttpException('No change', HttpStatus.BAD_REQUEST);
  //   }
  //   const currentDiscriminator = uniqueUsername.discriminator;
  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const oldUsername = await this.preloadUsername(uniqueUsername.name);
  //     const newUsername = await this.preloadUsername(newName);

  //     this.freeDiscriminator(oldUsername, currentDiscriminator);
  //     const availableNewDiscriminator = this.getDiscriminator(
  //       newUsername,
  //       newDiscriminator,
  //     );

  //     uniqueUsername.discriminator = availableNewDiscriminator;
  //     uniqueUsername.name = newUsername.name;

  //     await queryRunner.manager.save(oldUsername);
  //     await queryRunner.manager.save(newUsername);
  //     const updatedUsername = await queryRunner.manager.save(uniqueUsername);

  //     await queryRunner.commitTransaction();
  //     await queryRunner.release();
  //     return updatedUsername;
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     await queryRunner.release();
  //     throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  // private getDiscriminator(username: Username, newValue?: number) {
  //   const { availableDiscriminators: available, outOfOrder } = username;
  //   if (newValue) {
  //     if (newValue > available[0]) {
  //       const index = getSortedIndex(outOfOrder, newValue);
  //       if (outOfOrder[index] != newValue) {
  //         insertByIndex(outOfOrder, newValue, index);
  //         return newValue;
  //       }
  //     } else if (newValue < available[0]) {
  //       const index = available.indexOf(newValue);
  //       if (index !== -1) {
  //         available.splice(index, 1);
  //         return newValue;
  //       } else {
  //         throw new Error(
  //           'Username and discriminator combination already in use',
  //         );
  //       }
  //     }
  //     const discriminator = available[0];
  //     available[0] = discriminator + 1;
  //     if (discriminator + 1 === outOfOrder[0]) {
  //       outOfOrder.shift();
  //     }
  //     return discriminator;
  //   } else {
  //     const discriminator = available.pop();
  //     if (available.length === 0) {
  //       available.push(discriminator + 1);
  //     }
  //     if (discriminator + 1 === outOfOrder[0]) {
  //       outOfOrder.shift();
  //     }
  //     return discriminator;
  //   }
  // }

  // private freeDiscriminator(username: Username, value: number) {
  //   const { availableDiscriminators: available, outOfOrder } = username;
  //   console.log(available);
  //   console.log(value);
  //   if (value < available[0]) {
  //     console.log(1);
  //     available.push(value);
  //   } else if (value > available[0]) {
  //     console.log(2);

  //     const index = outOfOrder.indexOf(value);
  //     if (index != -1) {
  //       outOfOrder.splice(index, 1);
  //     } else {
  //       throw new Error(`${value} not in out of order: ${outOfOrder}`);
  //     }
  //   } else {
  //     console.log(3);

  //     throw new Error(`Cannot free ${value}.`);
  //   }

  //   return value;
  // }

  // private async preloadUsername(name: string): Promise<Username> {
  //   const exisitingUsername = await this.usernameRepo.findOne({ name });

  //   if (exisitingUsername) {
  //     return exisitingUsername;
  //   }

  //   const username = new Username();
  //   username.name = name;
  //   username.availableDiscriminators = [1];
  //   username.outOfOrder = [];

  //   return this.usernameRepo.save(username);
  // }
}
