export function getGrade(score: number) {
  if (score >= 75) return { grade: "A", gpa: 4.0 };
  if (score >= 65) return { grade: "B", gpa: 3.0 };
  if (score >= 55) return { grade: "C", gpa: 2.0 };
  if (score >= 45) return { grade: "D", gpa: 1.0 };
  return { grade: "F", gpa: 0.0 };
}
export function calculateGPA(grades: number[]) {
  if (grades.length === 0) return 0.0;
  const totalGPA = grades.reduce((acc, score) => acc + getGrade(score).gpa, 0);
  return parseFloat((totalGPA / grades.length).toFixed(2));
}
export function calculateAverageScore(grades: number[]) {
  if (grades.length === 0) return 0.0;
  const totalScore = grades.reduce((acc, score) => acc + score, 0);
  return parseFloat((totalScore / grades.length).toFixed(2));
}
export function getGradeDistribution(grades: number[]) {
  const distribution = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  grades.forEach((score) => {
    const { grade } = getGrade(score);
    distribution[grade as keyof typeof distribution]++;
  });

  return distribution;
}
