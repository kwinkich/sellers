import type { EvaluationBlock } from "./index";
import { TextEvaluationBlock } from "./blocks/index";
import { QAEvaluationBlock } from "./blocks/index";
import { ScaleSingleEvaluationBlock } from "./blocks/index";
import { ScaleMultiEvaluationBlock } from "./blocks/index";

interface EvaluationBlocksProps {
  blocks: EvaluationBlock[];
  formRole: string;
  onAnswersChange?: (answers: any) => void;
}

export const EvaluationBlocks = ({ blocks, formRole, onAnswersChange }: EvaluationBlocksProps) => {
  return (
    <>
      {blocks.map((block, index) => (
        <EvaluationBlockRenderer 
          key={`${formRole}-${block.position}`}
          block={block}
          formRole={formRole}
          onAnswersChange={onAnswersChange}
        />
      ))}
    </>
  );
};

// Universal block renderer component
const EvaluationBlockRenderer = ({ 
  block, 
  formRole,
  onAnswersChange
}: { 
  block: EvaluationBlock; 
  formRole: string;
  onAnswersChange?: (answers: any) => void;
}) => {
  switch (block.type) {
    case "TEXT":
      return <TextEvaluationBlock block={block}/>;
    case "QA":
      return <QAEvaluationBlock block={block} formRole={formRole} onChange={(d)=>onAnswersChange?.({kind:"QA", ...d})} />;
    case "SCALE_SKILL_SINGLE":
      return <ScaleSingleEvaluationBlock block={block} formRole={formRole} onChange={(d)=>onAnswersChange?.({kind:"SINGLE", ...d})} />;
    case "SCALE_SKILL_MULTI":
      return <ScaleMultiEvaluationBlock block={block} formRole={formRole} onChange={(d)=>onAnswersChange?.({kind:"MULTI", ...d})} />;
    default:
      return null;
  }
};
