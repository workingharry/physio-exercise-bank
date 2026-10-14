import { Exercise } from '../types/exercise';
import rawData from './lowerLimbExercises.json';

export const lowerLimbExercises: Exercise[] = rawData as unknown as Exercise[];

export const allExercises: Exercise[] = lowerLimbExercises;

export const getExerciseById = (id: string): Exercise | undefined => {
  return allExercises.find(e => e.id === id);
};
