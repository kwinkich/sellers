import type { EvaluationBlock } from "./index";
import { TextEvaluationBlock } from "./blocks/index";
import { QAEvaluationBlock } from "./blocks/index";
import { ScaleSingleEvaluationBlock } from "./blocks/index";
import { ScaleMultiEvaluationBlock } from "./blocks/index";

interface EvaluationBlocksProps {
  blocks: EvaluationBlock[];
  formRole: string;
  onAnswersChange?: (answers: any) => void;
  showValidation?: boolean;
  invalidPositions?: Set<number>;
}

export const EvaluationBlocks = ({
  blocks,
  formRole,
  onAnswersChange,
  showValidation,
  invalidPositions,
}: EvaluationBlocksProps) => {
  return (
    <>
      {blocks.map((block) => {
        const isInvalid =
          !!showValidation && !!invalidPositions?.has(block.position);

        return (
          <div
            key={`${formRole}-${block.position}`}
            data-eval-block={`${formRole}-${block.position}`}
            className="scroll-mt-20"
          >
            <EvaluationBlockRenderer
              block={block}
              formRole={formRole}
              onAnswersChange={onAnswersChange}
              showValidation={!!showValidation}
              isInvalid={isInvalid}
            />
          </div>
        );
      })}
    </>
  );
};

// Universal block renderer component
const EvaluationBlockRenderer = ({ 
  block, 
  formRole,
  onAnswersChange,
  showValidation,
  isInvalid,
}: { 
  block: EvaluationBlock; 
  formRole: string;
  onAnswersChange?: (answers: any) => void;
  showValidation?: boolean;
  isInvalid?: boolean;
}) => {
  switch (block.type) {
    case "TEXT":
      return <TextEvaluationBlock block={block}/>;
    case "QA":
      return (
        <QAEvaluationBlock
          block={block}
          formRole={formRole}
          showValidation={showValidation}
          isInvalid={isInvalid}
          onChange={(d) => onAnswersChange?.({ kind: "QA", ...d })}
        />
      );
    case "SCALE_SKILL_SINGLE":
      return (
        <ScaleSingleEvaluationBlock
          block={block}
          formRole={formRole}
          showValidation={showValidation}
          isInvalid={isInvalid}
          onChange={(d) => onAnswersChange?.({ kind: "SINGLE", ...d })}
        />
      );
    case "SCALE_SKILL_MULTI":
      return (
        <ScaleMultiEvaluationBlock
          block={block}
          formRole={formRole}
          showValidation={showValidation}
          isInvalid={isInvalid}
          onChange={(d) => onAnswersChange?.({ kind: "MULTI", ...d })}
        />
      );
    default:
      return null;
  }
};
