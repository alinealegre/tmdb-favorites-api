export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "TMDB Favorites API",
    version: "1.0.0",
    description:
      "REST API for searching movies on TMDB, managing favorites, marking movies as watched, and rating them.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Health", description: "Service health checks" },
    { name: "Movies", description: "TMDB movie search" },
    { name: "Favorites", description: "Favorite movies management" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
          "503": {
            description: "Service is degraded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
    "/movies/search": {
      get: {
        tags: ["Movies"],
        summary: "Search movies",
        description:
          "Proxy search to TMDB. Returns a simplified list of movies.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string", minLength: 1 },
            description: "Search term",
          },
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
          },
        ],
        responses: {
          "200": {
            description: "Search results",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SearchMoviesResponse" },
              },
            },
          },
          "422": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "502": {
            description: "TMDB client error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "503": {
            description: "TMDB unavailable",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "504": {
            description: "TMDB timeout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "List favorites",
        description:
          "Returns favorites enriched from TMDB when available. If TMDB is unavailable, returns local snapshots with degraded=true.",
        responses: {
          "200": {
            description: "Favorites list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ListFavoritesResponse" },
                example: {
                  data: [
                    {
                      id: "a84e5aa4-844c-46ac-b827-75fe553d5224",
                      tmdbId: 603,
                      title: "The Matrix",
                      releaseYear: 1999,
                      posterPath: "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg",
                      overview:
                        "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
                      watchedAt: "2026-07-05T04:02:25.935Z",
                      rating: 9.5,
                      enriched: true,
                    },
                  ],
                  degraded: false,
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Favorites"],
        summary: "Add favorite",
        description:
          "Fetches movie details from TMDB and stores a local snapshot.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddFavoriteBody" },
              example: { tmdbId: 603 },
            },
          },
        },
        responses: {
          "201": {
            description: "Favorite created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Favorite" },
              },
            },
          },
          "404": {
            description: "Movie not found on TMDB",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Movie already in favorites",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "422": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "503": {
            description: "TMDB unavailable",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "502": {
            description: "TMDB client error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "504": {
            description: "TMDB timeout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/favorites/{tmdbId}": {
      delete: {
        tags: ["Favorites"],
        summary: "Remove favorite",
        parameters: [{ $ref: "#/components/parameters/TmdbId" }],
        responses: {
          "204": { description: "Favorite removed" },
          "404": {
            description: "Favorite not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "422": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/favorites/{tmdbId}/watched": {
      patch: {
        tags: ["Favorites"],
        summary: "Mark favorite as watched",
        description:
          "Sets watchedAt to the current timestamp. Calling this endpoint more than once updates watchedAt (idempotent from the client perspective).",
        parameters: [{ $ref: "#/components/parameters/TmdbId" }],
        responses: {
          "200": {
            description: "Favorite updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Favorite" },
              },
            },
          },
          "404": {
            description: "Favorite not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "422": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/favorites/{tmdbId}/rating": {
      patch: {
        tags: ["Favorites"],
        summary: "Rate favorite",
        description:
          "Rates a favorite movie. A movie must be marked as watched before it can be rated.",
        parameters: [{ $ref: "#/components/parameters/TmdbId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RateFavoriteBody" },
              example: { rating: 9.5 },
            },
          },
        },
        responses: {
          "200": {
            description: "Favorite updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Favorite" },
              },
            },
          },
          "404": {
            description: "Favorite not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "422": {
            description: "Validation error or movie not watched yet",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    parameters: {
      TmdbId: {
        name: "tmdbId",
        in: "path",
        required: true,
        schema: { type: "integer", minimum: 1 },
        description: "TMDB movie identifier",
      },
    },
    schemas: {
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ok", "degraded"] },
          timestamp: { type: "string", format: "date-time" },
          services: {
            type: "object",
            properties: {
              database: {
                type: "string",
                enum: ["connected", "disconnected"],
              },
              redis: {
                type: "string",
                enum: ["connected", "disconnected", "not_configured"],
              },
            },
          },
        },
      },
      MovieSummary: {
        type: "object",
        properties: {
          tmdbId: { type: "integer", example: 603 },
          title: { type: "string", example: "The Matrix" },
          releaseYear: { type: "integer", nullable: true, example: 1999 },
          posterPath: {
            type: "string",
            nullable: true,
            example: "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg",
          },
          overview: { type: "string", nullable: true },
        },
      },
      SearchMoviesResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/MovieSummary" },
          },
          page: { type: "integer", example: 1 },
          totalPages: { type: "integer", example: 5 },
          totalResults: { type: "integer", example: 91 },
        },
      },
      Favorite: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          tmdbId: { type: "integer", example: 603 },
          title: { type: "string", example: "The Matrix" },
          releaseYear: { type: "integer", nullable: true, example: 1999 },
          posterPath: { type: "string", nullable: true },
          overview: { type: "string", nullable: true },
          watchedAt: { type: "string", format: "date-time", nullable: true },
          rating: { type: "number", nullable: true, example: 9.5 },
        },
      },
      FavoriteListItem: {
        allOf: [
          { $ref: "#/components/schemas/Favorite" },
          {
            type: "object",
            properties: {
              enriched: { type: "boolean", example: true },
            },
          },
        ],
      },
      ListFavoritesResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/FavoriteListItem" },
          },
          degraded: { type: "boolean", example: false },
        },
      },
      AddFavoriteBody: {
        type: "object",
        required: ["tmdbId"],
        properties: {
          tmdbId: { type: "integer", minimum: 1, example: 603 },
        },
      },
      RateFavoriteBody: {
        type: "object",
        required: ["rating"],
        properties: {
          rating: {
            type: "number",
            minimum: 0,
            maximum: 10,
            example: 9.5,
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string" },
              statusCode: { type: "integer", example: 422 },
            },
          },
        },
      },
    },
  },
} as const;
