import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import {
  type UnjumbleCheckAnswerRequest,
  type UnjumbleCheckAnswerResponse,
  type UnjumblePuzzle,
} from '@/common/interface/games/unjumble.interface';

import { shuffleWord } from './utils/shuffle.util';

export class UnjumbleService {
  async getPuzzle(): Promise<UnjumblePuzzle> {
    const data = await prisma.unjumble.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!data) throw new Error('Puzzle not found');

    return {
      id: Number(data.id),
      jumbled: shuffleWord(data.question),
      difficulty: 'normal', // karena schema tidak punya difficulty
    };
  }

  async checkAnswer(
    body: UnjumbleCheckAnswerRequest,
  ): Promise<UnjumbleCheckAnswerResponse> {
    const real = await prisma.unjumble.findUnique({
      where: { id: String(body.questionId) },
    });

    if (!real) throw new Error('Question not found');

    const correct = real.answer.toLowerCase() === body.answer.toLowerCase();

    return {
      status: true,
      correct,
      message: correct ? 'Correct Answer' : 'Wrong Answer',
      score: correct ? 10 : 0,
    };
  }

  async addPlayCount(): Promise<void> {
    const template = await prisma.gameTemplates.findUnique({
      where: { slug: 'unjumble' },
    });

    if (!template) throw new Error('Template not found');

    await prisma.games.updateMany({
      where: { id: template.id },
      data: { total_played: { increment: 1 } }
    });
  }
}

export const unjumbleService = new UnjumbleService();
