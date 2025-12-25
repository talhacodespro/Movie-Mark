import { db } from '@/db';
import { movieTable } from '@/db/schema';
import { isValidStatus } from '@/types/enum';
import { and, eq, count, ilike } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search')?.trim();
    const userIdParam = searchParams.get('userId');
    const pageParam = searchParams.get('page') || '1';
    const limitParam = searchParams.get('limit') || '10';

    const page = Math.max(1, parseInt(pageParam));
    const limit = Math.max(1, parseInt(limitParam));
    const offset = (page - 1) * limit;

    const where = [];

    if (userIdParam) {
      where.push(eq(movieTable.userId, Number(userIdParam)));
    }

    if (searchParam) {
      where.push(ilike(movieTable.name, `%${searchParam}%`));
    }

    if (statusParam && isValidStatus(statusParam)) {
      where.push(eq(movieTable.status, statusParam));
    }

    const filter = where.length ? and(...where) : undefined;

    const [movies, [{ count: totalCount }]] = await Promise.all([
      db.query.movieTable.findMany({
        where: filter,
        orderBy: (movie, { desc }) => [desc(movie.createdAt)],
        columns: {
          id: true,
          name: true,
          part: true,
          status: true,
        },
        limit,
        offset,
      }),
      db.select({ count: count() }).from(movieTable).where(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return Response.json({
      data: movies,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const existing = await db.query.movieTable.findFirst({
      where: and(
        eq(movieTable.userId, Number(body.userId)),
        ilike(movieTable.name, body.name)
      ),
    });
    if (existing) {
      return Response.json(
        {
          status: 'error',
          error: 'Movie name already exists',
        },
        { status: 409 }
      );
    }
    await db.insert(movieTable).values(body);
    return Response.json({
      status: 'success',
      message: 'Movie added successfully!',
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: 'Failed to added movie',
        status: 'error',
      },
      { status: 500 }
    );
  }
}
