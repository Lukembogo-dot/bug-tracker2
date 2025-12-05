

    describe("CommentRepository Mock", () => {
          test("comments can be retreived from the database", async () => {
             const mockComment ={
                             commentid: 1,
                             bugid: 1,
                             userid: 1,
                             commenttext: "This is a comment",
                             createdat: new Date(),
                             username: "testuser"
     };

        jest.spyOn(CommentRepository, "getCommentById").mockResolvedValueOnce(mockComment);

        const comments = await CommentRepository.getCommentById(1);

        expect(comments).toEqual(mockComment);

         });
    });

import { CommentRepository } from '../../src/repositories/comments.repositories';
import { BugRepository } from '../../src/repositories/bugs.repositories';
import { UserRepository } from '../../src/repositories/user.repositories';
import * as CommentServices from '../../src/services/comments.services';


jest.mock('../../src/repositories/comments.repositories.ts');
jest.mock('../../src/repositories/bugs.repositories.ts');
jest.mock('../../src/repositories/user.repositories.ts');

describe("Comment service testing", () => {

  // Tests for successful comment functions
  it("should return a list of all comments", async () => {
    const mockComments: any = [
      {
        commentid: 1,
        bugid: 1,
        userid: 1,
        commenttext: "This is a critical bug that needs immediate attention",
        createdat: new Date("2025-10-30T14:30:00Z"),
        username: "user1"
      },
      {
        commentid: 2,
        bugid: 1,
        userid: 2,
        commenttext: "I'm working on fixing this issue",
        createdat: new Date("2025-10-31T10:15:00Z"),
        username: "user2"
      },
      {
        commentid: 3,
        bugid: 2,
        userid: 1,
        commenttext: "This bug is related to the authentication module",
        createdat: new Date("2025-11-01T09:00:00Z"),
        username: "user1"
      }
    ];

    (CommentRepository.getAllComments as jest.Mock).mockResolvedValue(mockComments);

    const comments = await CommentServices.getAllComments();

    expect(comments).toEqual(mockComments);
    expect(CommentRepository.getAllComments).toHaveBeenCalled();
  });

  it("should get a comment by ID", async () => {
    const mockComment = {
      commentid: 1,
      bugid: 1,
      userid: 1,
      commenttext: "This is a critical bug that needs immediate attention",
      createdat: new Date("2025-10-30T14:30:00Z"),
      username: "testuser"
    };

    (CommentRepository.getCommentById as jest.Mock).mockResolvedValue(mockComment);

    const comment = await CommentServices.getCommentById(1);

    expect(comment).toEqual(mockComment);
    expect(CommentRepository.getCommentById).toHaveBeenCalledWith(1);
  });

  it("should get comments by bug ID", async () => {
    const mockComments: any = [
      {
        commentid: 1,
        bugid: 1,
        userid: 1,
        commenttext: "This is a critical bug that needs immediate attention",
        createdat: new Date("2025-10-30T14:30:00Z"),
        username: "user1"
      },
      {
        commentid: 2,
        bugid: 1,
        userid: 2,
        commenttext: "I'm working on fixing this issue",
        createdat: new Date("2025-10-31T10:15:00Z"),
        username: "user2"
      }
    ];

    (CommentRepository.getCommentsByBug as jest.Mock).mockResolvedValue(mockComments);

    const comments = await CommentServices.getCommentsByBug(1);

    expect(comments).toEqual(mockComments);
    expect(CommentRepository.getCommentsByBug).toHaveBeenCalledWith(1);
  });

  it("should get comments by user ID", async () => {
    const mockComments: any = [
      {
        commentid: 1,
        bugid: 1,
        userid: 1,
        commenttext: "This is a critical bug that needs immediate attention",
        createdat: new Date("2025-10-30T14:30:00Z"),
        username: "user1"
      },
      {
        commentid: 3,
        bugid: 2,
        userid: 1,
        commenttext: "This bug is related to the authentication module",
        createdat: new Date("2025-11-01T09:00:00Z"),
        username: "user1"
      }
    ];

    (CommentRepository.getCommentsByUser as jest.Mock).mockResolvedValue(mockComments);

    const comments = await CommentServices.getCommentsByUser(1);

    expect(comments).toEqual(mockComments);
    expect(CommentRepository.getCommentsByUser).toHaveBeenCalledWith(1);
  });

  it("should create a comment successfully", async () => {
    const mockCommentData = {
      bugid: 1,
      userid: 1,
      commenttext: "This is a new comment"
    };

    const mockCreatedComment = {
      commentid: 1,
      ...mockCommentData,
      createdat: new Date("2025-11-04T12:00:00Z"),
      username: "testuser"
    };

    const mockBug = {
      bugid: 1,
      title: "Test Bug",
      description: "Test Description",
      status: "Open",
      priority: "High",
      projectid: 1,
      reportedby: 1,
      assignedto: null,
      createdat: new Date()
    };

    const mockUser = {
      userid: 1,
      username: "testuser",
      email: "test@example.com",
      passwordhash: "hashedpassword",
      role: "user",
      createdat: new Date()
    };

    (BugRepository.getBugById as jest.Mock).mockResolvedValue(mockBug);
    (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
    (CommentRepository.createComment as jest.Mock).mockResolvedValue(mockCreatedComment);

    const comment = await CommentServices.createComment(mockCommentData);

    expect(comment).toEqual(mockCreatedComment);
    expect(BugRepository.getBugById).toHaveBeenCalledWith(1);
    expect(UserRepository.getUserById).toHaveBeenCalledWith(1);
    expect(CommentRepository.createComment).toHaveBeenCalledWith(mockCommentData);
  });

  it("should update a comment successfully", async () => {
    const mockUpdateData = {
      commenttext: "Updated comment text"
    };

    const mockUpdatedComment = {
      commentid: 1,
      bugid: 1,
      userid: 1,
      commenttext: "Updated comment text",
      createdat: new Date("2025-10-30T14:30:00Z"),
      username: "testuser"
    };

    (CommentRepository.updateComment as jest.Mock).mockResolvedValue(mockUpdatedComment);

    const comment = await CommentServices.updateComment(1, mockUpdateData);

    expect(comment).toEqual(mockUpdatedComment);
    expect(CommentRepository.updateComment).toHaveBeenCalledWith(1, mockUpdateData);
  });

  it("should delete a comment successfully", async () => {
    (CommentRepository.deleteComment as jest.Mock).mockResolvedValue(true);

    const result = await CommentServices.deleteComment(1);

    expect(result).toBe(true);
    expect(CommentRepository.deleteComment).toHaveBeenCalledWith(1);
  });

  it("should delete all comments by bug ID", async () => {
    (CommentRepository.deleteCommentsByBug as jest.Mock).mockResolvedValue(5);

    const deletedCount = await CommentServices.deleteCommentsByBug(1);

    expect(deletedCount).toBe(5);
    expect(CommentRepository.deleteCommentsByBug).toHaveBeenCalledWith(1);
  });

  // Additional fail tests for edge cases
  it("should fail to get comment by ID with invalid ID", async () => {
    await expect(CommentServices.getCommentById(NaN)).rejects.toThrow('Invalid comment ID');
  });

  it("should fail to get comments by bug with invalid bug ID", async () => {
    await expect(CommentServices.getCommentsByBug(NaN)).rejects.toThrow('Invalid bug ID');
  });

  it("should fail to get comments by user with invalid user ID", async () => {
    await expect(CommentServices.getCommentsByUser(NaN)).rejects.toThrow('Invalid user ID');
  });

  it("should fail to create comment without data", async () => {
    await expect(CommentServices.createComment(null)).rejects.toThrow("Please provide comment data");
  });

  it("should fail to create comment with missing required fields", async () => {
    const incompleteData = {
      bugid: 1,
      userid: 1
      // Missing commenttext
    };

    await expect(CommentServices.createComment(incompleteData)).rejects.toThrow(
      "Missing required fields: bugid, userid, and commenttext are required"
    );
  });

  it("should fail to create comment with invalid field types", async () => {
    const invalidData = {
      bugid: "not a number",
      userid: 1,
      commenttext: "Valid text"
    };

    await expect(CommentServices.createComment(invalidData)).rejects.toThrow(
      "Invalid field types: bugid and userid must be numbers, commenttext must be string"
    );
  });

  it("should fail to create comment with empty comment text", async () => {
    const emptyTextData = {
      bugid: 1,
      userid: 1,
      commenttext: "   "
    };

    const mockBug = {
      bugid: 1,
      title: "Test Bug",
      description: "Test Description",
      status: "Open",
      priority: "High",
      projectid: 1,
      reportedby: 1,
      assignedto: null,
      createdat: new Date()
    };

    const mockUser = {
      userid: 1,
      username: "testuser",
      email: "test@example.com",
      passwordhash: "hashedpassword",
      role: "user",
      createdat: new Date()
    };

    (BugRepository.getBugById as jest.Mock).mockResolvedValue(mockBug);
    (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

    await expect(CommentServices.createComment(emptyTextData)).rejects.toThrow(
      "CommentText cannot be empty"
    );
  });

  it("should fail to create comment with invalid bug ID", async () => {
    const invalidBugData = {
      bugid: 999,
      userid: 1,
      commenttext: "Valid comment text"
    };

    (BugRepository.getBugById as jest.Mock).mockResolvedValue(null);

    await expect(CommentServices.createComment(invalidBugData)).rejects.toThrow(
      "Invalid BugID: Bug does not exist"
    );
  });

  it("should fail to create comment with invalid user ID", async () => {
    const invalidUserData = {
      bugid: 1,
      userid: 999,
      commenttext: "Valid comment text"
    };

    const mockBug = {
      bugid: 1,
      title: "Test Bug",
      description: "Test Description",
      status: "Open",
      priority: "High",
      projectid: 1,
      reportedby: 1,
      assignedto: null,
      createdat: new Date()
    };

    (BugRepository.getBugById as jest.Mock).mockResolvedValue(mockBug);
    (UserRepository.getUserById as jest.Mock).mockResolvedValue(null);

    await expect(CommentServices.createComment(invalidUserData)).rejects.toThrow(
      "Invalid UserID: User does not exist"
    );
  });

  it("should fail to update comment with invalid comment ID", async () => {
    const updateData = {
      commenttext: "Updated text"
    };

    await expect(CommentServices.updateComment(NaN, updateData)).rejects.toThrow('Invalid comment ID');
  });

  it("should fail to update comment without data", async () => {
    await expect(CommentServices.updateComment(1, null)).rejects.toThrow("No update data provided");
  });

  it("should fail to update comment with empty object", async () => {
    await expect(CommentServices.updateComment(1, {})).rejects.toThrow("No update data provided");
  });

  it("should fail to update comment with invalid comment text", async () => {
    const invalidUpdateData = {
      commenttext: "   "
    };

    await expect(CommentServices.updateComment(1, invalidUpdateData)).rejects.toThrow(
      "Invalid CommentText: Must be non-empty string"
    );
  });

  it("should fail to delete comment with invalid ID", async () => {
    await expect(CommentServices.deleteComment(NaN)).rejects.toThrow('Invalid comment ID');
  });

  it("should fail to delete comments by bug with invalid bug ID", async () => {
    await expect(CommentServices.deleteCommentsByBug(NaN)).rejects.toThrow('Invalid bug ID');
  });
});

