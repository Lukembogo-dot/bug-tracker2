import { UserRepository } from '../../src/repositories/user.repositories';
import * as UserServices from '../../src/services/user.services';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


jest.mock('../../src/repositories/user.repositories.ts');
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("express");
jest.mock("pg");

describe("User service testing", () => {
  
   // User creation  and retrieval tests
   it("should return a list of all users", async () =>{
    const mockUsers: any  = [
    {
     UserID:1,
     Username: "john doe",
     Email: "johndoe@gmail.com",
     PasswordHash: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
     Role: 'admin',
     CreatedAt: new Date("2025-10-30T14:30:00Z")
    }
    ,{
     UserID:2,
     Username: "jane002",
     Email: "jane002@gmail.com",
     PasswordHash:"jnkjdnfjksdnfkjaedjkhaekjfhkjdjkfnejkfnjkbdfv",
     Role:"user",
     CreatedAt: new Date("2025-11-30T15:30:00Z"),
    }
    ,{
     UserID:3,
     Username:"Alice",
     Email:"alice@gmail.com",
     PasswordHash:"jkbdkjfjdfckijhsdkjf",
     Role:"admin",
     CreatedAt:new Date("2025-10-30T14:30:00Z")
    },
    {
     UserID:4,
     Username:"Swiss001",
     Email:"Swiss001@gmail.com",
     PasswordHash:"hjsdnfkjekjkjjkbkjdcjjhdsc123445",
     Role:"admin",
     CreatedAt:new Date()
    }];
    (UserRepository.getAllUsers as jest.Mock).mockResolvedValue(mockUsers)
    
   });

   it("should create a user", async () =>{
     const mockUser = 
     {
      Username:"Paul",
      Email:"paulmuyalikhams@gmail.com",
      PasswordHash:"jjajhfbahjediahiuhiu821",
      Role:"admin"
     };
     (UserRepository.createUser as jest.Mock).mockResolvedValue(mockUser)

   });
   it("should reject a user who has not filled credentials when creating", async() => {
     const mockUser =
     {
      Username:"Paul",
      Email:"paulmuyalikhams@gmail.com",

      Role:"admin"
     };

     const mockReq = { body: mockUser } as Request;
     const mockRes = {
       status: jest.fn().mockReturnThis(),
       json: jest.fn()
     } as unknown as Response;
     await UserServices.createUser(mockReq, mockRes);
     expect(mockRes.status).toHaveBeenCalledWith(500);
     expect(mockRes.json).toHaveBeenCalledWith({
       message: "Failed to create user",
       error: "Missing credentials, please fully fill credentials required"
     }) 
    });
     //login test.
     it("should login a user successfully", async () => {
      const mockUser={
      UserID:1,
      Username: "john doe",
     Email: "johndoe@gmail.com",
     PasswordHash: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
     Role: 'admin',
     CreatedAt: new Date("2025-10-30T14:30:00Z")
      }

      const mockReq = {body:{email: mockUser.Email, password: mockUser.PasswordHash}} as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      // Mock the repository and bcrypt
      (UserRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await UserServices.loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Login successful",
        token: 'mockToken',
        user: {
          UserID: mockUser.UserID,
          Username: mockUser.Username,
          Email: mockUser.Email,
          Role: mockUser.Role,
          CreatedAt: mockUser.CreatedAt
        }
      });
    });

    it("should get a user's profile", async() => {
      const mockUser={
        UserID:1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      }
     const mockReq = { user: { userId: mockUser.UserID } } as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await UserServices.getUserProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        user: {
          UserID: mockUser.UserID,
          Username: mockUser.Username,
          Email: mockUser.Email,
          Role: mockUser.Role,
          CreatedAt: mockUser.CreatedAt
        }
      });
  });
  
  it("should update a user's credentials", async()=>{
    const mockUser={
        UserID:1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      }
      const body={
        username:"Paul-Muyali",
        email:"paulmuyalikhams@gmail.com"
      }
      const mockReq = {user:{userId: mockUser.UserID}, body: body} as Request;

      const mockRes ={
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      const updatedUser = {
        ...mockUser,
        Username: body.username,
        Email: body.email
      };

      (UserRepository.updateUser as jest.Mock).mockResolvedValue(updatedUser);
      (UserRepository.getUserByEmail as jest.Mock).mockResolvedValue(null); // No conflict

      await UserServices.updateUserProfile(mockReq, mockRes);

      expect(UserRepository.updateUser).toHaveBeenCalledWith(mockUser.UserID, {
        Username: body.username.trim(),
        Email: body.email.trim().toLowerCase()
      });
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
       message:"Profile updated successfully",
       user: {
         UserID: updatedUser.UserID,
         Username: updatedUser.Username,
         Email: updatedUser.Email,
         Role: updatedUser.Role,
         CreatedAt: updatedUser.CreatedAt
       }
      })
});
    
it("should update the user's password", async() => {
  const mockUser={
        UserID:1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      }

  const body={
    currentPassword: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
    newPassword:"12345678djd"
  }
  const mockReq = {user:{userId: mockUser.UserID}, body} as Request
  const mockRes = {
    status:jest.fn().mockReturnThis(),
    json: jest.fn()
  } as unknown as Response;

  (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
  (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  (UserRepository.updateUser as jest.Mock).mockResolvedValue(null);

  // Mock bcrypt.hash to return a hashed password
  (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$mockHashedPassword');


  await UserServices.changePassword(mockReq, mockRes)

  expect(UserRepository.updateUser).toHaveBeenCalledWith(mockUser.UserID, {
    PasswordHash: expect.any(String)
  });
  expect(mockRes.status).toHaveBeenCalledWith(204)
  expect(mockRes.json).toHaveBeenCalledWith(
    { message: "Password changed successfully" }
  )


});

})
