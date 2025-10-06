import { AddBlockDrawer } from "./index";
import { TextBlock } from "./index";
import { QuestionBlock } from "./index";
import { AssessYN50Block } from "./index";
import { Assess1to5Block } from "./index";

export type BlockKind = "TEXT" | "QA" | "SCALE_MULTIPLE" | "SCALE_SINGLE";

export interface ScenarioBlockItem {
  id: string;
  type: BlockKind;
  prebuiltSkills?: number[]; // For pre-built blocks with predefined skills
}

const renderBlock = (block: ScenarioBlockItem, onRemove: (id: string) => void) => {
  switch (block.type) {
    case "TEXT":
      return <TextBlock key={block.id} id={block.id} onDelete={() => onRemove(block.id)} />;
    case "QA":
      return <QuestionBlock key={block.id} id={block.id} onDelete={() => onRemove(block.id)} />;
    case "SCALE_MULTIPLE":
      return <AssessYN50Block key={block.id} id={block.id} onDelete={() => onRemove(block.id)} />;
    case "SCALE_SINGLE":
      return <Assess1to5Block key={block.id} id={block.id} onDelete={() => onRemove(block.id)} prebuiltSkills={block.prebuiltSkills} />;
    default:
      return null;
  }
};

export function BlocksContainer({ blocks, onAdd, onRemove }: { blocks: ScenarioBlockItem[]; onAdd: (type: BlockKind) => void; onRemove: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((b) => renderBlock(b, onRemove))}
      <AddBlockDrawer onPick={onAdd} />
    </div>
  );
}


