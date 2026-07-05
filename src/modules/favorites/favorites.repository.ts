import { Favorite, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { ConflictError } from "../../shared/errors/app-error";

export interface CreateFavoriteData {
  tmdbId: number;
  title: string;
  releaseYear: number | null;
  posterPath: string | null;
  overview: string | null;
}

export async function findAllFavorites(): Promise<Favorite[]> {
  return prisma.favorite.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function findFavoriteByTmdbId(
  tmdbId: number,
): Promise<Favorite | null> {
  return prisma.favorite.findUnique({
    where: { tmdbId },
  });
}

export async function createFavorite(
  data: CreateFavoriteData,
): Promise<Favorite> {
  try {
    return await prisma.favorite.create({ data });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError("Movie is already in favorites");
    }

    throw error;
  }
}

export async function deleteFavoriteByTmdbId(tmdbId: number): Promise<boolean> {
  try {
    await prisma.favorite.delete({
      where: { tmdbId },
    });
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return false;
    }

    throw error;
  }
}
