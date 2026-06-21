import MovieDetailClient from '@/components/movie/MovieDetailClient';

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MovieDetailClient movieId={parseInt(id)} />;
}
