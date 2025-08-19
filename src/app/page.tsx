import { LeaderboardTable } from '@/components/leaderboard-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background">
      <div className="w-full max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline">
            LeetBoard
          </h1>
          <p className="text-muted-foreground mt-2">
            Student Leaderboard for LeetCode Performance
          </p>
        </header>
        <LeaderboardTable />
        <footer className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>CSV Format Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        To upload your own student data, please ensure your CSV file contains the following headers:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <code className="bg-muted px-2 py-1 rounded-md text-sm">rollNumber</code>
                        <code className="bg-muted px-2 py-1 rounded-md text-sm">name</code>
                        <code className="bg-muted px-2 py-1 rounded-md text-sm">leetcodeUsername</code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                        The app will fetch the LeetCode statistics automatically based on the provided usernames.
                    </p>
                </CardContent>
            </Card>
        </footer>
      </div>
    </main>
  );
}
