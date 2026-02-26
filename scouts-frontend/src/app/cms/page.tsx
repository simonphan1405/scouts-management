export default function CmsIndexPage() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground text-lg">
          Select a table from the sidebar
        </p>
        <p className="text-muted-foreground text-sm">
          Choose a table on the left to view and manage its records.
        </p>
      </div>
    </div>
  );
}
