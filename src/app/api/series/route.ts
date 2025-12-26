import { db } from '@/db';
import { seriesTable } from '@/db/schema';
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
      where.push(eq(seriesTable.userId, Number(userIdParam)));
    }

    if (searchParam) {
      where.push(ilike(seriesTable.name, `%${searchParam}%`));
    }

    if (statusParam && isValidStatus(statusParam)) {
      where.push(eq(seriesTable.status, statusParam));
    }

    const filter = where.length ? and(...where) : undefined;

    const [series, [{ count: totalCount }]] = await Promise.all([
      db.query.seriesTable.findMany({
        where: filter,
        orderBy: (series, { desc }) => [desc(series.createdAt)],
        columns: {
          id: true,
          name: true,
          season: true,
          episode: true,
          status: true,
        },
        limit,
        offset,
      }),
      db.select({ count: count() }).from(seriesTable).where(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return Response.json({
      data: series,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const existing = await db.query.seriesTable.findFirst({
      where: and(
        eq(seriesTable.userId, Number(body.userId)),
        ilike(seriesTable.name, body.name)
      ),
    });
    if (existing) {
      return Response.json(
        {
          status: 'error',
          error: 'Series name already exists',
        },
        { status: 409 }
      );
    }
    await db.insert(seriesTable).values(body);
    return Response.json({
      status: 'success',
      message: 'Series added successfully!',
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: 'Failed to added series',
        status: 'error',
      },
      { status: 500 }
    );
  }
}
