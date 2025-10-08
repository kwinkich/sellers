import { ReportForm } from "@/feature/practice-evaluation-feature/practice-report/ui/ReportForm";

export const EvaluationReportPage = () => {
  // MOCK: forms (as from backend) + submissions (answers)
  const mockForms = [
    {
      id: 67,
      role: "SELLER" as const,
      evaluatedUserId: 16,
      blocks: [
        {
          id: 72,
          type: "TEXT" as const,
          required: true,
          position: 0,
          title: "Форма для продавца",
          scale: null,
          items: [] as any[],
        },
        {
          id: 73,
          type: "SCALE_SKILL_SINGLE" as const,
          required: true,
          position: 1,
          title: "",
          scale: {
            id: 7,
            options: [
              { id: 25, label: "НЕТ", value: -2, ord: 0, countsTowardsScore: true },
              { id: 26, label: "50/50", value: -1, ord: 1, countsTowardsScore: true },
              { id: 27, label: "ДА", value: 1, ord: 2, countsTowardsScore: true },
              { id: 28, label: "?", value: 2, ord: 3, countsTowardsScore: false },
            ],
          },
          items: [
            { id: 84, title: "Проявляет интерес", position: 0, skillId: 6 },
            { id: 85, title: "Уважает покупателя", position: 1, skillId: 6 },
          ],
        },
        {
          id: 74,
          type: "QA" as const,
          required: true,
          position: 2,
          title: "Как вам этот продавец",
          scale: null,
          items: [] as any[],
        },
      ],
      title: "Форма продавца",
      descr: "Сценарий для продавца",
    },
    {
      id: 68,
      role: "BUYER" as const,
      evaluatedUserId: 18,
      blocks: [
        {
          id: 75,
          type: "SCALE_SKILL_MULTI" as const,
          required: true,
          position: 0,
          title: "",
          scale: {
            id: 8,
            options: [
              { id: 29, label: "плохо", value: -1, ord: 0, countsTowardsScore: true },
              { id: 30, label: "хорошо", value: 0, ord: 1, countsTowardsScore: true },
              { id: 31, label: "отлично", value: 1, ord: 2, countsTowardsScore: true },
            ],
          },
          items: [
            { id: 86, title: "Выявление боли", position: 0, skillId: 11 },
            { id: 87, title: "Понимание приоритетов", position: 1, skillId: 10 },
            { id: 88, title: "Понимание ресурсов", position: 2, skillId: 9 },
          ],
        },
        {
          id: 76,
          type: "QA" as const,
          required: true,
          position: 1,
          title: "Ваши комментарии по поводу работы покупателя",
          scale: null,
          items: [] as any[],
        },
      ],
      title: "Форма покупателя",
      descr: "Сценарий для покупателя",
    },
  ];

  const mockSubmissions = {
    submissions: [
      {
        evaluatedUserId: 16,
        answers: [
          { blockId: 73, itemId: 84, selectedOptionId: 25, targetSkillId: 6 },
          { blockId: 73, itemId: 85, selectedOptionId: 27, targetSkillId: 6 },
          { blockId: 74, textAnswer: "Отличн" },
        ],
      },
      {
        evaluatedUserId: 18,
        answers: [
          { blockId: 75, itemId: 86, selectedOptionId: 31, targetSkillId: 11 },
          { blockId: 75, itemId: 87, selectedOptionId: 30, targetSkillId: 10 },
          { blockId: 75, itemId: 88, selectedOptionId: 31, targetSkillId: 9 },
          { blockId: 76, textAnswer: "Пойдет" },
        ],
      },
    ],
  };

  const formsWithAnswers = mockForms.map((f) => ({
    ...f,
    answers: mockSubmissions.submissions.find((s) => s.evaluatedUserId === f.evaluatedUserId)?.answers || [],
  }));

  return <ReportForm formsData={formsWithAnswers as any} />;
};


