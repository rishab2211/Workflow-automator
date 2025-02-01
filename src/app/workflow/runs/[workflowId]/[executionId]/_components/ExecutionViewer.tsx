"use client";

import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionWithPhases";
import { useQuery } from "@tanstack/react-query";
import { CoinsIcon, Loader2Icon, TimerIcon } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { DatesToDurationString } from "@/lib/helper";
import { useSearchParams } from "next/navigation";
import { GetWorkflowPhaseDetails } from "@/actions/workflows/getPhaseDetails";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExecutionLog } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ExecutionData = Awaited<ReturnType<typeof GetWorkflowExecutionWithPhases>>;

const ExecutionViewer = ({ initialData }: { initialData: ExecutionData }) => {
  const searchParams = useSearchParams();
  const selectedPhase = searchParams.get("phase");

  const phaseDetails = useQuery({
    queryKey: ["phaseDetails", selectedPhase],
    enabled: selectedPhase !== null,
    queryFn: () => {
      if (!selectedPhase) {
        throw new Error("No phase selected");
      }
      return GetWorkflowPhaseDetails(selectedPhase);
    },
  });

  return (
    <div className="h-full lg:px-40 w-full flex-1 overflow-hidden pl-2 pt-7">
      <div className="p-4 h-full">
        {/* if No phase is selected  */}
        {!selectedPhase && (
          <div className="flex h-full flex-col pb-20 items-center justify-center text-gray-600">
            <p className="font-bold ">No phase selected.</p>
            <p>Select a phase to view details.</p>
          </div>
        )}

        {/* if phase is selected but it is loading or running */}
        {selectedPhase && phaseDetails.isLoading && (
          <div className="flex h-full items-center justify-center gap-2">
            <p>Running</p>
            <Loader2Icon className="h-5 w-5 animate-spin" />
          </div>
        )}

        {/* if phase is selected and now not running and have some data with it */}
        {selectedPhase && !phaseDetails.isLoading && phaseDetails.data && (
          <div className="flex flex-col py-4 container gap-4 overflow-auto ">
            {/* phase details */}
            <div className="flex gap-2 items-center">
              <Badge variant={"outline"} className="space-x-4 ">
                <CoinsIcon size={20} className=" stroke-muted-foreground " />
                <span>Credits</span>
                <span>{phaseDetails.data.creditCost}</span>
              </Badge>

              <Badge variant={"outline"} className="space-x-4 ">
                <TimerIcon size={20} className=" stroke-muted-foreground " />
                <span>Duration</span>
                <span>
                  {DatesToDurationString(
                    phaseDetails.data.completedAt,
                    phaseDetails.data.startedAt
                  ) || "---"}
                </span>
              </Badge>
            </div>

            <ParameterViewer
              title={"Inputs"}
              subTitle={"Inputs used for this phase"}
              paramsJson={phaseDetails.data.inputs}
            />
            <ParameterViewer
              title={"Outputs"}
              subTitle={"Outputs genereated by this phase"}
              paramsJson={phaseDetails.data.outputs}
            />

            <LogViewer logs={phaseDetails.data.logs} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionViewer;

function ParameterViewer({
  title,
  subTitle,
  paramsJson,
}: {
  title: string;
  subTitle?: string;
  paramsJson?: string | null;
}) {
  const params = paramsJson ? JSON.parse(paramsJson) : undefined;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {subTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex flex-col gap-2">
            {(!params || Object.keys(params).length === 0) && (
              <p className="text-sm">No parameters generated by this phase</p>
            )}
            {params &&
              Object.entries(params).map(([Key, value]) => (
                <div key={Key} className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground flex-1 basis-1/3">
                    {Key}
                  </p>
                  <Input
                    readOnly
                    className="flex-1 basis-2/3"
                    value={value as string}
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LogViewer({ logs }: { logs: ExecutionLog[] | undefined }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          {/* <CardDescription className="text-sm text-muted-foreground ">
            Logs generated by current phase
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Logs generated by current phase</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="hover:bg-gray-100 ">Time</TableHead>
                <TableHead className="hover:bg-gray-100 ">Level</TableHead>
                <TableHead className="hover:bg-gray-100 ">Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs &&
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.timestamp.toISOString()}</TableCell>
                    <TableCell
                      className={cn(
                        "uppercase",
                        log.logLevel === "error"
                          ? "text-destructive"
                          : "text-primary",
                        log.logLevel === "info" ? "text-green-600" : ""
                      )}
                    >
                      {log.logLevel}
                    </TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
