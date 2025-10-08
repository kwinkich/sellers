import type { EvaluationBlock } from "./index";
import { TextEvaluationBlock } from "./blocks/index";
import { QAEvaluationBlock } from "./blocks/index";
import { ScaleSingleEvaluationBlock } from "./blocks/index";
import { ScaleMultiEvaluationBlock } from "./blocks/index";

interface EvaluationBlocksProps {
	blocks: EvaluationBlock[];
	formRole: string;
}

export const EvaluationBlocks = ({
	blocks,
	formRole,
}: EvaluationBlocksProps) => {
	return (
		<>
			{blocks.map((block) => (
				<EvaluationBlockRenderer
					key={`${formRole}-${block.position}`}
					block={block}
					formRole={formRole}
				/>
			))}
		</>
	);
};

// Universal block renderer component
const EvaluationBlockRenderer = ({
	block,
	formRole,
}: {
	block: EvaluationBlock;
	formRole: string;
}) => {
	switch (block.type) {
		case "TEXT":
			return <TextEvaluationBlock block={block} />;
		case "QA":
			return <QAEvaluationBlock block={block} formRole={formRole} />;
		case "SCALE_SKILL_SINGLE":
			return <ScaleSingleEvaluationBlock block={block} formRole={formRole} />;
		case "SCALE_SKILL_MULTI":
			return <ScaleMultiEvaluationBlock block={block} formRole={formRole} />;
		default:
			return null;
	}
};
