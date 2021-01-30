import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    const existingTags = await this.getExistingTags(name);
    const tag = this.generateNewTag(existingTags);
    return {
      name,
      tag,
    };
  }

  async getAvailableUsername(name: string, tag: number, acceptNewTag = false) {
    const existingTags = await this.getExistingTags(name);
    let newTag = tag;
    const index = bs(existingTags, tag, (element, needle) => element - needle);
    if (index >= 0) {
      if (acceptNewTag) {
        newTag = this.generateNewTag(existingTags);
      } else {
        throw new HttpException(
          'Username and tag combination already in use.',
          HttpStatus.CONFLICT,
        );
      }
    }

    return {
      name,
      tag: newTag,
    };
  }

  private async getExistingTags(name: string) {
    if (!name) {
      throw new HttpException('Invalid name', HttpStatus.BAD_REQUEST);
    }
    return (
      await this.userRepo
        .createQueryBuilder('user')
        .select(['user.tag'])
        .where('user.name = :name', { name })
        .orderBy('user.tag', 'ASC')
        .getMany()
    ).map((user) => user.tag);
  }

  private generateNewTag(existingTags: number[]) {
    let tag = 1;
    const count = existingTags.length;
    if (count !== 0 && existingTags[0] === 1) {
      const index = findException(existingTags);
      if (index === -1) {
        tag = existingTags[count - 1] + 1;
      } else {
        tag = existingTags[index - 1] + 1;
      }
    }
    return tag;
  }

  // async create(name: string, tag?: number) {
  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const username = await this.preloadUsername(name);
  //     const uniqueUsername = new UniqueUsername();
  //     const newTag = this.getTag(username, tag);

  //     uniqueUsername.tag = newTag;
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
  //   const currentTag = uniqueUsername.tag;
  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const oldUsername = await this.preloadUsername(uniqueUsername.name);
  //     const newUsername = await this.preloadUsername(newName);

  //     this.freeTag(oldUsername, currentTag);

  //     const newTag = this.getTag(
  //       newUsername,
  //       currentTag,
  //     );

  //     uniqueUsername.tag = newTag;
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

  // async updateTag(
  //   uniqueUsername: UniqueUsername,
  //   newTag: number,
  // ) {
  //   console.log('updating tag');

  //   if (uniqueUsername.tag === newTag) {
  //     throw new HttpException('No change', HttpStatus.BAD_REQUEST);
  //   }
  //   const currentTag = uniqueUsername.tag;
  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const username = await this.preloadUsername(uniqueUsername.name);

  //     this.freeTag(username, currentTag);

  //     const newAvailableTag = this.getTag(
  //       username,
  //       newTag,
  //     );

  //     uniqueUsername.tag = newAvailableTag;

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

  // async updateNameAndTag(
  //   uniqueUsername: UniqueUsername,
  //   newName: string,
  //   newTag: number,
  // ) {
  //   console.log('updating name and tag');
  //   if (
  //     uniqueUsername.name === newName &&
  //     uniqueUsername.tag === newTag
  //   ) {
  //     throw new HttpException('No change', HttpStatus.BAD_REQUEST);
  //   }
  //   const currentTag = uniqueUsername.tag;
  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const oldUsername = await this.preloadUsername(uniqueUsername.name);
  //     const newUsername = await this.preloadUsername(newName);

  //     this.freeTag(oldUsername, currentTag);
  //     const availableNewTag = this.getTag(
  //       newUsername,
  //       newTag,
  //     );

  //     uniqueUsername.tag = availableNewTag;
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

  // private getTag(username: Username, newValue?: number) {
  //   const { availableTags: available, outOfOrder } = username;
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
  //           'Username and tag combination already in use',
  //         );
  //       }
  //     }
  //     const tag = available[0];
  //     available[0] = tag + 1;
  //     if (tag + 1 === outOfOrder[0]) {
  //       outOfOrder.shift();
  //     }
  //     return tag;
  //   } else {
  //     const tag = available.pop();
  //     if (available.length === 0) {
  //       available.push(tag + 1);
  //     }
  //     if (tag + 1 === outOfOrder[0]) {
  //       outOfOrder.shift();
  //     }
  //     return tag;
  //   }
  // }

  // private freeTag(username: Username, value: number) {
  //   const { availableTags: available, outOfOrder } = username;
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
  //   username.availableTags = [1];
  //   username.outOfOrder = [];

  //   return this.usernameRepo.save(username);
  // }
}
