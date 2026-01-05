/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Plus } from "lucide-react"

export interface PartialEditorAddExtensionProps { }

const PartialEditorAddExtension = (props: PartialEditorAddExtensionProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="border-dashed size-8"
          >
            <Plus className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Add custom extension
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default PartialEditorAddExtension
