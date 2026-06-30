export const sampleJson = {
  apiVersion: "2.3",
  endpoint: "/users/search",
  timestamp: "2024-06-30T10:30:00Z",
  totalResults: 3,
  results: [
    {
      id: "usr_a1b2c3",
      name: "Alice Johnson",
      email: "alice@example.com",
      profile: {
        avatar: "https://example.com/avatars/alice.jpg",
        joinedAt: "2023-01-15",
        role: "admin",
        permissions: ["read", "write", "delete", "manage_users"],
      },
      lastLogin: "2024-06-29T08:15:00Z",
      active: true,
    },
    {
      id: "usr_d4e5f6",
      name: "Bob Chen",
      email: "bob@example.com",
      profile: {
        avatar: "https://example.com/avatars/bob.jpg",
        joinedAt: "2023-06-20",
        role: "editor",
        permissions: ["read", "write"],
      },
      lastLogin: "2024-06-28T14:30:00Z",
      active: true,
    },
    {
      id: "usr_g7h8i9",
      name: "Charlie Davis",
      email: "charlie@example.com",
      profile: {
        avatar: "https://example.com/avatars/charlie.jpg",
        joinedAt: "2024-02-01",
        role: "viewer",
        permissions: ["read"],
      },
      lastLogin: "2024-06-25T09:45:00Z",
      active: false,
    },
  ],
  pagination: {
    page: 1,
    perPage: 10,
    totalPages: 1,
  },
};
