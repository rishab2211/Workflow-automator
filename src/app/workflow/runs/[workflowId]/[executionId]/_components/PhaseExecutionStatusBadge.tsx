import { ExecutionPhaseStatus } from "@/app/types/Workflows"
import { CircleCheckIcon, CircleDashedIcon, CircleXIcon, Loader2Icon } from "lucide-react";

const PhaseExecutionStatusBadge = ({status} : {status : ExecutionPhaseStatus}) => {
  switch (status) {
    case ExecutionPhaseStatus.PENDING:
        return (<CircleDashedIcon />)
        break;
    case ExecutionPhaseStatus.RUNNING:
        return (<Loader2Icon  className="animate-spin text-yellow-500"/>)
        break;
    case ExecutionPhaseStatus.COMPLETED:
        return (<CircleCheckIcon className="text-green-600"/>)
        break;
    case ExecutionPhaseStatus.FAILED:
        return (<CircleXIcon className="text-destructive"/>)
        break;
    default:
        return <p>{status}</p>
        break;
  }
}

export default PhaseExecutionStatusBadge