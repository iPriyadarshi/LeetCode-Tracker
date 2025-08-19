'use server';

export type LeetcodeStats = {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
};

export async function fetchLeetcodeStats(username: string): Promise<LeetcodeStats | null> {
  const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql';
  const query = `
    query userProblemsSolved($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        problemsSolvedBeatsStats {
          difficulty
          percentage
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': `https://leetcode.com/${username}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          username,
        },
      }),
    });

    if (!response.ok) {
      console.error(`LeetCode API request failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.errors || !data.data.matchedUser) {
      console.error(`Could not find user: ${username}`, data.errors);
      return null;
    }

    const stats = data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const totalSolved = stats.find((s: any) => s.difficulty === 'All').count;
    const easySolved = stats.find((s: any) => s.difficulty === 'Easy').count;
    const mediumSolved = stats.find((s: any) => s.difficulty === 'Medium').count;
    const hardSolved = stats.find((s: any) => s.difficulty === 'Hard').count;

    return {
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
    };
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    return null;
  }
}
