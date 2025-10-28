import type { FormRole } from "@/entities";
import type { FormBlock } from "@/entities/scenarios/model/types/scenarios.types";
import { ViewTextBlock, ViewQuestionBlock, ViewAssessYN50Block, ViewAssess1to5Block } from "./blocks";

interface ViewBlocksContainerProps {
  blocks: FormBlock[];
  role: FormRole;
}

export function ViewBlocksContainer({ blocks, role }: ViewBlocksContainerProps) {
  if (blocks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Нет блоков для роли {role}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <ViewBlock key={block.id || index} block={block} />
      ))}
    </div>
  );
}

interface ViewBlockProps {
  block: FormBlock;
}

function ViewBlock({ block }: ViewBlockProps) {
  const renderBlock = () => {
    switch (block.type) {
      case "TEXT":
        return <ViewTextBlock title={block.title} />;

      case "QA":
        return <ViewQuestionBlock title={block.title} />;

      case "SCALE_SKILL_SINGLE":
        return (
          <ViewAssessYN50Block
            selectedSkillId={block.items?.[0]?.skillId}
            questions={block.items}
            scaleOptions={block.scale?.options}
          />
        );

      case "SCALE_SKILL_MULTI":
        return (
          <ViewAssess1to5Block
            items={block.items}
            scaleOptions={block.scale?.options}
          />
        );

      default:
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Неизвестный тип блока: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="mb-4">
      {renderBlock()}
    </div>
  );
}
