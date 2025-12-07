import { ProjectRepository } from '../../src/repositories/projects.repositories';
import { UserRepository } from '../../src/repositories/user.repositories';
import * as ProjectServices from '../../src/services/projects.services';

jest.mock('../../src/repositories/projects.repositories');
jest.mock('../../src/repositories/user.repositories');

describe("Project service testing", () => {

  // Tests for successful project functions
  it("should return a list of all projects", async () => {
    const mockProjects: any = [
      {
        projectid: 1,
        projectname: "Bug Tracker App",
        description: "A comprehensive bug tracking application",
        createdby: 1,
        assignedto: 2,
        createdat: new Date("2025-10-30T14:30:00Z")
      },
      {
        projectid: 2,
        projectname: "E-commerce Platform",
        description: "Online shopping platform",
        createdby: 2,
        assignedto: 3,
        createdat: new Date("2025-11-01T10:00:00Z")
      }
    ];

    (ProjectRepository.getAllProjects as jest.Mock).mockResolvedValue(mockProjects);

    const projects = await ProjectServices.getAllProjects();

    expect(projects).toEqual(mockProjects);
    expect(ProjectRepository.getAllProjects).toHaveBeenCalled();
  });

  it("should get a project by ID", async () => {
    const mockProject = {
      projectid: 1,
      projectname: "Bug Tracker App",
      description: "A comprehensive bug tracking application",
      createdby: 1,
      assignedto: 2,
      createdat: new Date("2025-10-30T14:30:00Z")
    };

    (ProjectRepository.getProjectById as jest.Mock).mockResolvedValue(mockProject);

    const project = await ProjectServices.getProjectById(1);

    expect(project).toEqual(mockProject);
    expect(ProjectRepository.getProjectById).toHaveBeenCalledWith(1);
  });

  it("should get projects by assignee ID", async () => {
    const mockProjects: any = [
      {
        projectid: 1,
        projectname: "Bug Tracker App",
        description: "A comprehensive bug tracking application",
        createdby: 1,
        assignedto: 2,
        createdat: new Date("2025-10-30T14:30:00Z")
      },
      {
        projectid: 2,
        projectname: "Task Manager",
        description: "Simple task management tool",
        createdby: 1,
        assignedto: 2,
        createdat: new Date("2025-11-01T10:00:00Z")
      }
    ];

    (ProjectRepository.getProjectsByAssignee as jest.Mock).mockResolvedValue(mockProjects);

    const projects = await ProjectServices.getProjectsByAssignee(2);

    expect(projects).toEqual(mockProjects);
    expect(ProjectRepository.getProjectsByAssignee).toHaveBeenCalledWith(2);
  });

  it("should create a project successfully", async () => {
    const mockProjectData = {
      projectname: "New Project",
      description: "A new project description",
      createdby: 1,
      assignedto: 2
    };

    const mockCreatedProject = {
      projectid: 1,
      ...mockProjectData,
      createdat: new Date("2025-11-04T12:00:00Z")
    };

    const mockUser = {
      userid: 1,
      username: "testuser",
      email: "test@example.com",
      passwordhash: "hashedpassword",
      role: "user",
      createdat: new Date()
    };

    (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
    (ProjectRepository.createProject as jest.Mock).mockResolvedValue(mockCreatedProject);

    const project = await ProjectServices.createProject(mockProjectData);

    expect(project).toEqual(mockCreatedProject);
    expect(UserRepository.getUserById).toHaveBeenCalledWith(1);
    expect(ProjectRepository.createProject).toHaveBeenCalledWith(mockProjectData);
  });

  it("should update a project successfully", async () => {
    const mockUpdateData = {
      projectname: "Updated Project Name",
      description: "Updated description",
      assignedto: 3
    };

    const mockUpdatedProject = {
      projectid: 1,
      projectname: "Updated Project Name",
      description: "Updated description",
      createdby: 1,
      assignedto: 3,
      createdat: new Date("2025-10-30T14:30:00Z")
    };

    (ProjectRepository.updateProject as jest.Mock).mockResolvedValue(mockUpdatedProject);

    const project = await ProjectServices.updateProject(1, mockUpdateData);

    expect(project).toEqual(mockUpdatedProject);
    expect(ProjectRepository.updateProject).toHaveBeenCalledWith(1, mockUpdateData);
  });

  it("should delete a project successfully", async () => {
    (ProjectRepository.deleteProject as jest.Mock).mockResolvedValue(true);

    const result = await ProjectServices.deleteProject(1);

    expect(result).toBe(true);
    expect(ProjectRepository.deleteProject).toHaveBeenCalledWith(1);
  });

  // Additional fail tests for edge cases
  it("should fail to get project by ID with invalid ID", async () => {
    await expect(ProjectServices.getProjectById(NaN)).rejects.toThrow('Invalid project ID');
  });

  it("should fail to get projects by assignee with invalid assignee ID", async () => {
    await expect(ProjectServices.getProjectsByAssignee(NaN)).rejects.toThrow('Invalid assignee ID');
  });

  it("should fail to create project without data", async () => {
    await expect(ProjectServices.createProject(null)).rejects.toThrow("Please provide project data");
  });

  it("should fail to create project with missing required fields", async () => {
    const incompleteData = {
      description: "Some description"
      // Missing projectname and createdby
    };

    await expect(ProjectServices.createProject(incompleteData)).rejects.toThrow(
      "Missing required fields: projectname and createdby are required"
    );
  });

  it("should fail to create project with invalid field types", async () => {
    const invalidData = {
      projectname: 123, // Should be string
      createdby: "not a number" // Should be number
    };

    await expect(ProjectServices.createProject(invalidData)).rejects.toThrow(
      "Invalid field types: projectname must be string, createdby must be number"
    );
  });

  it("should fail to create project with empty project name", async () => {
    const emptyNameData = {
      projectname: "   ",
      createdby: 1
    };

    const mockUser = {
      UserID: 1,
      Username: "testuser",
      Email: "test@example.com",
      PasswordHash: "hashedpassword",
      Role: "user",
      CreatedAt: new Date()
    };

    (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

    await expect(ProjectServices.createProject(emptyNameData)).rejects.toThrow(
      "ProjectName cannot be empty"
    );
  });

  it("should fail to create project with invalid user ID", async () => {
    const invalidUserData = {
      projectname: "Valid Project",
      createdby: 999
    };

    (UserRepository.getUserById as jest.Mock).mockResolvedValue(null);

    await expect(ProjectServices.createProject(invalidUserData)).rejects.toThrow(
      "Invalid CreatedBy: User does not exist"
    );
  });

  it("should fail to update project with invalid project ID", async () => {
    const updateData = {
      projectname: "Updated name"
    };

    await expect(ProjectServices.updateProject(NaN, updateData)).rejects.toThrow('Invalid project ID');
  });

  it("should fail to update project without data", async () => {
    await expect(ProjectServices.updateProject(1, null)).rejects.toThrow("No update data provided");
  });

  it("should fail to update project with empty object", async () => {
    await expect(ProjectServices.updateProject(1, {})).rejects.toThrow("No update data provided");
  });

  it("should fail to update project with invalid project name", async () => {
    const invalidUpdateData = {
      projectname: "   "
    };

    await expect(ProjectServices.updateProject(1, invalidUpdateData)).rejects.toThrow(
      "Invalid ProjectName: Must be non-empty string"
    );
  });

  it("should fail to delete project with invalid ID", async () => {
    await expect(ProjectServices.deleteProject(NaN)).rejects.toThrow('Invalid project ID');
  });
});