export default function MovieSkeleton() {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      <div className="aspect-[2/3] w-full rounded-2xl bg-slate-800" />
      <div className="h-5 w-3/4 rounded-md bg-slate-800" />
      <div className="flex justify-between items-center w-full">
        <div className="h-4 w-1/4 rounded bg-slate-800" />
        <div className="h-4 w-1/3 rounded bg-slate-800" />
      </div>
    </div>
  );
}
