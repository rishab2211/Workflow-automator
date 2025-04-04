import Topbar from "@/app/workflow/_components/topbar/Topbar";
import React, { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RunExecutionSidebar } from "./_components/RunExecutionSidebar";
import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionWithPhases";
import NotFound from "@/app/not-found";

type ExecutionData = Awaited<ReturnType<typeof GetWorkflowExecutionWithPhases>>;
const layout = async ({
  children,
  params,
  initialData,
}: {
  children: ReactNode;
  params: {
    executionId: string;
    workflowId: string;
  };
  initialData: ExecutionData;
}) => {
  const { workflowId } = await params;
  const { executionId } = await params;

  const workflowExecution = await GetWorkflowExecutionWithPhases(executionId);
  if (!workflowExecution) {
    return <NotFound />;
  }

  return (
    <div className="  w-full flex  flex-col">
      <Topbar
        workflowId={workflowId}
        title="workflow run details"
        subtitle={`Run ID : ${executionId}`}
        hideButtons={true}
      />
      <SidebarProvider>
        <RunExecutionSidebar initialData={workflowExecution} />

        <main className="w-full">
          <SidebarTrigger className=" fixed bg-background" />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
};

export default layout;
