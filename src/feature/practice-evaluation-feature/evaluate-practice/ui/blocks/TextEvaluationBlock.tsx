
import type { EvaluationBlock } from "../EvaluationForm";
import TextareaAutosize from "react-textarea-autosize";

interface TextEvaluationBlockProps {
  block: EvaluationBlock;
}

export const TextEvaluationBlock = ({ block }: TextEvaluationBlockProps) => {
  
  // Use block.title or fallback to empty string
  const text = block.title || "";

  return (
  <TextareaAutosize 
    value={text}
    minRows={1}
    className="w-full bg-gray-100 px-2 pt-1 text-gray-800 text-md border-none rounded-2xl resize-none disabled:opacity-100 overflow-hidden"
    disabled
    readOnly
  />
  );
};
