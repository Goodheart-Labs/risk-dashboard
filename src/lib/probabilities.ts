export const namedProbabilities = {
  3: "Very unlikely",
  8: "Little chance",
  20: "Unlikely",
  23: "Probably not",
  40: "Maybe",
  50: "About even",
  57: "Better than even",
  68: "Probably",
  74: "Likely",
  80: "Very good chance",
  90: "Highly likely",
  97: "Almost certain",
};

export function getProbabilityWord(value: number): string {
  const percentValue = value * 100;
  const probabilities = Object.keys(namedProbabilities).map(Number);
  const closest = probabilities.reduce((prev, curr) =>
    Math.abs(curr - percentValue) < Math.abs(prev - percentValue) ? curr : prev,
  );
  return namedProbabilities[closest as keyof typeof namedProbabilities];
}

export function getProbabilityColor(value: number): string {
  const percentValue = value * 100;
  if (percentValue <= 20) return "text-green-600 font-bold";
  if (percentValue <= 40) return "text-green-500 font-semibold";
  if (percentValue <= 50) return "text-yellow-600 font-semibold";
  if (percentValue <= 70) return "text-orange-500 font-semibold";
  if (percentValue <= 90) return "text-red-500 font-bold";
  return "text-red-600 font-extrabold";
}
