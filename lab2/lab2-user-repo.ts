import { User, CreateUserInput, UpdateUserInput, UserRepository } from './lab2-types';

// In-memory implementation of UserRepository for testing
export class InMemoryUserRepository implements UserRepository {
    private users: User[] = [];

    async findById(id: string): Promise<User | null> {
        const user = this.users.find(u => u.id === id);
        return user || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = this.users.find(u => u.email === email);
        return user || null;
    }

    async findAll(filter?: { role?: string }): Promise<User[]> {
        if (filter?.role) {
            return this.users.filter(u => u.role === filter.role);
        }
        return this.users;
    }

    async create(input: CreateUserInput): Promise<User> {
        const newUser: User = {
            id: (Math.random() * 1000000).toFixed(0),
            name: input.name,
            email: input.email,
            role: input.role,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.push(newUser);
        return newUser;
    }

    async update(id: string, input: UpdateUserInput): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        Object.assign(user, input, { updatedAt: new Date() });
        return user;
    }

    async delete(id: string): Promise<void> {
        this.users = this.users.filter(u => u.id !== id);
    }
}

/** Raised when a user API request fails or returns a non-OK response. */
export class ApiError extends Error {
    constructor(message: string, public readonly status?: number) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Fetches a single user's data from the API.
 * @param id - The user's unique identifier.
 * @param baseUrl - Base URL of the users API.
 * @returns The requested user.
 * @throws {ApiError} If the request fails or the response is not OK.
 * @example
 * const user = await fetchUser('123', 'https://api.example.com');
 */
export async function fetchUser(id: string, baseUrl: string): Promise<User> {
    let response: Response;

    try {
        response = await fetch(`${baseUrl}/users/${id}`);
    } catch (error) {
        throw new ApiError(`Network error while fetching user ${id}: ${(error as Error).message}`);
    }

    if (!response.ok) {
        throw new ApiError(`Failed to fetch user ${id}: ${response.status} ${response.statusText}`, response.status);
    }

    return response.json() as Promise<User>;
}
