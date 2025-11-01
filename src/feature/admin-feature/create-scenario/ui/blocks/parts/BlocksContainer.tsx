import { AddBlockDrawer } from "./index";
import { TextBlock } from "./index";
import { QuestionBlock } from "./index";
import { AssessYN50Block } from "./index";
import { Assess1to5Block } from "./index";
import React from "react";

export type BlockKind =
  | "TEXT"
  | "QA"
  | "SCALE_SKILL_MULTI"
  | "SCALE_SKILL_SINGLE";

export interface ScenarioBlockItem {
  id: string;
  type: BlockKind;
  prebuiltSkills?: number[]; // For pre-built blocks with predefined skills
  // Extended properties for data collection
  textContent?: string;
  questionContent?: string;
  selectedSkillId?: number;
  questions?: Array<{ id: string; text: string; skillId: number }>;
  scaleOptions?: Array<{
    label: string;
    value: number;
    countsTowardsScore: boolean;
    ord: number;
  }>;
  selectedSkills?: number[];
  scaleOptionsMulti?: Array<{
    label: string;
    value: number;
    countsTowardsScore: boolean;
    ord: number;
  }>;
}

const renderBlock = (
  block: ScenarioBlockItem,
  onRemove: (id: string) => void,
  onDataChange?: (id: string, data: any) => void,
  showValidation?: boolean,
  touchedBlocks?: Set<string>
) => {
  // Show validation if: validation was triggered OR block has been touched
  const isTouched = touchedBlocks?.has(block.id) ?? false;
  const shouldShowValidation = showValidation || isTouched;

  switch (block.type) {
    case "TEXT":
      return (
        <TextBlock
          key={block.id}
          id={block.id}
          onDelete={() => onRemove(block.id)}
          textContent={block.textContent}
          onTextChange={(text) =>
            onDataChange?.(block.id, { textContent: text })
          }
          showValidation={shouldShowValidation}
        />
      );
    case "QA":
      return (
        <QuestionBlock
          key={block.id}
          id={block.id}
          onDelete={() => onRemove(block.id)}
          questionContent={block.questionContent}
          onQuestionChange={(question) =>
            onDataChange?.(block.id, { questionContent: question })
          }
          showValidation={shouldShowValidation}
        />
      );
    case "SCALE_SKILL_SINGLE":
      return (
        <AssessYN50Block
          key={block.id}
          id={block.id}
          onDelete={() => onRemove(block.id)}
          selectedSkillId={block.selectedSkillId}
          questions={block.questions}
          scaleOptions={block.scaleOptions}
          onDataChange={(data) => onDataChange?.(block.id, data)}
          showValidation={shouldShowValidation}
        />
      );
    case "SCALE_SKILL_MULTI":
      return (
        <Assess1to5Block
          key={block.id}
          id={block.id}
          onDelete={() => onRemove(block.id)}
          prebuiltSkills={block.prebuiltSkills}
          selectedSkills={block.selectedSkills}
          scaleOptionsMulti={block.scaleOptionsMulti}
          onDataChange={(data) => onDataChange?.(block.id, data)}
          showValidation={shouldShowValidation}
        />
      );
    default:
      return null;
  }
};

export const BlocksContainer = React.memo(function BlocksContainer({
  blocks,
  onAdd,
  onRemove,
  onDataChange,
  showValidation,
  touchedBlocks,
}: {
  blocks: ScenarioBlockItem[];
  onAdd: (type: BlockKind) => void;
  onRemove: (id: string) => void;
  onDataChange?: (id: string, data: any) => void;
  showValidation?: boolean;
  touchedBlocks?: Set<string>;
}) {
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((b) =>
        renderBlock(b, onRemove, onDataChange, showValidation, touchedBlocks)
      )}
      <AddBlockDrawer onPick={onAdd} />
    </div>
  );
});
