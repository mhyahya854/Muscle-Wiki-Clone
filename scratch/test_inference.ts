import { inferMovementPattern } from '../src/lib/adapters/normalization';

const testCases = [
  { name: 'Lat Pulldown', region: 'back', cat: 'strength', muscles: ['lats'], expected: 'pull' },
  { name: 'Face Pull', region: 'shoulders', cat: 'strength', muscles: ['rear_delts'], expected: 'pull' },
  { name: 'Push Press', region: 'shoulders', cat: 'strength', muscles: ['front_delts'], expected: 'push' },
  { name: 'Dumbbell Lateral Raise', region: 'shoulders', cat: 'strength', muscles: ['lateral_delts'], expected: 'isolation' },
  { name: 'Bulgarian Split Squat', region: 'legs', cat: 'strength', muscles: ['quads'], expected: 'squat' },
  { name: 'Deadlift', region: 'legs', cat: 'strength', muscles: ['glutes', 'hamstrings'], expected: 'hinge' },
  { name: 'Hammer Curl', region: 'arms', cat: 'strength', muscles: ['biceps'], expected: 'isolation' },
  { name: 'Tricep Pressdown', region: 'arms', cat: 'strength', muscles: ['triceps'], expected: 'isolation' },
  { name: 'Straight Arm Pulldown', region: 'back', cat: 'strength', muscles: ['lats'], expected: 'isolation' }, // Tricky: usually pull but often considered isolation for lats
  { name: 'Leg Extension', region: 'legs', cat: 'strength', muscles: ['quads'], expected: 'isolation' },
];

for (const tc of testCases) {
  const result = inferMovementPattern(tc.region as any, tc.cat, tc.name, tc.muscles as any);
  console.log(`${tc.name.padEnd(25)} | Result: ${result.padEnd(10)} | Expected: ${tc.expected.padEnd(10)} | ${result === tc.expected ? '✅' : '❌'}`);
}
