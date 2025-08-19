import type { StudentData } from '@/types';

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Ananya", "Diya", "Saanvi", "Aadhya", "Myra", "Aarohi", "Ira", "Riya", "Siya", "Pari", "Rahul", "Priya", "Amit", "Sneha", "Vikram"];
const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Reddy", "Mehta", "Jain", "Shah", "Khan", "Malhotra", "Kapoor", "Agarwal", "Mishra", "Chopra", "Rao", "Iyer", "Nair", "Pillai", "Joshi", "Das", "Roy", "Bose"];

// Use a seed for reproducibility of random data
let seed = 1;
function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

export const studentData: Omit<StudentData, 'rank'>[] = Array.from({ length: 150 }, (_, i) => {
  const totalSolved = Math.floor(random() * 800) + 50;
  const easySolved = Math.floor(totalSolved * (random() * 0.4 + 0.3)); // 30-70% easy
  const hardSolved = Math.floor(totalSolved * (random() * 0.2)); // 0-20% hard
  const mediumSolved = totalSolved - easySolved - hardSolved;
  const name = `${firstNames[Math.floor(random() * firstNames.length)]} ${lastNames[Math.floor(random() * lastNames.length)]}`;

  return {
    id: i + 1,
    rollNumber: `21CS${(1000 + i + 1).toString()}`,
    name: name,
    leetcodeUsername: `${name.toLowerCase().replace(' ', '')}${Math.floor(random() * 100)}`,
    totalSolved: totalSolved,
    easySolved: easySolved,
    mediumSolved: mediumSolved,
    hardSolved: hardSolved,
  };
});
