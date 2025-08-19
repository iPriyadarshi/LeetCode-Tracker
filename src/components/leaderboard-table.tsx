"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import type { StudentData } from "@/types";
import { studentData as rawStudentData } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Upload, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fetchLeetcodeStats } from "@/lib/leetcode";

type SortConfig = {
  key: keyof StudentData;
  direction: "ascending" | "descending";
};

type CsvStudent = {
  rollNumber: string;
  name: string;
  leetcodeUsername: string;
};

const SortableHeader = ({
  children,
  columnKey,
  sortConfig,
  requestSort,
}: {
  children: React.ReactNode;
  columnKey: keyof StudentData;
  sortConfig: SortConfig | null;
  requestSort: (key: keyof StudentData) => void;
}) => {
  const isSorted = sortConfig?.key === columnKey;
  
  const getSortIcon = () => {
    if (!isSorted) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="h-4 w-4 text-accent-foreground" />;
    }
    return <ArrowDown className="h-4 w-4 text-accent-foreground" />;
  };

  return (
    <TableHead
      className={`cursor-pointer transition-colors hover:bg-accent/50 ${isSorted ? "bg-accent/50" : ""}`}
      onClick={() => requestSort(columnKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        {getSortIcon()}
      </div>
    </TableHead>
  );
};


export function LeaderboardTable() {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'rank', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [studentData, setStudentData] = useState<Omit<StudentData, 'rank'>[]>(rawStudentData);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const ITEMS_PER_PAGE = 15;

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const parsedData = parseCSV(text);
        if (parsedData.length === 0) {
          throw new Error("CSV file is empty or invalid.");
        }
        
        const fetchedStudentData: Omit<StudentData, 'rank'>[] = [];

        for (let i = 0; i < parsedData.length; i++) {
          const student = parsedData[i];
          try {
            const stats = await fetchLeetcodeStats(student.leetcodeUsername);
            if (stats) {
              fetchedStudentData.push({
                id: i + 1,
                rollNumber: student.rollNumber,
                name: student.name,
                leetcodeUsername: student.leetcodeUsername,
                ...stats,
              });
            } else {
              // Handle case where user not found or other API error
               fetchedStudentData.push({
                id: i + 1,
                rollNumber: student.rollNumber,
                name: student.name,
                leetcodeUsername: student.leetcodeUsername,
                totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
              });
            }
          } catch (error) {
             console.error(`Failed to fetch stats for ${student.leetcodeUsername}:`, error);
             // Still add the student to the list but with 0s
             fetchedStudentData.push({
                id: i + 1,
                rollNumber: student.rollNumber,
                name: student.name,
                leetcodeUsername: student.leetcodeUsername,
                totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
              });
          }
        }
        
        setStudentData(fetchedStudentData);
        setCurrentPage(1);
        setSortConfig({ key: 'rank', direction: 'ascending' });
        toast({
          title: "Success",
          description: `Processed ${fetchedStudentData.length} students successfully.`,
        });
      } catch (error) {
        let message = "An unknown error occurred.";
        if (error instanceof Error) {
          message = error.message;
        }
        console.error("Failed to process CSV:", error);
        toast({
          variant: "destructive",
          title: "Error Processing CSV",
          description: message,
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
       toast({
          variant: "destructive",
          title: "Error Reading File",
          description: "There was an issue reading the file.",
        });
       setIsProcessing(false);
    }
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): CsvStudent[] => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders: (keyof CsvStudent)[] = [
      'rollNumber', 'name', 'leetcodeUsername'
    ];
    
    const hasAllHeaders = requiredHeaders.every(h => headers.includes(h));
    if(!hasAllHeaders) {
      throw new Error(`CSV must include the following headers: ${requiredHeaders.join(', ')}`);
    }

    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const entry: any = {};
      headers.forEach((header, i) => {
        const key = header as keyof CsvStudent;
        if(requiredHeaders.includes(key)) {
            entry[key] = values[i].trim();
        }
      });
      return entry as CsvStudent;
    });
  };

  const processedData = useMemo(() => {
    const sortedBySolved = [...studentData].sort((a, b) => b.totalSolved - a.totalSolved);
  
    let rank = 0;
    let lastScore = -1;
    const rankedData: StudentData[] = sortedBySolved.map((student, index) => {
      if (student.totalSolved !== lastScore) {
        rank = index + 1;
        lastScore = student.totalSolved;
      }
      return { ...student, rank };
    });
  
    if (sortConfig !== null) {
      return [...rankedData].sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
  
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return rankedData;
  }, [studentData, sortConfig]);
  
  const requestSort = (key: keyof StudentData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedData = processedData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
           <p className="text-sm text-muted-foreground">
            Showing {paginatedData.length} of {processedData.length} students
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={isProcessing} />
            <Button asChild disabled={isProcessing}>
                <label htmlFor="csv-upload" className="cursor-pointer">
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Upload />}
                    {isProcessing ? "Processing..." : "Upload CSV"}
                </label>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">S. No.</TableHead>
                <SortableHeader columnKey="rank" sortConfig={sortConfig} requestSort={requestSort}>Rank</SortableHeader>
                <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort}>Name</SortableHeader>
                <SortableHeader columnKey="rollNumber" sortConfig={sortConfig} requestSort={requestSort}>Roll Number</SortableHeader>
                <TableHead>LeetCode Profile</TableHead>
                <SortableHeader columnKey="totalSolved" sortConfig={sortConfig} requestSort={requestSort}>Total Solved</SortableHeader>
                <SortableHeader columnKey="easySolved" sortConfig={sortConfig} requestSort={requestSort}>Easy</SortableHeader>
                <SortableHeader columnKey="mediumSolved" sortConfig={sortConfig} requestSort={requestSort}>Medium</SortableHeader>
                <SortableHeader columnKey="hardSolved" sortConfig={sortConfig} requestSort={requestSort}>Hard</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell className="font-medium">{student.rank}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>
                    <a
                      href={`https://leetcode.com/${student.leetcodeUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {student.leetcodeUsername}
                    </a>
                  </TableCell>
                  <TableCell className="font-semibold">{student.totalSolved}</TableCell>
                  <TableCell>{student.easySolved}</TableCell>
                  <TableCell>{student.mediumSolved}</TableCell>
                  <TableCell>{student.hardSolved}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
