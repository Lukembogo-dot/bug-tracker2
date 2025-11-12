import { CommentRepository } from "../../src/repositories/comments.repositories"


    describe("CommentRepository Mock", () => {
         test("comments can be retreived from the database", async () => {
            const mockComment ={
                            CommentID: 1,
                            BugID: 1,
                            UserID: 1,
                            CommentText: "This is a comment",
                            CreatedAt: new Date(),
                            UpdatedAt: new Date()
    };

        jest.spyOn(CommentRepository, "getCommentById").mockResolvedValueOnce(mockComment);

        const comments = await CommentRepository.getCommentById(1);

        expect(comments).toEqual(mockComment);

         });
    });