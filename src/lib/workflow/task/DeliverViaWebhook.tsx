import { TaskParamType, TaskType } from "@/app/types/tasks";
import { WorkflowTask } from "@/app/types/Workflows";
import {
  CodeIcon,
  GlobeIcon,
  LucideProps,
  MousePointerClick,
  SendIcon,
  TextIcon,
} from "lucide-react";

export const DeliverViaWebhook = {
  type: TaskType.DELIVER_VIA_WEBHOOK,
  label: "Deliver via Webhook",
  icon: (props) => <SendIcon className=" stroke-blue-400 " {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: "Target URL",
      type: TaskParamType.STRING,
      required: true,
    },
    {
      name: "Body",
      type: TaskParamType.STRING,
      required: true,
    },
  ] as const,
  outputs: [] as const,
} satisfies WorkflowTask;
